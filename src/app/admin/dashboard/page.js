'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import BranchManager from '@/components/BranchManager';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [openBranches, setOpenBranches] = useState(null);
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

  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editPhone, setEditPhone] = useState('');

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
      if (logoFile) {
        uploadedUrl = await handleLogoUpload(logoFile);
      }

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

  const fetchRestaurants = async () => {
    const snap = await getDocs(collection(db, 'restaurants'));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRestaurants(data);
  };

  const handleToggleActive = async (id, currentValue) => {
    try {
      await updateDoc(doc(db, 'restaurants', id), {
        isActive: !currentValue,
      });
      fetchRestaurants();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const startEdit = (restaurant) => {
    setEditMode(restaurant.id);
    setEditName(restaurant.name);
    setEditSubdomain(restaurant.subdomain);
    setEditPhone(restaurant.phone);
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

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-gray-800">Admin Dashboard</h1>

        {/* Add Restaurant Form */}
        <form onSubmit={handleAddRestaurant} className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Restaurant</h2>

          <label className="block text-sm font-medium text-gray-800">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files[0])}
            className="block w-full border border-gray-800 rounded p-2 placeholder-gray-500"
          />

          <label className="block text-sm font-medium text-gray-800">Restaurant Name</label>
          <input
            className="w-full border border-gray-800 rounded p-2 placeholder-gray-500"
            type="text"
            placeholder="Restaurant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-800">Subdomain</label>
          <input
            className="w-full border border-gray-800 rounded p-2 placeholder-gray-500"
            type="text"
            placeholder="Subdomain (e.g. joes)"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-800">Phone Number</label>
          <input
            className="w-full border border-gray-800 rounded p-2 placeholder-gray-500"
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-700"
          >
            Add Restaurant
          </button>

          {message && (
            <p className="text-sm text-gray-800 font-medium">{message}</p>
          )}
        </form>

        {/* Restaurant List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Restaurants</h2>
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-xl shadow flex flex-col md:flex-row gap-6 items-center">
              {r.logoUrl && (
                <img src={r.logoUrl} alt="logo" className="w-16 h-16 object-cover rounded-full border" />
              )}
              <div className="flex-1 space-y-1">
                <p className="text-lg  text-gray-800 font-semibold">{r.name}</p>
                <p className="text-sm text-gray-800">{r.subdomain}.restopesto.com</p>
                <p className="text-sm  text-gray-800">📞 {r.phone}</p>
                <p className="text-sm  text-gray-800">🕒 Expires: {r.expiresAt?.toDate().toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col items-center gap-2 w-32">
                <Link
                  href={`/admin/restaurants/${r.id}`}
                  className="w-full px-3 py-1 rounded bg-gray-400 text-white text-sm text-center hover:bg-blue-700 transition"
                >
                  Manage Menu
                </Link>
                <button
                  onClick={() => setOpenBranches(openBranches === r.id ? null : r.id)}
                  className="w-full px-3 py-1 rounded bg-gray-400 text-white text-sm hover:bg-purple-700 transition"
                >
                  Branches
                </button>
                <button
                  onClick={() => startEdit(r)}
                  className="w-full px-3 py-1 rounded bg-gray-400 text-white text-sm hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(r.id, r.isActive)}
                  className={`w-full px-3 py-1 text-sm rounded text-white transition ${
                    r.isActive ? 'bg-green-800 hover:bg-green-900' : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                >
                  {r.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>

              {editMode === r.id && (
                <form
                  onSubmit={handleUpdateRestaurant}
                  className="w-full bg-gray-50 p-4 mt-4 rounded-lg border border-gray-200 space-y-3"
                >
                  <input
                    className="w-full border border-gray-300 p-2 rounded text-gray-900"
                    placeholder="Name"
                    value={editName ?? ''}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    className="w-full border border-gray-300 p-2 rounded text-gray-900"
                    placeholder="Subdomain"
                    value={editSubdomain ?? ''}
                    onChange={(e) => setEditSubdomain(e.target.value)}
                  />
                  <input
                    className="w-full border border-gray-300 p-2 rounded text-gray-900"
                    placeholder="Phone"
                    value={editPhone ?? ''}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(null)}
                      className="text-gray-700 hover:text-black font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {openBranches === r.id && (
                <div className="w-full mt-4">
                 <BranchManager restaurantId={r.id} visible={openBranches === r.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
