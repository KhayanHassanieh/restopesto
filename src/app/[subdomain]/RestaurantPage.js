'use client';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, getDoc, doc, query, where, updateDoc, orderBy } from 'firebase/firestore';

import MenuItem from '@/components/MenuItem';
import CheckoutForm from '@/components/CheckoutForm';
import LocationPicker from '@/components/LocationPicker';
import RestaurantFooter from '@/components/RestaurantFooter';
import Stepper, { Step } from '@/components/Stepper';
import { getCart, addItemToCart, createCart, subscribeToCart, updateCartItemQuantity, removeItemFromCart } from '@/utils/cartService';
import { createOrder, clearCart } from '@/utils/orderService';
import { isRestaurantOpen } from '@/utils/openingHours';
import { toast } from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';

export default function RestaurantPage({ subdomain }) {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [items, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedRemovables, setSelectedRemovables] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isComboSelected, setIsComboSelected] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [shareableUrl, setShareableUrl] = useState('');
  const searchParams = useSearchParams();
  const incomingCartId = searchParams.get('cartId');
  const [cartStatus, setCartStatus] = useState('active');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const stepperRef = useRef(() => {});
  const [orderData, setOrderData] = useState(null);
  const [location, setLocation] = useState(null);
  const [branches, setBranches] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const isOpen = restaurant ? (isRestaurantOpen(restaurant.hours) && restaurant.isOpen !== false) : false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantQuery = await getDocs(
          query(collection(db, 'restaurants'), where('subdomain', '==', subdomain))
        );

        if (restaurantQuery.empty) throw new Error('Restaurant not found');

        const restaurantDoc = restaurantQuery.docs[0];
        const restaurantId = restaurantDoc.id;
        const restaurantData = restaurantDoc.data();

        setRestaurant({ id: restaurantId, ...restaurantDoc.data() });
        // 🛑 If the restaurant is inactive, stop further loading
        if (restaurantData.isActive === false) {
          setLoading(false);
          return;
        }
        const categoriesSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantId, 'categories')
        );
        const cats = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);

        const menuQuery = query(
          collection(db, 'restaurants', restaurantId, 'menu'),
          orderBy('sortOrder')
        );
        const menuSnapshot = await getDocs(menuQuery);

        const itemsWithAddons = await Promise.all(
          menuSnapshot.docs.map(async (docSnap, index) => {
            const data = docSnap.data();
            const addonsSnapshot = await getDocs(
              collection(db, 'restaurants', restaurantId, 'menu', docSnap.id, 'addons')
            );
            const addons = addonsSnapshot.docs.map(addonDoc => ({
              id: addonDoc.id,
              ...addonDoc.data()
            }));

            return {
              id: docSnap.id,
              ...data,
              sortOrder:
                typeof data.sortOrder === 'number'
                  ? data.sortOrder
                  : parseInt(data.sortOrder, 10) || index,
              addons
            };
          })
        );

        itemsWithAddons.sort((a, b) => a.sortOrder - b.sortOrder);
        setMenuItems(itemsWithAddons);


        const branchesSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantId, 'branches')
        );
        const processedBranches = branchesSnapshot.docs.map(doc => {
          const branchData = doc.data();
          return {
            id: doc.id,
            city: branchData.city,
            areas: Array.isArray(branchData.areas)
              ? branchData.areas
              : Object.values(branchData.areas || {})
          };
        });
        setBranches(processedBranches);

        if (incomingCartId) {
          try {
            const existingCart = await getCart(incomingCartId);
            if (existingCart.status === 'completed') {
              router.replace('/');
            } else {
              setCartId(incomingCartId);
            }
          } catch (err) {
            console.error('Failed to fetch cart', err);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) fetchData();
  }, [subdomain]);

  useEffect(() => {
    if (!cartId) return;

    const unsubscribe = subscribeToCart(cartId, (cartData) => {
      setCart(cartData.items || []);
      setCartStatus(cartData.status || 'active');
    });

    return () => unsubscribe();
  }, [cartId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && cartId) {
      setShareableUrl(`${window.location.origin}?cartId=${cartId}`);
    }
  }, [cartId]);



  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 10);
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (restaurant?.theme) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', restaurant.theme.primaryColor || '#7b68ee');
      root.style.setProperty('--theme-background', restaurant.theme.backgroundColor || '#ffffff');
      root.style.setProperty('--theme-accent', restaurant.theme.accentColor || '#f76c5e');
    }
  }, [restaurant]);


  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const filteredMenuItems = searchTerm
    ? menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : menuItems;
  const addToCart = async (
    item,
    selectedAddons = [],
    selectedRemovables = [],
    quantity = 1,
    isComboSelected = false,
    customInstructions = ''
  ) => {
    if (!isOpen) {
      toast.error("We're currently closed.");
      return;
    }
    if (cartStatus === 'completed') return; // 🔒 Guard
    let activeCartId = cartId;

    if (!activeCartId) {
      activeCartId = await createCart({ restaurantId: restaurant.id });
      setCartId(activeCartId);
      router.replace(`?cartId=${activeCartId}`);
    }

    // ✅ Always subscribe after having a valid cart ID
    if (activeCartId) {
      subscribeToCart(activeCartId, (cartData) => {
        setCart(cartData.items || []);
      });
    }



    const basePrice = isComboSelected && item.comboPrice ? item.comboPrice : item.price;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    const finalTotal = (basePrice + addonsTotal) * quantity;

    const itemWithCustomization = {
      itemId: item.id,
      name: item.name,
      isComboSelected,
      comboIncludes: isComboSelected ? item.comboIncludes : '',
      basePrice,
      addonsTotal,
      finalTotal,
      selectedAddons,
      selectedRemovables,
      instructions: customInstructions,
      quantity,
      customKey: `${item.id}-${Date.now()}`
    };

    const match = items.find(i =>
      i.itemId === itemWithCustomization.itemId &&
      i.isComboSelected === itemWithCustomization.isComboSelected &&
      JSON.stringify(i.selectedAddons.map(a => a.id).sort()) ===
      JSON.stringify(itemWithCustomization.selectedAddons.map(a => a.id).sort()) &&
      JSON.stringify([...(i.selectedRemovables || [])].sort()) ===
      JSON.stringify([...(itemWithCustomization.selectedRemovables || [])].sort()) &&
      (i.instructions || '') === (itemWithCustomization.instructions || '')
    );

    if (match) {
      await updateQuantity(match.customKey, match.quantity + quantity);
    } else {
      setCart(prev => [...prev, itemWithCustomization]);
      await addItemToCart(activeCartId, itemWithCustomization);
    }

    setSelectedItem(null);
    setQuantity(1);
    setSelectedAddons([]);
    setSelectedRemovables([]);
    setInstructions('');
    setIsComboSelected(false);
  };




  const updateQuantity = async (itemKey, newQuantity) => {
    if (cartStatus === 'completed') return; // 🔒 Guard
    if (newQuantity < 1) {
      await removeFromCart(itemKey);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.customKey === itemKey
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    if (cartId) {
      await updateCartItemQuantity(cartId, itemKey, newQuantity);
    }
  };

  const removeFromCart = async (itemKey) => {
    if (cartStatus === 'completed') return; // 🔒 Guard
    setCart(prev => prev.filter(item => item.customKey !== itemKey));
    if (cartId) {
      await removeItemFromCart(cartId, itemKey);
    }
  };

  const cartTotal = items.reduce((sum, item) => {
    const total =
      typeof item.finalTotal === 'number'
        ? item.finalTotal
        : ((item.basePrice || 0) + (item.addonsTotal || 0)) * (item.quantity || 1);

    return sum + total;
  }, 0);




  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  if (restaurant?.isActive === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
        <div className="max-w-md mx-auto">
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={`${restaurant.name} logo`}
              className="h-40 w-40 md:h-32 md:w-32 object-contain mx-auto mb-6"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {restaurant.name || 'This restaurant'}
          </h1>
          <p className="text-gray-700 text-lg mb-8">is currently out of service.</p>
        </div>

        {/* ✅ Powered by Krave Menus */}
        <div className="mt-20 pb-8">
          <p className="text-sm text-gray-500 mb-2">Powered by</p>
          <img
            src="/logo/Krave Logo.png" // <-- update this path to your actual Krave logo path
            alt="Krave Menus"
            className="h-20 mx-auto"
          />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-gray-800">Restaurant Not Found</h2>
          <p className="text-gray-800">The restaurant &quot;{subdomain}&quot; doesn&apos;t exist in our system.</p>
        </div>
      </div>
    );
  }

  // Group menu items by category
  const menuByCategory = categories.map(category => ({
    ...category,
    items: menuItems.filter(item => item.typeId === category.id)

  }));


  return (
    <div className="min-h-screen"
      style={{ backgroundColor: 'var(--theme-background)' }}>
      {/* Header with Logo */}
      <header className="relative h-64 w-full overflow-hidden">
        <img
          src={restaurant.backgroundImageUrl || '/default-restaurant-bg.jpg'}
          alt="Restaurant background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center">
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={`${restaurant.name} logo`}
              className="h-24 w-24 md:h-32 md:w-32 object-contain rounded-full border-4 border-white bg-white"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md mt-4">
            {restaurant.name}
          </h1>
        </div>
      </header>

      {!isOpen && (
        <div className="bg-red-500 text-white text-center py-2">
          We&apos;re currently closed.
        </div>
      )}

      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3 shadow-sm">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setIsSearching(false);
              }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* Categories Navigation */}
      <div className="sticky top-16 z-30 shadow-sm py-3 px-4"
        style={{ backgroundColor: 'var(--theme-background)' }}>
        <div className="overflow-x-auto">
          <div className="flex justify-center min-w-fit w-max mx-auto space-x-2 pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--theme-accent)'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* All Items Section */}
        {/*<section id="category-all" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Menu Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allItemsCategory.items.map(item => (
              <MenuItem 
                key={item.id} 
                item={item} 
                onSelect={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </section>*/}

        {/* Category Sections */}
        {isSearching ? (
          <section className="container ">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map(item => (
                <MenuItem
                  key={item.id}
                  item={item}
                  onSelect={() => setSelectedItem(item)}
                />
              ))}
            </div>
            {filteredMenuItems.length === 0 && (
              <p className="text-gray-600 text-center py-8">No items found matching &quot;{searchTerm}&quot;</p>
            )}
          </section>
        ) : (
          menuByCategory.map(category => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map(item => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <RestaurantFooter
        hours={restaurant.hours}
        instagramURL={restaurant.instagramURL}
        tiktokURL={restaurant.tiktokURL}
        facebookURL={restaurant.facebookURL}
        primaryColor={restaurant.theme?.primaryColor || '#7b68ee'}
      />


      {/* Item Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
              } pointer-events-auto`}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                setSelectedItem(null);
                setInstructions('');
              }, 300);
            }}
          />

          {/* Modal Panel */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl w-full h-[80vh] transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'
              } pointer-events-auto flex flex-col`}
          >
            {/* Static Header */}
            <div className="px-6 pt-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedItem.name}</h3>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      setSelectedItem(null);
                      setInstructions('');
                    }, 300);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedItem.imageUrl && (
                <div className="h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-gray-800 mb-4">{selectedItem.description}</p>
            </div>

            {/* Scrollable Add-ons & Removables */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
              {selectedItem.isCombo && (
                <div className="mb-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isComboSelected}
                      onChange={(e) => setIsComboSelected(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-orange-600 rounded"
                    />
                    <span className="text-gray-800">
                      {selectedItem.comboPrice > selectedItem.price
                        ? `Get as combo +$${(selectedItem.comboPrice - selectedItem.price).toFixed(2)}`
                        : `Get as combo (save $${(selectedItem.price - selectedItem.comboPrice).toFixed(2)})`}
                    </span>

                  </label>
                  <p className="text-gray-600 text-sm mt-1">{selectedItem.comboIncludes}</p>
                </div>
              )}


              {/* Add-ons */}
              {selectedItem.addons?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Add-ons</h4>
                  <div className="space-y-2">
                    {selectedItem.addons.map(addon => (
                      <label key={addon.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedAddons.some(a => a.id === addon.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddons([...selectedAddons, addon]);
                            } else {
                              setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-orange-600 rounded"
                        />
                        <span className="text-gray-800">{addon.name}</span>
                        {addon.price > 0 && (
                          <span className="ml-auto text-gray-800">+${addon.price.toFixed(2)}</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Removables */}
              {selectedItem.remove?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Remove Ingredients</h4>
                  <div className="space-y-2">
                    {selectedItem.remove.map(removable => (
                      <label key={removable} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedRemovables.includes(removable)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRemovables([...selectedRemovables, removable]);
                            } else {
                              setSelectedRemovables(selectedRemovables.filter(r => r !== removable));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-orange-600 rounded"
                        />
                        <span className="text-gray-800">{removable}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Instructions</h4>
                <textarea
                  className="w-full border-gray-300 rounded-md p-2 text-sm text-gray-800 focus:ring-orange-600 focus:border-orange-600"
                  rows={3}
                  placeholder="Add any special requests"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>


            {/* Sticky Footer */}
            <div className="bg-white border-t p-4">
              <div className="max-w-xl mx-auto flex justify-between items-center gap-4">

                {/* Left side: Price + Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-800">
                    ${(
                      ((isComboSelected ? selectedItem.comboPrice : selectedItem.price) +
                        (selectedAddons?.reduce((sum, a) => sum + (a.price || 0), 0) || 0)) * quantity
                    ).toFixed(2)}


                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity === 1}
                      className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-200 text-gray-800 ${quantity === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      -
                    </button>
                    <span className="text-base font-medium w-6 text-center text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-200 text-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  disabled={!isOpen}
                  onClick={() => {
                    addToCart(
                      selectedItem,
                      selectedAddons,
                      selectedRemovables,
                      quantity,
                      isComboSelected,
                      instructions
                    );
                  }}
                  className={`hover:brightness-120 text-white py-2 px-6 rounded-lg font-medium transition-colors ${!isOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    background: 'var(--theme-primary)',

                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* Shopping Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform ${cartVisible ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40`}>
        <div className="p-6 h-full flex flex-col">
          {/* ✅ Ordered Alert */}
          {cartStatus === 'completed' && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-md text-sm">
              ✅ This order has already been placed. The cart is now locked.
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Your Order</h2>
            <button onClick={() => setCartVisible(false)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-gray-500">Start adding some delicious items!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map(item => (
                  <div key={item.customKey} className="py-4">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">
                          {item.name}
                          {item.isComboSelected && (
                            <span className="ml-2 text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>
                              (Combo)
                            </span>
                          )}
                        </h3>

                        {item.isComboSelected && item.comboIncludes && (
                          <p className="text-sm text-gray-600 mt-1">{item.comboIncludes}</p>
                        )}

                        {item.selectedAddons?.length > 0 && (
                          <div className="mt-1 text-sm text-gray-600">
                            {item.selectedAddons.map(addon => (
                              <div key={addon.id}>+ {addon.name}</div>
                            ))}
                          </div>
                        )}

                        {item.selectedRemovables?.length > 0 && (
                          <div className="mt-1 text-sm text-gray-600">
                            {item.selectedRemovables.map(removable => (
                              <div key={removable}>- {removable}</div>
                            ))}
                          </div>
                        )}

                        {item.instructions && (
                          <div className="mt-1 text-sm text-gray-600">
                            <div>Note: {item.instructions}</div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col items-end">
                        <span className="font-medium text-gray-800">
                          ${item.finalTotal?.toFixed(2) || '0.00'}
                        </span>

                        {/* Quantity controls */}
                        {cartStatus !== 'completed' && (
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => updateQuantity(item.customKey, item.quantity - 1)}
                              disabled={item.quantity === 1}
                              className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 ${item.quantity === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              -
                            </button>
                            <span className="mx-2 w-6 text-center text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.customKey, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove button */}
                    {cartStatus !== 'completed' && (
                      <button
                        onClick={() => removeFromCart(item.customKey)}
                        className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: Share + Totals + Checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={async () => {
                  const urlWithCart = `${window.location.origin}?cartId=${cartId}`;
                  router.replace(`?cartId=${cartId}`);
                  try {
                    await navigator.clipboard.writeText(urlWithCart);
                    // Show toast notification instead of alert
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  } catch (err) {
                    console.error('Failed to copy:', err);
                    // Fallback for browsers that don't support clipboard API
                    const textArea = document.createElement('textarea');
                    textArea.value = urlWithCart;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }
                }}
                className="flex items-center mb-5 gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                <span className="text-sm font-medium">Share Cart</span>
              </button>

              {/* Toast Notification - Add this near your other state declarations */}
              {showToast && (
                <div className="fixed bottom-4 right-4 z-50">
                  <div className="flex items-center bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-md shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cart link copied to clipboard!
                  </div>
                </div>
              )}

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>

              {/* ✅ Disable checkout if ordered */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  disabled={cartStatus === 'completed'}
                  className={`w-full text-white py-3 px-4 rounded-lg font-medium transition-colors ${cartStatus === 'completed' ? 'bg-gray-400 cursor-not-allowed' : ''
                    }`}
                  style={{
                    background: cartStatus === 'completed' ? undefined : 'var(--theme-primary)',
                  }}
                >
                  Proceed to Checkout
                </button>
            </div>
          )}
        </div>
      </div>


      {/* Cart Floating Button */}
      {items.length > 0 && cartStatus !== 'completed' && (
        <button
          onClick={() => setCartVisible(true)}
          className="fixed bottom-6 right-6 hover:brightness-105 text-white p-4 rounded-full shadow-lg z-10 flex items-center"
          style={{
            background: 'var(--theme-primary)',

          }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="ml-2">
            {items.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
          <span className="ml-2 font-bold">
            ${cartTotal.toFixed(2)}
          </span>
        </button>
      )}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Stepper
            initialStep={1}
            onStepChange={(step) => setCurrentStep(step)}
            footerClassName="hidden"
            renderStepIndicator={({ step, currentStep: cs, onStepClick }) => {
              stepperRef.current = onStepClick;
              const status = cs === step ? 'active' : cs > step ? 'complete' : 'inactive';
              const base = 'flex h-8 w-8 items-center justify-center rounded-full text-sm';
              const styles =
                status === 'active'
                  ? 'bg-[var(--theme-primary)] text-white'
                  : status === 'complete'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500';
              return (
                <div className={`${base} ${styles}`} onClick={() => onStepClick(step)}>
                  {status === 'complete' ? '✓' : step}
                </div>
              );
            }}
          >
            <Step>
              <CheckoutForm
                restaurantId={restaurant.id}
                onBack={() => setIsCheckoutOpen(false)}
                onComplete={(addressData) => {
                  setOrderData({
                    ...addressData,
                    items,
                    finalTotal: cartTotal,
                    restaurantId: restaurant.id,
                    cartId,
                  });
                  stepperRef.current(currentStep + 1);
                }}
              />
            </Step>
            <Step>
              <LocationPicker
                initialLocation={location}
                onBack={() => stepperRef.current(currentStep - 1)}
                onConfirm={({ lat, lng, mapUrl }) => {
                  setLocation({ lat, lng });
                  setOrderData((prev) => ({
                    ...prev,
                    lat,
                    lng,
                    mapUrl,
                  }));
                  stepperRef.current(currentStep + 1);
                }}
              />
            </Step>
            <Step>
              <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>

                <div className="space-y-4 mb-6">
                  <div className="p-4 border border-gray-300 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-2">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4 font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Note
                    </label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
                      placeholder="Any notes for the restaurant?"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => stepperRef.current(currentStep - 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const finalOrderData = { ...orderData, orderNote };
                        const orderRef = await createOrder(finalOrderData);
                        let trackUrl = '';
                        if (typeof window !== 'undefined') {
                          if (window.location.hostname.includes('localhost')) {
                            trackUrl = `${window.location.origin}/${subdomain}/track/${orderRef.id}`;
                          } else {
                            trackUrl = `${window.location.origin}/track/${orderRef.id}`;
                          }
                        }

                        // Clear cart locally + remotely
                        setCart([]);
                        await clearCart(cartId);
                        await updateDoc(doc(db, 'carts', cartId), { status: 'completed' });
                        // Fetch phone number of selected branch
                        const branchDoc = await getDoc(doc(db, 'restaurants', finalOrderData.restaurantId, 'branches', finalOrderData.branchId));
                        const phone = branchDoc?.data()?.phone;

                        if (!phone) {
                          alert('Could not find branch phone number.');
                          return;
                        }

                        // Format WhatsApp message
                        const messageLines = [
                          `*New Order*`,
                          `Name: ${finalOrderData.fullName}`,
                          `Phone: +961${finalOrderData.mobileNumber}`,
                          `Region: ${finalOrderData.region}, Area: ${finalOrderData.area}`,
                          `Address: ${finalOrderData.addressDetails}`,
                          `Location: ${finalOrderData.mapUrl}`,
                          `Track Order: ${trackUrl}`,
                          finalOrderData.orderNote ? `Order Note: ${finalOrderData.orderNote}` : '',
                          '',
                          ...finalOrderData.items.map((item, i) => {
                            const line = `${i + 1}. ${item.name} x${item.quantity} - $${item.finalTotal.toFixed(2)}`;
                            const addons = item.selectedAddons?.map(a => `   + ${a.name}`).join('\n') || '';
                            const removables = item.selectedRemovables?.map(r => `   - ${r}`).join('\n') || '';
                            const note = item.instructions ? `   *Note:* ${item.instructions}` : '';
                            return [line, addons, removables, note].filter(Boolean).join('\n');
                          }),
                          '',
                          `Total: $${finalOrderData.finalTotal.toFixed(2)}`
                        ];

                        const encodedMessage = encodeURIComponent(messageLines.filter(Boolean).join('\n'));

                        // ✅ Show thank-you screen in case redirect doesn't work
                        setOrderPlaced(true);
                        setIsCheckoutOpen(false);
                        setCartVisible(false);

                        // 🔁 Redirect to WhatsApp
                        window.location.href = `https://wa.me/${phone}?text=${encodedMessage}`;
                      } catch (error) {
                        console.error('Error placing order:', error);
                        alert('Failed to place order. Please try again.');
                      }
                    }}

                    className="px-4 py-2 text-white rounded-md hover:brightness-110 transition-colors" style={{
                      background: 'var(--theme-primary)',

                    }}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </Step>
          </Stepper>
        </div>
      )}
    </div>
  );
}