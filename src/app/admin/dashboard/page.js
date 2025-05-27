'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, addDoc, collection, getDocs ,Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import RestaurantCard from '@/components/RestaurantCard';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState({});
  const [openBranchId, setOpenBranchId] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
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
  const data = snap.docs.map((doc) => {
    const restaurantData = doc.data();
    return {
      id: doc.id,
      ...restaurantData,
      expiresAt: restaurantData.expiresAt?.toDate 
        ? restaurantData.expiresAt 
        : restaurantData.expiresAt 
          ? new Date(restaurantData.expiresAt) 
          : null
    };
  });
  setRestaurants(data);
};

  const fetchBranches = async (restaurantId) => {
    if (!branches[restaurantId]) {
      const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'branches'));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBranches((prev) => ({ ...prev, [restaurantId]: data }));
    }
  };

  const handleLogoUpload = async (file) => {
    const storageRef = ref(storage, `restaurant_logos/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (!name || !subdomain || !phone) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }

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
      setMessage({ text: 'Restaurant added successfully!', type: 'success' });
      setName('');
      setSubdomain('');
      setPhone('');
      setLogoFile(null);
      setIsAdding(false);
      fetchRestaurants();
    } catch (err) {
      console.error('Error adding restaurant:', err);
      setMessage({ text: `Error: ${err.message}`, type: 'error' });
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
    
    // Handle date initialization
    let dateValue = '';
    if (restaurant.expiresAt) {
      const date = restaurant.expiresAt.toDate 
        ? restaurant.expiresAt.toDate() 
        : new Date(restaurant.expiresAt);
      dateValue = date.toISOString().split('T')[0];
    }
    setEditExpiresAt(dateValue);
    
    setOpenBranchId(null);
  }
};

  const handleUpdateRestaurant = async (e) => {
    
    try {
      await updateDoc(doc(db, 'restaurants', editMode), {
        name: editName,
        subdomain: editSubdomain,
        phone: editPhone,
         expiresAt: Timestamp.fromDate(new Date(editExpiresAt))
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7b68ee]"></div>
        <p className="mt-3 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
            <p className="text-gray-600">Manage your restaurants and branches</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            {isAdding ? (
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            {isAdding ? 'Cancel' : 'Add Restaurant'}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Restaurant</h3>
            </div>
            <form onSubmit={handleAddRestaurant} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      id="logo"
                      name="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                      className="py-2 px-3 block w-full shadow-sm focus:ring-[#7b68ee] focus:border-[#7b68ee] border border-gray-300 rounded-md text-gray-400"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder='Client name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm  text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="subdomain"
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      className="focus:ring-[#7b68ee] focus:border-[#7b68ee] flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 py-2 px-3 border  text-gray-800 placeholder-gray-400"
                      placeholder="your-restaurant"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      .restopesto.com
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm  text-gray-800 placeholder-gray-400"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {message.text}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                >
                  Add Restaurant
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Restaurants</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {restaurants.length === 0 ? (
              <div className="text-center py-14">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first restaurant.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Restaurant
                  </button>
                </div>
              </div>
            ) : (
              restaurants.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  branches={branches[r.id] || []}
                  openBranchId={openBranchId}
                  editMode={editMode}
                  editName={editName}
                  editSubdomain={editSubdomain}
                  editPhone={editPhone}
                  editExpiresAt={editExpiresAt} // Add this prop
                  onToggleBranches={handleToggleBranches}
                  onToggleEdit={() => toggleEdit(r)}
                  onEditChange={{
                    name: setEditName,
                    subdomain: setEditSubdomain,
                    phone: setEditPhone,
                     expiresAt: setEditExpiresAt, // Add this to onEditChange
                  }}
                  onUpdate={handleUpdateRestaurant}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}