export default function MenuItemsDashboard({ menuItems, orders }) {
    // Calculate sold quantities for each menu item
    const itemsWithQuantities = menuItems.map(item => {
      const quantity = orders.reduce((sum, order) => {
        const orderItems = Array.isArray(order.cart) ? order.cart : [];

        const matched = orderItems.filter(
          (oi) =>
            oi.menuItemId === item.id ||
            oi.itemId === item.id ||
            oi.id === item.id
        );

        const qty = matched.reduce(
          (q, oi) => q + (oi.quantity || oi.qty || 0),
          0
        );

        return sum + qty;
      }, 0);

      return { ...item, quantitySold: quantity };
    });
  
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Menu Items Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemsWithQuantities.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={item.imageUrl || '/placeholder-food.jpg'} alt={item.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantitySold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.price * item.quantitySold).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }