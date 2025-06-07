'use client';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import MenuItem from '@/components/MenuItem';
export default function RestaurantPage({ subdomain }) {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedRemovables, setSelectedRemovables] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isComboSelected, setIsComboSelected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantQuery = await getDocs(
          query(collection(db, 'restaurants'), where('subdomain', '==', subdomain))
        );

        if (restaurantQuery.empty) throw new Error('Restaurant not found');

        const restaurantDoc = restaurantQuery.docs[0];
        setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });

        const categoriesSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantDoc.id, 'categories')
        );
        const cats = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);

        const menuSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantDoc.id, 'menu')
        );

        const itemsWithAddons = await Promise.all(menuSnapshot.docs.map(async doc => {
          const addonsSnapshot = await getDocs(
            collection(db, 'restaurants', restaurantDoc.id, 'menu', doc.id, 'addons')
          );
          const addons = addonsSnapshot.docs.map(addonDoc => ({
            id: addonDoc.id,
            ...addonDoc.data()
          }));

          return {
            id: doc.id,
            ...doc.data(),
            addons
          };
        }));

        setMenuItems(itemsWithAddons);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) fetchData();
  }, [subdomain]);

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
      element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const addToCart = (item, selectedAddons = [], selectedRemovables = [], quantity = 1, isComboSelected = false) => {
    const basePrice = isComboSelected && item.comboPrice ? item.comboPrice : item.price;

    const itemWithCustomization = {
      ...item,
      selectedAddons,
      selectedRemovables,
      quantity,
      isComboSelected,
      finalPrice: basePrice,
      customKey: `${item.id}-${Date.now()}`,
    };

    setCart(prev => [...prev, itemWithCustomization]);
    setSelectedItem(null);
    setQuantity(1);
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemKey);
      return;
    }
    setCart(prev => prev.map(item => item.customKey === itemKey ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (itemKey) => {
    setCart(prev => prev.filter(item => item.customKey !== itemKey));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons?.reduce((a, addon) => a + (addon.price || 0), 0) || 0;
    const quantity = item.quantity || 1;
    return sum + ((item.finalPrice + addonsTotal) * quantity);
  }, 0);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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





      {/* Categories Navigation */}
      <div className="sticky top-0 z-30 shadow-sm py-3 px-4"
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
        {menuByCategory.map(category => (
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
        ))}
      </main>



      {/* Item Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
              } pointer-events-auto`}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => setSelectedItem(null), 300);
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
                    setTimeout(() => setSelectedItem(null), 300);
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
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-200 text-gray-800"
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
                  onClick={() => {
                    addToCart(
                      selectedItem,
                      selectedAddons,
                      selectedRemovables,
                       quantity,
                      isComboSelected
                    );
                  }}
                  className="hover:brightness-120 text-white py-2 px-6 rounded-lg font-medium transition-colors"  style={{
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
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform ${cartVisible ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out z-40`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Your Order</h2>
            <button
              onClick={() => setCartVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-gray-500">Start adding some delicious items!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cart.map(item => (
                  <div key={item.customKey} className="py-4">
                    <div className="flex justify-between">
                      <div className="flex-1">
  <h3 className="font-medium text-gray-800">
    {item.name}
    {item.isComboSelected && (
      <span className="ml-2 text-sm text-orange-500 font-semibold">(Combo)</span>
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
</div>

                      <div className="ml-4 flex flex-col items-end">
  <span className="font-medium text-gray-800">
    ${(
      ((item.isComboSelected && item.comboPrice ? item.comboPrice : item.price) +
        (item.selectedAddons?.reduce((sum, a) => sum + (a.price || 0), 0) || 0)) *
      item.quantity
    ).toFixed(2)}
  </span>
  <div className="flex items-center mt-2">
    <button
      onClick={() => updateQuantity(item.customKey, item.quantity - 1)}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
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
</div>

                    </div>
                    <button
                      onClick={() => removeFromCart(item.customKey)}
                      className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-800">${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="text-gray-800">${(cartTotal * 1.1).toFixed(2)}</span>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Floating Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartVisible(true)}
          className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg z-10 flex items-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="ml-2">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
          <span className="ml-2 font-bold">
            ${cartTotal.toFixed(2)}
          </span>
        </button>
      )}
    </div>
  );
}