'use client';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import MenuItem from '@/components/MenuItem';

export default function RestaurantPage({ params }) {
  const { subdomain } = params;
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

   useEffect(() => {
    const fetchData = async () => {
      try {
         // 1. Fetch restaurant - REMOVED THE STRAY SEMICOLON HERE
        const restaurantQuery = await getDocs(
          query(collection(db, 'restaurants'), where('subdomain', '==', subdomain))
        );
        
        if (restaurantQuery.empty) throw new Error('Restaurant not found');

        const restaurantDoc = restaurantQuery.docs[0];
        setRestaurant({ id: restaurantDoc.id, ...restaurantDoc.data() });


        // 2. Fetch categories
        const categoriesSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantDoc.id, 'categories')
        );
        const cats = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(cats);

        // 3. Fetch menu items with their addons
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

  // Scroll to category
  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Cart functions
  const addToCart = (item, selectedAddons = [], selectedRemovables = []) => {
    const itemWithCustomization = {
      ...item,
      selectedAddons,
      selectedRemovables,
      customKey: `${item.id}-${Date.now()}` // Unique key for each customized item
    };
    
    setCart(prev => [...prev, itemWithCustomization]);
    setSelectedItem(null);
  };

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemKey);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.customKey === itemKey ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemKey) => {
    setCart(prev => prev.filter(item => item.customKey !== itemKey));
  };

  const cartTotal = cart.reduce(
    (sum, item) => {
      const addonsTotal = item.selectedAddons?.reduce((a, addon) => a + (addon.price || 0), 0) || 0;
      return sum + ((item.price + addonsTotal) * item.quantity);
    },
    0
  );

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
    items: menuItems.filter(item => item.categoryId === category.id)
  }));

  // Add "All Items" category
  const allItemsCategory = {
    id: 'all',
    name: 'All Items',
    items: menuItems
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            {restaurant.logoUrl && (
              <img 
                src={restaurant.logoUrl} 
                alt={`${restaurant.name} logo`}
                className="h-20 w-20 object-contain rounded-full border-2 border-gray-200"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-800 text-center">{restaurant.name}</h1>
          </div>
        </div>
      </header>

      {/* Categories Navigation */}
      <div className="sticky top-28 z-10 bg-white shadow-sm py-3 px-4">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          <button
            onClick={() => scrollToCategory('all')}
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 whitespace-nowrap"
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 whitespace-nowrap"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* All Items Section */}
        <section id="category-all" className="mb-12">
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
        </section>

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

      {/* Mobile Menu (horizontal scroll) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 p-4">
        <div className="flex overflow-x-auto space-x-4">
          {menuItems.map(item => (
            <div key={item.id} className="flex-shrink-0 w-48">
              <MenuItem 
                item={item} 
                onSelect={() => setSelectedItem(item)}
                compact
              />
            </div>
          ))}
        </div>
      </div>

      {/* Item Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedItem.name}</h3>
                <button 
                  onClick={() => setSelectedItem(null)}
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

              <p className="text-gray-800 mb-6">{selectedItem.description}</p>

              {/* Addons */}
              {selectedItem.addons?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Add-ons</h4>
                  <div className="space-y-2">
                    {selectedItem.addons.map(addon => (
                      <label key={addon.id} className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-5 w-5 text-purple-600 rounded"
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
              {selectedItem.removables?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Remove Ingredients</h4>
                  <div className="space-y-2">
                    {selectedItem.removables.map(removable => (
                      <label key={removable} className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-5 w-5 text-purple-600 rounded"
                        />
                        <span className="text-gray-800">{removable}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <span className="text-xl font-bold text-gray-800">${selectedItem.price.toFixed(2)}</span>
                <button 
                  onClick={() => addToCart(selectedItem)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform ${
        cartVisible ? 'translate-x-0' : 'translate-x-full'
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
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
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
                          ${((item.price + (item.selectedAddons?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item.customKey, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
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
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
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
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg z-30 flex items-center"
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