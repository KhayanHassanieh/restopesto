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
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import SortableMenuList from '@/components/SortableMenuList';
import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';
import { GripVertical } from 'lucide-react';

export default function RestaurantMenuPage() {
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const storage = getStorage();

  const [newItem, setNewItem] = useState({
    name: '', price: '', typeId: '', type: '',
    description: '', addons: [], remove: [],
    imageUrl: '', imageFile: null,
    isCombo: false,
    comboPrice: '',
    comboIncludes: ''
  });

  const [editItem, setEditItem] = useState({
    name: '', price: '', typeId: '', type: '',
    description: '', addons: [], remove: [],
    imageUrl: '', imageFile: null,
    isCombo: false,
    comboPrice: '',
    comboIncludes: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, 'restaurants', id, 'categories'));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(data);
  };

  const fetchMenuItems = async () => {
    const q = query(collection(db, 'restaurants', id, 'menu'), orderBy('sortOrder'));
    const snap = await getDocs(q);

    const data = await Promise.all(
      snap.docs.map(async (docSnap, index) => {
        const item = { id: docSnap.id, ...docSnap.data() };
        item.sortOrder =
          typeof item.sortOrder === 'number'
            ? item.sortOrder
            : parseInt(item.sortOrder, 10) || index;

        // ✅ Force addons from subcollection only
        const addonsSnap = await getDocs(collection(db, 'restaurants', id, 'menu', docSnap.id, 'addons'));
        item.addons = addonsSnap.docs.map(doc => doc.data());

        return item;
      })
    );

    data.sort((a, b) => a.sortOrder - b.sortOrder);
    setMenuItems(data);
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

    const newItemRef = await addDoc(collection(db, 'restaurants', id, 'menu'), {
      name,
      price: parseFloat(price),
      description,
      typeId,
      type,
      remove: remove || [],
      imageUrl,
      isCombo: newItem.isCombo || false,
      comboPrice: newItem.comboPrice ? parseFloat(newItem.comboPrice) : null,
      comboIncludes: newItem.comboIncludes || '',
      sortOrder: menuItems.length
    });

    // Add each addon to the subcollection
    for (const addon of addons) {
      const parsed = typeof addon === 'string' ? { name: addon, price: 0 } : addon;
      await addDoc(collection(db, 'restaurants', id, 'menu', newItemRef.id, 'addons'), parsed);
    }

    // Reset form
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
    setShowAddModal(false);
    fetchMenuItems();
  };

  const deleteMenuItem = async (itemId) => {
    await deleteDoc(doc(db, 'restaurants', id, 'menu', itemId));
    fetchMenuItems();
  };

  const handleReorder = async (reordered) => {
    if (selectedCategoryId) {
      const categoryIndices = menuItems
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.typeId === selectedCategoryId)
        .map(({ idx }) => idx);

      const updatedMenu = [...menuItems];

      categoryIndices.forEach((menuIdx, i) => {
        updatedMenu[menuIdx] = reordered[i];
      });

      await Promise.all(
        updatedMenu.map((item, index) => {
          if (item.sortOrder !== index) {
            item.sortOrder = index;
            return updateDoc(doc(db, 'restaurants', id, 'menu', item.id), {
              sortOrder: index
            });
          }
          return null;
        })
      );

      setMenuItems(updatedMenu);
    } else {
      await Promise.all(
        reordered.map((item, index) => {
          if (item.sortOrder !== index) {
            item.sortOrder = index;
            return updateDoc(doc(db, 'restaurants', id, 'menu', item.id), {
              sortOrder: index
            });
          }
          return null;
        })
      );

      setMenuItems(reordered);
    }
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
      remove: editItem.remove || [],
      imageUrl,
      isCombo: editItem.isCombo || false,
      comboPrice: editItem.comboPrice ? parseFloat(editItem.comboPrice) : null,
      comboIncludes: editItem.comboIncludes || ''
    });

    // Delete existing addons
    const addonsCollectionRef = collection(db, 'restaurants', id, 'menu', editMode, 'addons');
    const existingAddons = await getDocs(addonsCollectionRef);
    for (const docSnap of existingAddons.docs) {
      await deleteDoc(docSnap.ref);
    }

    // Re-add updated addons
    for (const addon of editItem.addons) {
      const parsed = typeof addon === 'string' ? { name: addon, price: 0 } : addon;
      await addDoc(addonsCollectionRef, parsed);
    }

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
      imageFile: null,
      isCombo: item.isCombo || false,
      comboPrice: item.comboPrice || '',
      comboIncludes: item.comboIncludes || ''
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Menu Management</h1>
          <button
            onClick={exportMenuAsJSON}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Categories Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Categories</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7b68ee] focus:ring-[#7b68ee] sm:text-sm border p-2 text-gray-800 placeholder-gray-400"
                  placeholder="New category name"
                />
                <button
                  onClick={addCategory}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6]"
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
            <div className="px-4 py-4 border-b border-gray-200 sm:px-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Menu Items</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6]"
                >
                  Add Item
                </button>
              </div>
            </div>
            {/* Add item modal component handled below */}

            {/* Category Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryId('')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${selectedCategoryId === '' ? 'bg-[#7b68ee] text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${selectedCategoryId === cat.id ? 'bg-[#7b68ee] text-white' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items List */}
            <SortableMenuList
              items={menuItems.filter(item => selectedCategoryId === '' || item.typeId === selectedCategoryId)}
              onReorder={handleReorder}
              renderItem={(item, handleProps) => (
                <div className="p-4 flex flex-col md:flex-row gap-4">
                  <div
                    className="flex items-center cursor-grab text-gray-500 sm:self-start"
                    {...handleProps}
                  >
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    {item.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-20 w-20 md:h-24 md:w-24 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">{item.name}</h4>
                        <span className="text-base sm:text-lg font-medium text-gray-900">${item.price}</span>
                      </div>

                      {item.isCombo && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Combo
                          </span>
                          {item.comboPrice && (
                            <span className="ml-2 text-sm text-gray-600">Combo Price: ${item.comboPrice}</span>
                          )}
                        </div>
                      )}

                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {categories.find(cat => cat.id === item.typeId)?.name || 'Uncategorized'}
                        </span>

                        {item.addons?.length > 0 && (
                          <div className="w-full mt-1 text-sm text-green-700">
                            <span className="font-medium">Add-ons: </span>
                            {item.addons.map(a => a.name || a).join(', ')}
                          </div>
                        )}

                        {item.remove?.length > 0 && (
                          <div className="w-full mt-1 text-sm text-purple-700">
                            <span className="font-medium">Removables: </span>
                            {item.remove.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col md:gap-1 justify-end">
                   <button
  onClick={() => startEdit(item)}
  className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
>
  Edit
</button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Edit form handled via modal below */}
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        categories={categories}
        onAdd={addMenuItem}
      />
      <EditItemModal
        open={!!editMode}
        onClose={() => setEditMode(null)}
        editItem={editItem}
        setEditItem={setEditItem}
        categories={categories}
        onSave={handleUpdateItem}
      />
    </div>
  );
}