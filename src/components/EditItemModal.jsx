'use client';
import { Fragment } from 'react';

export default function EditItemModal({ open, onClose, editItem, setEditItem, categories, onSave }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <form onSubmit={onSave} className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">Edit Item</h2>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800 text-xl">×</button>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setEditItem({ ...editItem, imageFile: e.target.files[0] })}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7b68ee] file:text-white hover:file:bg-[#6a58d6]"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="edit-name"
              type="text"
              value={editItem.name}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              id="edit-price"
              type="text"
              value={editItem.price}
              onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="edit-category"
            value={editItem.typeId}
            onChange={(e) => {
              const selected = categories.find(cat => cat.id === e.target.value);
              setEditItem({
                ...editItem,
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
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="edit-description"
            rows={3}
            value={editItem.description}
            onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="edit-addons" className="block text-sm font-medium text-gray-700">Add-ons</label>
            <div className="space-y-2">
              {editItem.addons.map((addon, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Add-on name"
                    value={addon.name}
                    onChange={(e) => {
                      const updated = [...editItem.addons];
                      updated[index].name = e.target.value;
                      setEditItem({ ...editItem, addons: updated });
                    }}
                    className="flex-1 rounded-md border-gray-300 p-2 text-sm text-gray-800"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={addon.price}
                    onChange={(e) => {
                      const updated = [...editItem.addons];
                      updated[index].price = parseFloat(e.target.value);
                      setEditItem({ ...editItem, addons: updated });
                    }}
                    className="w-20 md:w-24 rounded-md border-gray-300 p-2 text-sm text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = editItem.addons.filter((_, i) => i !== index);
                      setEditItem({ ...editItem, addons: updated });
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
                  setEditItem({
                    ...editItem,
                    addons: [...editItem.addons, { name: '', price: 0 }]
                  })
                }
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                + Add Add-on
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="edit-remove" className="block text-sm font-medium text-gray-700">Removables</label>
            <input
              id="edit-remove"
              type="text"
              value={editItem.remove.join(', ')}
              onChange={(e) => setEditItem({ ...editItem, remove: e.target.value.split(',').map(s => s.trim()) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-isCombo"
              checked={editItem.isCombo}
              onChange={(e) => setEditItem({ ...editItem, isCombo: e.target.checked })}
              className="h-4 w-4 text-[#7b68ee] focus:ring-[#7b68ee] border-gray-300 rounded"
            />
            <label htmlFor="edit-isCombo" className="block text-sm font-medium text-gray-700">Is this a Combo?</label>
          </div>

          {editItem.isCombo && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Combo Price</label>
                <input
                  type="number"
                  placeholder="Insert price"
                  value={editItem.comboPrice}
                  onChange={(e) => setEditItem({ ...editItem, comboPrice: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Combo Includes</label>
                <textarea
                  value={editItem.comboIncludes}
                  onChange={(e) => setEditItem({ ...editItem, comboIncludes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
