'use client';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

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

  useEffect(() => {
    if (originalOrder) {
      const safeOrder = {
        ...originalOrder,
        cart: Array.isArray(originalOrder.cart) ? 
          originalOrder.cart.map(item => ({
            ...item,
            name: item.name || 'Unnamed Item',
            basePrice: Number(item.basePrice) || 0,
            addonsTotal: Number(item.addonsTotal) || 0,
            quantity: Number(item.quantity) || 1,
            selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
            selectedRemovables: Array.isArray(item.selectedRemovables) ? item.selectedRemovables : []
          })) : [],
        addressDetails: originalOrder.addressDetails || '',
        area: originalOrder.area || '',
        region: originalOrder.region || ''
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
      
      // Recalculate addonsTotal if addons changed
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
    try {
      const orderToSave = {
        ...formData,
        finalTotal: calculateOrderTotal()
      };
      await onSave(orderToSave.id, orderToSave);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  if (loading || !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'view' ? 'Order Details' : 'Edit Order'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Customer and Address Section */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{formData.fullName}</p>
                ) : (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{formData.mobileNumber}</p>
                ) : (
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Delivery Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{formData.area || 'N/A'}</p>
                ) : (
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{formData.region || 'N/A'}</p>
                ) : (
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Details</label>
                {mode === 'view' ? (
                  <p className="text-gray-900">{formData.addressDetails || 'N/A'}</p>
                ) : (
                  <textarea
                    name="addressDetails"
                    value={formData.addressDetails}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.cart.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {mode === 'view' ? (
                            item.name
                          ) : (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(itemIndex, 'name', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md"
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
                                      className="w-32 p-1 border border-gray-300 rounded-md mr-2"
                                    />
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={addon.price}
                                      onChange={(e) => {
                                        const updatedAddons = [...item.selectedAddons];
                                        updatedAddons[addonIndex].price = parseFloat(e.target.value) || 0;
                                        handleItemChange(itemIndex, 'selectedAddons', updatedAddons);
                                      }}
                                      className="w-20 p-1 border border-gray-300 rounded-md mr-2"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAddon(itemIndex, addonIndex)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
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
                                      className="w-32 p-1 border border-gray-300 rounded-md mr-2"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRemovable(itemIndex, removableIndex)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add New Addon/Removable in Edit Mode */}
                        {mode === 'edit' && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setEditingAddonsIndex(editingAddonsIndex === itemIndex ? null : itemIndex)}
                                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                              >
                                {editingAddonsIndex === itemIndex ? 'Cancel' : '+ Add Addon'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddRemovable(itemIndex)}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                + Add Removable
                              </button>
                            </div>

                            {editingAddonsIndex === itemIndex && (
                              <div className="flex items-center space-x-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Addon name"
                                  value={newAddon.name}
                                  onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
                                  className="text-xs p-1 border border-gray-300 rounded-md w-32"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price"
                                  value={newAddon.price}
                                  onChange={(e) => setNewAddon({...newAddon, price: parseFloat(e.target.value) || 0})}
                                  className="text-xs p-1 border border-gray-300 rounded-md w-20"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddAddon(itemIndex)}
                                  className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded"
                                >
                                  Add
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {mode === 'view' ? (
                          `$${item.basePrice.toFixed(2)}`
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            value={item.basePrice}
                            onChange={(e) => handleItemChange(itemIndex, 'basePrice', parseFloat(e.target.value))}
                            className="w-20 p-2 border border-gray-300 rounded-md"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {mode === 'view' ? (
                          item.quantity
                        ) : (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(itemIndex, 'quantity', parseInt(e.target.value))}
                            className="w-16 p-2 border border-gray-300 rounded-md"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                        ${calculateItemTotal(item).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="flex justify-end">
              <div className="w-full max-w-xs">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="text-gray-900">${calculateOrderTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-bold text-lg text-gray-800">Total:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ${calculateOrderTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            {mode === 'edit' && (
              <button
                type="submit"
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}