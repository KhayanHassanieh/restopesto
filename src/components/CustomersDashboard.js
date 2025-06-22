export default function CustomersDashboard({ orders, detailed = false }) {
    // Get unique customers
    const uniqueCustomers = [...new Set(orders.map(order => order.mobileNumber))].length;
  
    if (detailed) {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{uniqueCustomers}</p>
              <p className="text-sm text-gray-500">Unique Customers</p>
            </div>
            {/* Add more customer metrics here */}
          </div>
          {/* Add customer list or other detailed info */}
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