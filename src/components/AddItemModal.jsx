'use client';
import { useEffect } from 'react';

export default function AddItemModal({ open, onClose, newItem, setNewItem, categories, onAdd }) {
  useEffect(() => {
    if (!open) {
      setNewItem({
        name: '',
        price: '',
        typeId: '',
        type: '',
        description: '',
        addons: [],
        remove: [],
        imageUrl: '',
        imageFile: null,
        isCombo: false,
        comboPrice: '',
        comboIncludes: ''
      });
    }
  }, [open, setNewItem]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">Add Menu Item</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-xl">×</button>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewItem({ ...newItem, imageFile: e.target.files[0] })}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7b68ee] file:text-white hover:file:bg-[#6a58d6]"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="focus:border-[#7b68ee] focus:ring-[#7b68ee] mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              id="price"
              type="text"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            value={newItem.typeId}
            onChange={(e) => {
              const selected = categories.find(cat => cat.id === e.target.value);
              setNewItem({
                ...newItem,
                typeId: selected?.id || '',
                type: selected?.name || ''
              });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            rows={3}
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Add-ons</label>
            <div className="space-y-2">
              {newItem.addons.map((addon, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Add-on name"
                    value={addon.name}
                    onChange={(e) => {
                      const updated = [...newItem.addons];
                      updated[index].name = e.target.value;
                      setNewItem({ ...newItem, addons: updated });
                    }}
                    className="flex-1 rounded-md border-gray-300 p-2 text-sm text-gray-800"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={isNaN(addon.price) ? '' : addon.price}
                    onChange={(e) => {
                      const updated = [...newItem.addons];
                      updated[index].price = parseFloat(e.target.value) || 0;
                      setNewItem({ ...newItem, addons: updated });
                    }}
                    className="w-20 md:w-24 rounded-md border-gray-300 p-2 text-sm text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = newItem.addons.filter((_, i) => i !== index);
                      setNewItem({ ...newItem, addons: updated });
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setNewItem({
                    ...newItem,
                    addons: [...newItem.addons, { name: '', price: 0 }]
                  })
                }
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                + Add Add-on
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="remove" className="block text-sm font-medium text-gray-700">Removables</label>
            <input
              id="remove"
              type="text"
              placeholder="Comma separated"
              onChange={(e) => setNewItem({ ...newItem, remove: e.target.value.split(',').map(s => s.trim()) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCombo"
              checked={newItem.isCombo}
              onChange={(e) => setNewItem({ ...newItem, isCombo: e.target.checked })}
              className="h-4 w-4 text-[#7b68ee] focus:ring-[#7b68ee] border-gray-300 rounded"
            />
            <label htmlFor="isCombo" className="block text-sm font-medium text-gray-700">Is this a Combo?</label>
          </div>

          {newItem.isCombo && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Combo Price</label>
                <input
                  type="number"
                  placeholder="Insert price"
                  value={newItem.comboPrice}
                  onChange={(e) => setNewItem({ ...newItem, comboPrice: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Combo Includes</label>
                <textarea
                  value={newItem.comboIncludes}
                  onChange={(e) => setNewItem({ ...newItem, comboIncludes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6]"
          >
            Add Menu Item
          </button>
        </div>
      </div>
    </div>
  );
}
