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
      name, price: parseFloat(price), description, typeId, type,
      addons: addons || [], remove: remove || [], imageUrl
    });
    setNewItem({ name: '', price: '', typeId: '', type: '', description: '', addons: [], remove: [], imageUrl: '', imageFile: null });
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
      price: item.price,
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-gray-800">Manage Menu</h1>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Add Category</h2>
          <div className="flex gap-2">
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="border border-gray-500 p-2 rounded w-full text-gray-800" />
            <button onClick={addCategory} className="bg-blue-700 text-white px-4 py-2 rounded">Add</button>
          </div>
        </div>

        

        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Menu Item</h2>
          <input type="file" accept="image/*" onChange={(e) => setNewItem({ ...newItem, imageFile: e.target.files[0] })} className="border border-gray-500 p-2 rounded w-full text-gray-500" />
          <input type="text" placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="border border-gray-500 p-2 rounded w-full placeholder-gray-600 text-gray-700" />
          <input type="text" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="border border-gray-500 p-2 rounded w-full placeholder-gray-600 text-gray-700" />
          <select  value={newItem.typeId} onChange={(e) => {
            const selected = categories.find(cat => cat.id === e.target.value);
            setNewItem({ ...newItem, typeId: selected?.id || '', type: selected?.name || '' });
          }} className="border border-gray-500 p-2 rounded w-full placeholder-gray-500 text-gray-800">
            <option value="" >Select Category</option>
            {categories.map(cat => (<option key={cat.id} value={cat.id} className='text-gray-800'>{cat.name}</option>))}
          </select>
          <textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="border border-gray-500 p-2 rounded w-full placeholder-gray-500 text-gray-700" />
          <input type="text" placeholder="Add-ons (comma separated)" onChange={(e) => setNewItem({ ...newItem, addons: e.target.value.split(',').map(s => s.trim()) })} className="border border-gray-500 p-2 rounded w-full placeholder-gray-500 text-gray-700" />
          <input type="text" placeholder="Removables (comma separated)" onChange={(e) => setNewItem({ ...newItem, remove: e.target.value.split(',').map(s => s.trim()) })} className="border border-gray-500 p-2 rounded w-full placeholder-gray-500 text-gray-700" />
          <button onClick={addMenuItem} className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800">Add Menu Item</button>
        </div>
<div className="flex justify-end mb-4">
  <button
    onClick={exportMenuAsJSON}
    className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Export Menu as JSON
  </button>
</div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Current Menu</h2>
          
          <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Filter by Category</h2>
         <div className="flex gap-2 flex-wrap">
         
  <button
    onClick={() => setSelectedCategoryId('')}
    className={`px-3 py-1 rounded ${
      selectedCategoryId === '' ? 'bg-blue-600 text-white' : 'bg-gray-500 text-gray-100'
    }`}
  >
    All
  </button>
  {categories.map(cat => (
    <button
      key={cat.id}
      onClick={() => setSelectedCategoryId(cat.id)}
      className={`px-3 py-1 rounded ${
        selectedCategoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-500 text-gray-100'
      }`}
    >
      {cat.name}
    </button>
  ))}
</div>

        </div>
          {menuItems.filter(item => selectedCategoryId === '' || item.typeId === selectedCategoryId).map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded mb-2" />}
              <p className="text-lg font-semibold text-gray-800">{item.name} — ${item.price}</p>
              <p className=" text-gray-800">{item.description}</p>
              <p className="text-sm text-gray-800">Category: {item.type}</p>
              {item.addons?.length > 0 && (<p className="text-sm text-gray-600">Add-ons: {item.addons.join(', ')}</p>)}
              {item.remove?.length > 0 && (<p className="text-sm text-gray-600">Removables: {item.remove.join(', ')}</p>)}
              <div className="flex gap-2 mt-2">
                <button onClick={() => startEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                <button onClick={() => deleteMenuItem(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Delete</button>
              </div>
              {editMode === item.id && (
                <form onSubmit={handleUpdateItem} className="mt-4 bg-gray-50 p-4 rounded-xl border space-y-2">
                  <input type="file" accept="image/*" onChange={(e) => setEditItem({ ...editItem, imageFile: e.target.files[0] })} className="border p-2 rounded w-full  text-gray-800 border-gray-500" />
                  <input className="w-full border p-2 rounded text-gray-800 border-gray-500" placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                  <input className="w-full border p-2 rounded  text-gray-800 border-gray-500" placeholder="Price" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} />
                  <select className="w-full border p-2 rounded  text-gray-800 border-gray-500" value={editItem.typeId} onChange={(e) => {
                    const selected = categories.find(cat => cat.id === e.target.value);
                    setEditItem({ ...editItem, typeId: selected?.id || '', type: selected?.name || '' });
                  }}>
                    <option value="" >Select Category</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                  <textarea className="w-full border p-2 rounded  text-gray-800 border-gray-500" placeholder="Description" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
                  <input type="text" placeholder="Add-ons" value={editItem.addons.join(', ')} onChange={(e) => setEditItem({ ...editItem, addons: e.target.value.split(',').map(s => s.trim()) })} className="border p-2 w-full rounded  text-gray-800 border-gray-500" />
                  <input type="text" placeholder="Removables" value={editItem.remove.join(', ')} onChange={(e) => setEditItem({ ...editItem, remove: e.target.value.split(',').map(s => s.trim()) })} className="border p-2 w-full rounded  text-gray-800 border-gray-500" />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">Save</button>
                    <button type="button" onClick={() => setEditMode(null)} className="text-gray-600 font-medium">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
