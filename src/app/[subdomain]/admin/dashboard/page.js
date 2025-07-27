'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

// Dashboard Components
import OrdersSummary from '@/components/OrdersSummary';
import SalesDashboard from '@/components/SalesDashboard';
import CustomersDashboard from '@/components/CustomersDashboard';
import MenuItemsDashboard from '@/components/MenuItemsDashboard';
import RecentOrders from '@/components/RecentOrders';
import AnalyticsGraph from '@/components/AnalyticsGraph';

export default function DashboardPage() {
    const [restaurantData, setRestaurantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [ordersData, setOrdersData] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [indexError, setIndexError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/admin/login');
            } else {
                await fetchRestaurantData();
            }
        });

        return () => unsubscribe();
    }, [router]);

    const updateOrderInState = async (orderId, updatedData) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                ...updatedData,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating order:', error);
        }

        setOrdersData(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, ...updatedData } : order
            )
        );
    };

    const fetchRestaurantData = async () => {
        let subdomain = "";
        try {
            // Get subdomain from URL path
            if (window.location.hostname.includes("localhost")) {
                const hostParts = window.location.pathname.split('/');
                subdomain = hostParts[1];
            } else {
                const hostParts = window.location.hostname.split('.');
                subdomain = hostParts[0]; // "thecircle" from "thecircle.krave.me"
            }
            // Fetch restaurant document
            const q = query(
                collection(db, 'restaurants'),
                where('subdomain', '==', subdomain)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const restaurantDoc = querySnapshot.docs[0];
                const restaurantId = restaurantDoc.id;
                const branchId =
                    typeof window !== 'undefined'
                        ? localStorage.getItem('branchId')
                        : null;

                setRestaurantData({
                    id: restaurantId,
                    ...restaurantDoc.data()
                });


                // Try to fetch orders with the composite query
                try {
                    const ordersQuery = branchId
                        ? query(
                              collection(db, 'orders'),
                              where('restaurantId', '==', restaurantId),
                              where('branchId', '==', branchId),
                              orderBy('createdAt', 'desc')
                          )
                        : query(
                              collection(db, 'orders'),
                              where('restaurantId', '==', restaurantId),
                              orderBy('createdAt', 'desc')
                          );
                    const ordersSnapshot = await getDocs(ordersQuery);
                    const orders = ordersSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const amount = Number(
                            data.finalTotal ?? data.total ?? data.totalAmount ?? 0
                        ) || 0;
                        const items = Array.isArray(data.items) ? data.items : [];
                        return {
                            id: doc.id,
                            fullName: data.fullName || '',
                            mobileNumber: data.mobileNumber || '',
                            items,
                            addressDetails: data.addressDetails || '',
                            area: data.area || '',
                            region: data.region || '',
                            branchId: data.branchId || '',
                            orderNote: data.orderNote || '',
                            finalTotal: amount,
                            totalAmount: amount,
                            total: amount,
                            status: data.status || 'Ordered',
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date()
                        };
                    });
                    setOrdersData(orders);
                    setIndexError(false);
                } catch (error) {
                    console.error('Order query error:', error);
                    if (error.code === 'failed-precondition') {
                        setIndexError(true);
                    }
                    // Fallback: fetch without ordering
                    const fallbackQuery = branchId
                        ? query(
                              collection(db, 'orders'),
                              where('restaurantId', '==', restaurantId),
                              where('branchId', '==', branchId)
                          )
                        : query(
                              collection(db, 'orders'),
                              where('restaurantId', '==', restaurantId)
                          );
                    const fallbackSnapshot = await getDocs(fallbackQuery);
                    const fallbackOrders = fallbackSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const amount = Number(
                            data.finalTotal ?? data.total ?? data.totalAmount ?? 0
                        ) || 0;
                        const items = Array.isArray(data.items) ? data.items : [];
                        return {
                            id: doc.id,
                            ...data,
                            items,
                            finalTotal: amount,
                            totalAmount: amount,
                            total: amount,
                            status: data.status || 'Ordered',
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date()
                        };
                    });
                    // Sort manually as fallback
                    fallbackOrders.sort((a, b) => b.createdAt - a.createdAt);
                    setOrdersData(fallbackOrders);
                }

                // Fetch menu items, preferring branch-level menu when available
                let menuCollection = branchId
                    ? collection(
                          db,
                          'restaurants',
                          restaurantId,
                          'branches',
                          branchId,
                          'menu'
                      )
                    : collection(db, 'restaurants', restaurantId, 'menu');

                let menuSnapshot = await getDocs(menuCollection);

                if (menuSnapshot.empty && branchId) {
                    // Fallback to restaurant-wide menu if no branch-specific menu
                    menuCollection = collection(
                        db,
                        'restaurants',
                        restaurantId,
                        'menu'
                    );
                    menuSnapshot = await getDocs(menuCollection);
                }

                setMenuItems(
                    menuSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!restaurantData) {
        return <div className="flex justify-center items-center h-screen">Restaurant not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {restaurantData.name}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {restaurantData.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Sales
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'customers' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Customers
                        </button>
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'menu' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Menu Items
                        </button>
                    </div>
                </div>
            </nav>

            {/* Index creation alert */}
            {indexError && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    The orders query requires an index. <a href="https://console.firebase.google.com/v1/r/project/restopesto-a4825/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9yZXN0b3Blc3RvLWE0ODI1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9vcmRlcnMvaW5kZXhlcy9fEAEaEAoMcmVzdGF1cmFudElkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg" target="_blank" rel="noopener noreferrer" className="font-medium underline text-yellow-700 hover:text-yellow-600">Click here to create it</a>. Using fallback sorting until then.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <OrdersSummary orders={ordersData} />
                            <SalesDashboard orders={ordersData} />
                            <CustomersDashboard orders={ordersData} />
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h2>
                            <AnalyticsGraph orders={ordersData} />
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
                            <RecentOrders orders={ordersData.slice(0, 5)}
                                onOrderUpdate={updateOrderInState} />
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">All Orders</h2>
                        <RecentOrders orders={ordersData} showAll onOrderUpdate={updateOrderInState} />
                    </div>
                )}

                {activeTab === 'sales' && (
                    <SalesDashboard orders={ordersData} detailed />
                )}

                {activeTab === 'customers' && (
                    <CustomersDashboard orders={ordersData} detailed />
                )}

                {activeTab === 'menu' && (
                    <MenuItemsDashboard menuItems={menuItems} orders={ordersData} />
                )}
            </main>
        </div>
    );
}