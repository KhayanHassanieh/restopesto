export default function SalesDashboard({ orders = [], detailed = false }) {
  // Safely calculate totals with default empty array
  const totalSales = orders?.reduce((sum, order) => sum + (order?.finalTotal || 0), 0) || 0;
  const totalItems = orders?.reduce((sum, order) => {
    return sum + (order?.cart?.reduce((itemSum, item) => itemSum + (item?.quantity || 0), 0) || 0);
  }, 0) || 0;

  // Add debug logging
  console.log('Orders in SalesDashboard:', orders);
  console.log('Calculated totalItems:', totalItems);
  if (detailed) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Sales</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            <p className="text-sm text-gray-500">Items Sold</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Sales</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-green-100 rounded-full p-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}