//dashboard

'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import BranchManager from '@/components/BranchManager';
import RestaurantCard from '@/components/RestaurantCard';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState({});
  const [openBranchId, setOpenBranchId] = useState(null);
  const [editMode, setEditMode] = useState(null);

  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const router = useRouter();
  const storage = getStorage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchRestaurants();
        setLoading(false);
      } else {
        router.push('/admin/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRestaurants = async () => {
    const snap = await getDocs(collection(db, 'restaurants'));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRestaurants(data);
  };

  const fetchBranches = async (restaurantId) => {
    if (!branches[restaurantId]) {
      const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'branches'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBranches(prev => ({ ...prev, [restaurantId]: data }));
    }
  };

  const handleLogoUpload = async (file) => {
    const storageRef = ref(storage, `restaurant_logos/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      let uploadedUrl = '';
      if (logoFile) uploadedUrl = await handleLogoUpload(logoFile);

      const restaurantData = {
        name,
        subdomain,
        phone,
        subscriptionDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        logoUrl: uploadedUrl,
      };

      await addDoc(collection(db, 'restaurants'), restaurantData);
      setMessage('✅ Restaurant added!');
      setName('');
      setSubdomain('');
      setPhone('');
      setLogoFile(null);
      fetchRestaurants();
    } catch (err) {
      console.error('❌ Error adding restaurant:', err);
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (id, currentValue) => {
    try {
      await updateDoc(doc(db, 'restaurants', id), { isActive: !currentValue });
      fetchRestaurants();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const toggleEdit = (restaurant) => {
    if (editMode === restaurant.id) {
      setEditMode(null);
    } else {
      setEditMode(restaurant.id);
      setEditName(restaurant.name);
      setEditSubdomain(restaurant.subdomain);
      setEditPhone(restaurant.phone);
      setOpenBranchId(null);
    }
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'restaurants', editMode), {
        name: editName,
        subdomain: editSubdomain,
        phone: editPhone,
      });
      setEditMode(null);
      fetchRestaurants();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleToggleBranches = async (id) => {
    const newId = openBranchId === id ? null : id;
    setOpenBranchId(newId);
    setEditMode(null);
    if (newId && !branches[id]) await fetchBranches(id);
  };

  if (loading) return <p className="text-center mt-20 text-gray-800">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-gray-800">Admin Dashboard</h1>

        <form onSubmit={handleAddRestaurant} className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Restaurant</h2>
          <label className="block text-sm font-medium text-gray-800">Logo</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="block w-full border border-gray-800 rounded p-2 placeholder-gray-500" />
          <label className="block text-sm font-medium text-gray-800">Restaurant Name</label>
          <input className="w-full border border-gray-800 rounded p-2 placeholder-gray-500" type="text" placeholder="Restaurant Name" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="block text-sm font-medium text-gray-800">Subdomain</label>
          <input className="w-full border border-gray-800 rounded p-2 placeholder-gray-500" type="text" placeholder="Subdomain (e.g. joes)" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} />
          <label className="block text-sm font-medium text-gray-800">Phone Number</label>
          <input className="w-full border border-gray-800 rounded p-2 placeholder-gray-500" type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button type="submit" className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-700">Add Restaurant</button>
          {message && <p className="text-sm text-gray-800 font-medium">{message}</p>}
        </form>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Restaurants</h2>
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              branches={branches[r.id] || []}
              openBranchId={openBranchId}
              editMode={editMode}
              editName={editName}
              editSubdomain={editSubdomain}
              editPhone={editPhone}
              onToggleBranches={handleToggleBranches}
              onToggleEdit={() => toggleEdit(r)}
              onEditChange={{
                name: setEditName,
                subdomain: setEditSubdomain,
                phone: setEditPhone
              }}
              onUpdate={handleUpdateRestaurant}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      </div>
    </div>
  );
}