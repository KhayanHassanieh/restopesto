//menu screen
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const storage = getStorage();

  const [newItem, setNewItem] = useState({
    name: '', price: '', typeId: '', type: '',
    description: '', addons: [], remove: [],
    imageUrl: '', imageFile: null
  });

  const [editItem, setEditItem] = useState({
    name: '', price: '', typeId: '', type: '',
    description: '', addons: [], remove: [],
    imageUrl: '', imageFile: null
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, 'restaurants', id, 'categories'));
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchMenuItems = async () => {
    const snap = await getDocs(collection(db, 'restaurants', id, 'menu'));
    setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleImageUpload = async (file) => {
    const fileRef = ref(storage, `menu_images/${file.name}-${Date.now()}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const deleteImageFromStorage = async (url) => {
    if (!url) return;
    try {
      const pathStart = url.indexOf('/o/') + 3;
      const pathEnd = url.indexOf('?');
      const fullPath = decodeURIComponent(url.substring(pathStart, pathEnd));
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Failed to delete old image:', err.message);
    }
  };

  const addCategory = async () => {
    if (!newCategory) return;
    await addDoc(collection(db, 'restaurants', id, 'categories'), { name: newCategory });
    setNewCategory('');
    fetchCategories();
  };

  const addMenuItem = async () => {
    const { name, price, description, type, typeId, imageFile, addons, remove } = newItem;
    if (!name || !price || !type || !typeId) return;
    let imageUrl = '';
    if (imageFile) imageUrl = await handleImageUpload(imageFile);
    await addDoc(collection(db, 'restaurants', id, 'menu'), {
      name, 
      price: parseFloat(price), 
      description, 
      typeId, 
      type,
      addons: addons || [], 
      remove: remove || [], 
      imageUrl
    });
    setNewItem({ 
      name: '', 
      price: '', 
      typeId: '', 
      type: '', 
      description: '', 
      addons: [], 
      remove: [], 
      imageUrl: '', 
      imageFile: null 
    });
    setIsAddingItem(false);
    fetchMenuItems();
  };

  const deleteMenuItem = async (itemId) => {
    await deleteDoc(doc(db, 'restaurants', id, 'menu', itemId));
    fetchMenuItems();
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    const itemRef = doc(db, 'restaurants', id, 'menu', editMode);
    let imageUrl = editItem.imageUrl;
    if (editItem.imageFile) {
      if (imageUrl) await deleteImageFromStorage(imageUrl);
      imageUrl = await handleImageUpload(editItem.imageFile);
    }
    await updateDoc(itemRef, {
      name: editItem.name,
      price: parseFloat(editItem.price),
      description: editItem.description,
      typeId: editItem.typeId,
      type: editItem.type,
      addons: editItem.addons || [],
      remove: editItem.remove || [],
      imageUrl
    });
    setEditMode(null);
    fetchMenuItems();
  };

  const startEdit = (item) => {
    setEditMode(item.id);
    setEditItem({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      typeId: item.typeId,
      type: item.type,
      addons: item.addons || [],
      remove: item.remove || [],
      imageUrl: item.imageUrl || '',
      imageFile: null
    });
  };

  const exportMenuAsJSON = () => {
    const grouped = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      items: menuItems.filter(item => item.typeId === cat.id)
    }));

    const output = {
      restaurantId: id,
      categories: grouped
    };

    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menu-${id}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <button
            onClick={exportMenuAsJSON}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Menu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Categories</h3>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                  placeholder="New category name"
                />
                <button
                  onClick={addCategory}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6]"
                >
                  Add
                </button>
              </div>
              
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-800">{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {menuItems.filter(item => item.typeId === category.id).length} items
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Menu Item Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Menu Items</h3>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6]"
                >
                  {isAddingItem ? 'Cancel' : 'Add Item'}
                </button>
              </div>
            </div>
            
            {isAddingItem && (
              <div className="p-4 space-y-4 border-b border-gray-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewItem({ ...newItem, imageFile: e.target.files[0] })}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7b68ee] file:text-white hover:file:bg-[#6a58d6]"
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="focus:border-[#7b68ee] focus:ring-[#7b68ee] mt-1 block w-full rounded-md border-gray-300 shadow-sm  sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      id="price"
                      type="text"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="addons" className="block text-sm font-medium text-gray-700">Add-ons</label>
                    <input
                      id="addons"
                      type="text"
                      placeholder="Comma separated"
                      onChange={(e) => setNewItem({ ...newItem, addons: e.target.value.split(',').map(s => s.trim()) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="remove" className="block text-sm font-medium text-gray-700">Removables</label>
                    <input
                      id="remove"
                      type="text"
                      placeholder="Comma separated"
                      onChange={(e) => setNewItem({ ...newItem, remove: e.target.value.split(',').map(s => s.trim()) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <button
                  onClick={addMenuItem}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                >
                  Add Menu Item
                </button>
              </div>
            )}
            
            {/* Category Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryId('')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCategoryId === '' ? 'bg-[#7b68ee] text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedCategoryId === cat.id ? 'bg-[#7b68ee] text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Menu Items List */}
            <div className="divide-y divide-gray-200">
              {menuItems
                .filter(item => selectedCategoryId === '' || item.typeId === selectedCategoryId)
                .map(item => (
                  <div key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {item.imageUrl && (
                        <div className="flex-shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                          <span className="text-lg font-medium text-gray-900">${item.price}</span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {categories.find(cat => cat.id === item.typeId)?.name || 'Uncategorized'}
                          </span>
                          
                          {item.addons?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Add-ons: {item.addons.join(', ')}
                            </span>
                          )}
                          
                          {item.remove?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Removables: {item.remove.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {/* Edit Form */}
                    {editMode === item.id && (
                      <form onSubmit={handleUpdateItem} className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditItem({ ...editItem, imageFile: e.target.files[0] })}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7b68ee] file:text-white hover:file:bg-[#6a58d6]"
                        />
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                              id="edit-name"
                              type="text"
                              value={editItem.name}
                              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                              id="edit-price"
                              type="text"
                              value={editItem.price}
                              onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="edit-addons" className="block text-sm font-medium text-gray-700">Add-ons</label>
                            <input
                              id="edit-addons"
                              type="text"
                              value={editItem.addons.join(', ')}
                              onChange={(e) => setEditItem({ ...editItem, addons: e.target.value.split(',').map(s => s.trim()) })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="edit-remove" className="block text-sm font-medium text-gray-700">Removables</label>
                            <input
                              id="edit-remove"
                              type="text"
                              value={editItem.remove.join(', ')}
                              onChange={(e) => setEditItem({ ...editItem, remove: e.target.value.split(',').map(s => s.trim()) })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2  text-gray-800 placeholder-gray-400"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditMode(null)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}