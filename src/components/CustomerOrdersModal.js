'use client';
import RecentOrders from './RecentOrders';

export default function CustomerOrdersModal({ open, customer, orders, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Orders for {customer.fullName || customer.mobileNumber}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-xl">&times;</button>
        </div>
        <RecentOrders orders={orders} showAll />
      </div>
    </div>
  );
}
