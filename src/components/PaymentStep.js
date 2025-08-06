'use client';

export default function PaymentStep({ cartTotal, orderNote, onNoteChange, onBack, onPlaceOrder }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>

      <div className="space-y-4 mb-6">
        <div className="p-4 border border-gray-300 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Cash on Delivery</h3>
          <p className="text-sm text-gray-600">Pay when you receive your order</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4 font-bold">
          <span className="text-gray-800">Total:</span>
          <span className="text-gray-800">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Note
          </label>
          <textarea
            value={orderNote}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-gray-800 placeholder:text-gray-500"
            placeholder="Any notes for the restaurant?"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onPlaceOrder}
          className="px-4 py-2 text-white rounded-md hover:brightness-110 transition-colors"
          style={{ background: 'var(--theme-primary)' }}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
