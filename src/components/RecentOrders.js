import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default function RecentOrders({ orders = [], showAll = false, onOrderUpdate }) {
  const [editingOrder, setEditingOrder] = useState(null);
  const [editData, setEditData] = useState({
    fullName: '',
    mobileNumber: '',
    status: 'pending',
    finalTotal: 0
  });

  const handleEditClick = (order) => {
    setEditingOrder(order.id);
    setEditData({
      fullName: order.fullName || '',
      mobileNumber: order.mobileNumber || '',
      status: order.status || 'pending',
      finalTotal: order.finalTotal || 0
    });
  };

  const handleSave = async (orderId) => {
    try {
      const updatedData = {
        fullName: editData.fullName,
        mobileNumber: editData.mobileNumber,
        status: editData.status,
        finalTotal: parseFloat(editData.finalTotal),
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'orders', orderId), updatedData);

      // Update local state
      if (onOrderUpdate) {
        onOrderUpdate(orderId, updatedData);
      }

      setEditingOrder(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  // Modified table row rendering
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table headers remain same */}
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              {/* Non-editable cells */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id.substring(0, 6)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.createdAt.toLocaleDateString()}
              </td>

              {/* Editable cells */}
              {editingOrder === order.id ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      className="border rounded p-1 text-sm w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      value={editData.mobileNumber}
                      onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
                      className="border rounded p-1 text-sm w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={editData.finalTotal}
                      onChange={(e) => setEditData({ ...editData, finalTotal: e.target.value })}
                      className="border rounded p-1 text-sm w-full"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleSave(order.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingOrder(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.fullName || 'Guest'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.mobileNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.finalTotal?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditClick(order)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}