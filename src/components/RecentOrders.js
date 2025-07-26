import { useState } from 'react';
import OrderModal from './OrderModal';

const STATUSES = [
  'Ordered',
  'Confirmed',
  'In Progress',
  'Out for Delivery',
  'Done'
];

export default function RecentOrders({ orders = [], showAll = false, onOrderUpdate }) {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

  const handleViewClick = (order) => {
    console.log('Order being passed to modal:', order);
    setCurrentOrder(order);
    setModalMode('view');
  };

  const handleEditClick = (order) => {
    setCurrentOrder(order);
    setModalMode('edit');
  };

  const handleStatusChange = async (orderId, value) => {
    await onOrderUpdate(orderId, { status: value });
  };

  const handleSave = async (orderId, updatedData) => {
    try {
      await onOrderUpdate(orderId, updatedData);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      {currentOrder && (
        <OrderModal
          order={currentOrder}
          mode={modalMode}
          onClose={() => setCurrentOrder(null)}
          onSave={handleSave}
        />
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table headers */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        
        {/* Table body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id.substring(0, 6)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.createdAt.toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.fullName || 'Guest'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.finalTotal?.toFixed(2) || '0.00'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  className="border border-gray-300 rounded-md text-sm p-1"
                  value={order.status || 'Ordered'}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button 
                  onClick={() => handleViewClick(order)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  View
                </button>
                <button 
                  onClick={() => handleEditClick(order)}
                  className="text-indigo-500 hover:text-indigo-700 text-sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}