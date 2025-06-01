'use client';
import { useEffect, useState, use } from 'react';
import { db } from '@/firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function RestaurantPage({ params }) {
  const { subdomain } = use(params);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch restaurant
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
        setCategories(categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // 3. Fetch menu items
        const menuSnapshot = await getDocs(
          collection(db, 'restaurants', restaurantDoc.id, 'menu')
        );
        setMenuItems(menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) fetchData();
  }, [subdomain]);

  // Cart functions
  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.price * item.quantity),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {restaurant.logoUrl && (
                <img 
                  src={restaurant.logoUrl} 
                  alt={`${restaurant.name} logo`}
                  className="h-12 w-12 object-contain rounded-full border border-gray-200"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
            </div>
            <button 
              onClick={() => setCartVisible(!cartVisible)}
              className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Categories Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 mr-2 rounded-full ${
              !activeCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 mr-2 rounded-full ${
                activeCategory === category.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems
            .filter(item => !activeCategory || item.categoryId === activeCategory)
            .map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {item.imageUrl && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-lg text-gray-800">{item.name}</p>
                    <span className="font-bold text-purple-600">${item.price?.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-800 text-sm mt-2">{item.description}</p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform ${
        cartVisible ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out z-50`}>
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
              <p className="text-gray-800 text-center py-8">Your cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-800">${item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 text-gray-800 hover:text-purple-600"
                    >
                      -
                    </button>
                    <span className="mx-2 w-8 text-center text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 text-gray-800 hover:text-purple-600"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between mb-4">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}