import { useState } from 'react';
import OrderModal from './OrderModal';

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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status || 'Pending'}
                </span>
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