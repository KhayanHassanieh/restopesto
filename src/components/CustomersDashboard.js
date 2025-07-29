'use client';
import { useState, useMemo } from 'react';
import CustomerOrdersModal from './CustomerOrdersModal';

export default function CustomersDashboard({ orders, detailed = false }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // count unique customers by phone
  const uniqueCustomers = useMemo(
    () => new Set(orders.map(o => o.mobileNumber)).size,
    [orders]
  );

  // Build customer summary data
  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach(order => {
      const phone = order.mobileNumber || 'N/A';
      const key = phone;
      const existing = map.get(key) || {
        phone,
        fullName: order.fullName || 'Guest',
        firstOrder: order.createdAt,
        lastOrder: order.createdAt,
        orders: []
      };
      existing.orders.push(order);
      if (order.createdAt < existing.firstOrder) existing.firstOrder = order.createdAt;
      if (order.createdAt > existing.lastOrder) existing.lastOrder = order.createdAt;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.lastOrder - a.lastOrder);
  }, [orders]);

  if (detailed) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{uniqueCustomers}</p>
            <p className="text-sm text-gray-500">Unique Customers</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.phone} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.firstOrder.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastOrder.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                    {customer.orders.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedCustomer && (
          <CustomerOrdersModal
            open={!!selectedCustomer}
            customer={selectedCustomer}
            orders={selectedCustomer.orders}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Customers</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{uniqueCustomers}</p>
          <p className="text-sm text-gray-500">Total Customers</p>
        </div>
        <div className="bg-blue-100 rounded-full p-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
