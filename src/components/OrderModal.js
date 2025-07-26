'use client';
import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const STATUSES = [
    'Ordered',
    'Confirmed',
    'In Progress',
    'Out for Delivery',
    'Done'
];

export default function OrderModal({
    order: originalOrder,
    mode,
    onClose,
    onSave
}) {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingAddonsIndex, setEditingAddonsIndex] = useState(null);
    const [newAddon, setNewAddon] = useState({ name: '', price: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef();
    const handleShare = () => {
        if (!formData?.id) return;
        let sub;
        if (typeof window !== 'undefined') {
            if (window.location.hostname.includes('localhost')) {
                const parts = window.location.pathname.split('/');
                sub = parts[1];
            } else {
                sub = window.location.hostname.split('.')[0];
            }
        }
        const url = `${window.location.origin}/${sub}/order/${formData.id}`;
        if (navigator.share) {
            navigator.share({ url }).catch(console.error);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard');
        }
    };

    // Close modal when clicking outside
    useEffect(() => {
        // Lock background scroll
        document.body.style.overflow = 'hidden';

        return () => {
            // Restore scroll on cleanup
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (originalOrder) {
            const rawCart = Array.isArray(originalOrder.items)
                ? originalOrder.items
                : [];
            const safeOrder = {
                ...originalOrder,
                cart: rawCart.map(item => ({
                    ...item,
                    name: item.name || 'Unnamed Item',
                    basePrice: Number(item.basePrice) || 0,
                    addonsTotal: Number(item.addonsTotal) || 0,
                    quantity: Number(item.quantity) || 1,
                    selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
                    selectedRemovables: Array.isArray(item.selectedRemovables) ? item.selectedRemovables : [],
                    instructions: item.instructions || ''
                })),
                addressDetails: originalOrder.addressDetails || '',
                area: originalOrder.area || '',
                region: originalOrder.region || '',
                status: originalOrder.status || 'Ordered'
            };
            setFormData(safeOrder);
            setLoading(false);
        }
    }, [originalOrder]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const updatedCart = [...prev.cart];
            updatedCart[index] = { ...updatedCart[index], [field]: value };

            if (field === 'selectedAddons') {
                const addonsTotal = updatedCart[index].selectedAddons.reduce(
                    (sum, addon) => sum + (Number(addon.price) || 0),
                    0
                );
                updatedCart[index].addonsTotal = addonsTotal;
            }

            return { ...prev, cart: updatedCart };
        });
    };

    const calculateItemTotal = (item) => {
        return ((item.basePrice || 0) + (item.addonsTotal || 0)) * (item.quantity || 1);
    };

    const calculateOrderTotal = () => {
        if (!formData?.cart) return 0;
        return formData.cart.reduce(
            (sum, item) => sum + calculateItemTotal(item),
            0
        );
    };

    const handleAddAddon = (itemIndex) => {
        if (!newAddon.name.trim()) return;

        setFormData(prev => {
            const updatedCart = [...prev.cart];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                selectedAddons: [
                    ...updatedCart[itemIndex].selectedAddons,
                    { ...newAddon, price: Number(newAddon.price) || 0 }
                ],
                addonsTotal: updatedCart[itemIndex].addonsTotal + (Number(newAddon.price) || 0)
            };

            return { ...prev, cart: updatedCart };
        });

        setNewAddon({ name: '', price: 0 });
        setEditingAddonsIndex(null);
    };

    const handleRemoveAddon = (itemIndex, addonIndex) => {
        setFormData(prev => {
            const updatedCart = [...prev.cart];
            const removedPrice = updatedCart[itemIndex].selectedAddons[addonIndex].price;
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                selectedAddons: updatedCart[itemIndex].selectedAddons.filter(
                    (_, i) => i !== addonIndex
                ),
                addonsTotal: updatedCart[itemIndex].addonsTotal - removedPrice
            };
            return { ...prev, cart: updatedCart };
        });
    };

    const handleRemovableChange = (itemIndex, removableIndex, value) => {
        setFormData(prev => {
            const updatedCart = [...prev.cart];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                selectedRemovables: updatedCart[itemIndex].selectedRemovables.map(
                    (item, i) => i === removableIndex ? value : item
                )
            };
            return { ...prev, cart: updatedCart };
        });
    };

    const handleAddRemovable = (itemIndex) => {
        setFormData(prev => {
            const updatedCart = [...prev.cart];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                selectedRemovables: [...updatedCart[itemIndex].selectedRemovables, '']
            };
            return { ...prev, cart: updatedCart };
        });
    };

    const handleRemoveRemovable = (itemIndex, removableIndex) => {
        setFormData(prev => {
            const updatedCart = [...prev.cart];
            updatedCart[itemIndex] = {
                ...updatedCart[itemIndex],
                selectedRemovables: updatedCart[itemIndex].selectedRemovables.filter(
                    (_, i) => i !== removableIndex
                )
            };
            return { ...prev, cart: updatedCart };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const orderToSave = {
                ...formData,
                items: formData.cart,
                finalTotal: calculateOrderTotal()
            };
            delete orderToSave.cart;
            await onSave(orderToSave.id, orderToSave);
            onClose();
        } catch (error) {
            console.error('Error saving order:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !formData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading order details...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-300 relative animate-fade-in-up"
            >
                {/* Header with close button */}
                <div className="sticky top-0 backdrop-blur-md bg-white/80 border-b border-gray-300 p-6 flex justify-between items-center rounded-t-2xl z-20">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {mode === 'view' ? 'Order Details' : 'Edit Order'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Order ID: {formData.id}</p>
                    </div>
                    {mode === 'view' && (
                        <button
                            onClick={handleShare}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer mr-2"
                            aria-label="Share order"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0zM19 9v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l5 5 5-5" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Customer and Address Section */}
                    <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                {mode === 'view' ? (
                                    <p className="text-gray-900 bg-white p-2 rounded border border-transparent">{formData.fullName}</p>
                                ) : (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                        required
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                {mode === 'view' ? (
                                    <p className="text-gray-900 bg-white p-2 rounded border border-transparent">{formData.mobileNumber}</p>
                                ) : (
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                        required
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                {mode === 'view' ? (
                                    <p className="text-gray-900 bg-white p-2 rounded border border-transparent">{formData.status}</p>
                                ) : (
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer font-medium"
                                    >
                                        {STATUSES.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Delivery Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                                {mode === 'view' ? (
                                    <p className="text-gray-900 bg-white p-2 rounded border border-transparent">{formData.area || 'N/A'}</p>
                                ) : (
                                    <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                {mode === 'view' ? (
                                    <p className="text-gray-900 bg-white p-2 rounded border border-transparent">{formData.region || 'N/A'}</p>
                                ) : (
                                    <input
                                        type="text"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                    />
                                )}
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Details</label>
                                {mode === 'view' ? (
                                    <p className="text-gray-900 bg-white p-2 rounded border border-transparent min-h-[60px]">{formData.addressDetails || 'N/A'}</p>
                                ) : (
                                    <textarea
                                        name="addressDetails"
                                        value={formData.addressDetails}
                                        onChange={handleChange}
                                        rows={3}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Note */}
                    <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3a2.121 2.121 0 113 3L7 18l-4 1 1-4 12.5-12.5z" />
                            </svg>
                            Order Note
                        </h3>
                        {mode === 'view' ? (
                            <p className="text-gray-900 bg-white p-2 rounded border border-transparent min-h-[60px]">{formData.orderNote || 'N/A'}</p>
                        ) : (
                            <textarea
                                name="orderNote"
                                value={formData.orderNote}
                                onChange={handleChange}
                                rows={3}
                                className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                            />
                        )}
                    </div>

                    {/* Order Items Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Order Items
                            </h3>
                            {mode === 'edit' && formData.cart.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            cart: [...prev.cart, {
                                                name: 'New Item',
                                                basePrice: 0,
                                                addonsTotal: 0,
                                                quantity: 1,
                                                selectedAddons: [],
                                                selectedRemovables: []
                                            }]
                                        }));
                                    }}
                                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center transition-colors cursor-pointer"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Item
                                </button>
                            )}
                        </div>

                        {formData.cart.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300 cursor-default">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h4 className="mt-2 text-sm font-medium text-gray-900">No items in this order</h4>
                                <p className="mt-1 text-sm text-gray-500">Add items to create an order</p>
                                {mode === 'edit' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                cart: [...prev.cart, {
                                                    name: 'New Item',
                                                    basePrice: 0,
                                                    addonsTotal: 0,
                                                    quantity: 1,
                                                    selectedAddons: [],
                                                    selectedRemovables: []
                                                }]
                                            }));
                                        }}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                                    >
                                        Add First Item
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                            <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                            <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            {mode === 'edit' && <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-500 bg-white">
                                        {formData.cart.map((item, itemIndex) => (
                                            <tr key={itemIndex} className="hover:bg-gray-50 transition-colors">
                                                <td className="border-r border-gray-300 px-4 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {mode === 'view' ? (
                                                            item.name
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => handleItemChange(itemIndex, 'name', e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                                                required
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Addons Section */}
                                                    {item.selectedAddons.length > 0 && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-gray-500">Add-ons:</span>
                                                            {item.selectedAddons.map((addon, addonIndex) => (
                                                                <div key={addonIndex} className="flex items-center text-xs text-gray-600 mt-1">
                                                                    {mode === 'view' ? (
                                                                        <span>{addon.name} (+${addon.price.toFixed(2)})</span>
                                                                    ) : (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                value={addon.name}
                                                                                onChange={(e) => {
                                                                                    const updatedAddons = [...item.selectedAddons];
                                                                                    updatedAddons[addonIndex].name = e.target.value;
                                                                                    handleItemChange(itemIndex, 'selectedAddons', updatedAddons);
                                                                                }}
                                                                                className="w-32 p-1 border border-gray-300 rounded-md mr-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                                                                placeholder="Addon name"
                                                                            />
                                                                            <span className="text-gray-500 mr-1">$</span>
                                                                            <input
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                value={addon.price}
                                                                                onChange={(e) => {
                                                                                    const updatedAddons = [...item.selectedAddons];
                                                                                    updatedAddons[addonIndex].price = parseFloat(e.target.value) || 0;
                                                                                    handleItemChange(itemIndex, 'selectedAddons', updatedAddons);
                                                                                }}
                                                                                className="w-16 p-1 border border-gray-300 rounded-md mr-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium text-black placeholder-gray-400"
                                                                                placeholder="0.00"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveAddon(itemIndex, addonIndex)}
                                                                                className="text-red-500 hover:text-red-700 transition cursor-pointer"
                                                                                aria-label="Remove addon"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Removables Section */}
                                                    {item.selectedRemovables.length > 0 && (
                                                        <div className="mt-2">
                                                            <span className="text-xs font-medium text-gray-500">Removed:</span>
                                                            {item.selectedRemovables.map((removable, removableIndex) => (
                                                                <div key={removableIndex} className="flex items-center text-xs text-gray-600 mt-1">
                                                                    {mode === 'view' ? (
                                                                        <span>{removable}</span>
                                                                    ) : (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                value={removable}
                                                                                onChange={(e) => handleRemovableChange(itemIndex, removableIndex, e.target.value)}
                                                                                className="w-32 p-1 border border-gray-300 rounded-md mr-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                                                                placeholder="Ingredient to remove"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveRemovable(itemIndex, removableIndex)}
                                                                                className="text-red-500 hover:text-red-700 transition cursor-pointer"
                                                                                aria-label="Remove ingredient"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Instructions */}
                                                    {mode === 'view' ? (
                                                        item.instructions && (
                                                            <div className="mt-2 text-xs text-gray-600">
                                                                Note: {item.instructions}
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="mt-2">
                                                            <textarea
                                                                value={item.instructions}
                                                                onChange={(e) => handleItemChange(itemIndex, 'instructions', e.target.value)}
                                                                className="w-full p-1 border border-gray-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"
                                                                rows={2}
                                                                placeholder="Special instructions"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Add New Addon/Removable in Edit Mode */}
                                                    {mode === 'edit' && (
                                                        <div className="mt-3 space-y-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditingAddonsIndex(editingAddonsIndex === itemIndex ? null : itemIndex)}
                                                                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded flex items-center transition cursor-pointer"
                                                                >
                                                                    {editingAddonsIndex === itemIndex ? (
                                                                        <>
                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                            Cancel
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                            </svg>
                                                                            Add Addon
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddRemovable(itemIndex)}
                                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded flex items-center transition cursor-pointer"
                                                                >
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    Add Removable
                                                                </button>
                                                            </div>

                                                            {editingAddonsIndex === itemIndex && (
                                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Addon name"
                                                                        value={newAddon.name}
                                                                        onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                                                                        className="text-xs p-1 border border-gray-300 rounded-md w-32 focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium"
                                                                    />
                                                                    <div className="flex items-center">
                                                                        <span className="text-xs text-gray-500 mr-1">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            placeholder="0.00"
                                                                            value={newAddon.price}
                                                                            onChange={(e) => setNewAddon({ ...newAddon, price: parseFloat(e.target.value) || 0 })}
                                                                            className="text-xs p-1 border border-gray-300 rounded-md w-16 focus:ring-blue-500 focus:border-blue-500 transition cursor-text font-medium text-black placeholder-gray-400"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAddAddon(itemIndex)}
                                                                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded flex items-center transition cursor-pointer"
                                                                        disabled={!newAddon.name.trim()}
                                                                    >
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border-r border-gray-300 px-4 py-4 whitespace-nowrap">
                                                    {mode === 'view' ? (
                                                        <span className="font-bold text-gray-900">${item.basePrice.toFixed(2)}</span>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 mr-1">$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={item.basePrice}
                                                                onChange={(e) => handleItemChange(itemIndex, 'basePrice', parseFloat(e.target.value))}
                                                                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text text-black placeholder-gray-400"
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border-r border-gray-300 px-4 py-4 whitespace-nowrap">
                                                    {mode === 'view' ? (
                                                        <span className="font-bold text-gray-900">{item.quantity}</span>
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(itemIndex, 'quantity', parseInt(e.target.value))}
                                                            className="w-16 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition cursor-text text-black placeholder-gray-400"
                                                        />
                                                    )}
                                                </td>
                                                <td className="border-r border-gray-300 px-4 py-4 whitespace-nowrap font-bold text-gray-900 text-lg">
                                                    ${calculateItemTotal(item).toFixed(2)}
                                                </td>
                                                {mode === 'edit' && (
                                                    <td className="border-r border-gray-300 px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    cart: prev.cart.filter((_, i) => i !== itemIndex)
                                                                }));
                                                            }}
                                                            className="text-red-600 hover:text-red-900 transition cursor-pointer"
                                                            aria-label="Remove item"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                            Order Summary
                        </h3>
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between py-3 border-b border-gray-300">
                                    <span className="font-medium text-gray-700">Subtotal:</span>
                                    <span className="text-gray-900 font-bold">${calculateOrderTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="font-bold text-gray-800">Total:</span>
                                    <span className="font-bold text-blue-600 text-xl">
                                        ${calculateOrderTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                        {mode === 'edit' && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition flex items-center cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}