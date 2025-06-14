//dashboard screen
'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import RestaurantCard from '@/components/RestaurantCard';
import withAuth from '@/components/WithAuth';
import { SketchPicker } from 'react-color';
function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // New state to track auth check
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState({});
  const [openBranchId, setOpenBranchId] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editBackgroundImageFile, setEditBackgroundImageFile] = useState(null);
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7b68ee');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#f76c5e');
  const router = useRouter();
  const storage = getStorage();

  const fetchRestaurants = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);
  // Show loading state until auth check is complete
  // Show loading state until auth check is complete

  const [showPicker, setShowPicker] = useState({
    primary: false,
    background: false,
    accent: false
  });
  const togglePicker = (key) => {
    setShowPicker((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const fetchBranches = async (restaurantId) => {
    if (!branches[restaurantId]) {
      try {
        const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'branches'));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBranches((prev) => ({ ...prev, [restaurantId]: data }));
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
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

    if (!name || !subdomain || !phone || !username || !password) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const email = username.includes('@') ? username : `${username}@krave.me`;

      // 1. Try creating the user FIRST
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Handle image uploads
      let uploadedLogoUrl = '';
      let uploadedBgUrl = '';

      if (logoFile) uploadedLogoUrl = await handleLogoUpload(logoFile);
      if (backgroundImageFile) {
        const bgStorageRef = ref(storage, `restaurant_backgrounds/${backgroundImageFile.name}`);
        await uploadBytes(bgStorageRef, backgroundImageFile);
        uploadedBgUrl = await getDownloadURL(bgStorageRef);
      }

      // 3. Create restaurant doc
      const restaurantData = {
        name,
        subdomain,
        phone,
        subscriptionDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        logoUrl: uploadedLogoUrl,
        backgroundImageUrl: uploadedBgUrl,
        theme: {
          primaryColor,
          backgroundColor,
          accentColor
        }
      };

      const docRef = await addDoc(collection(db, 'restaurants'), restaurantData);
      const restaurantId = docRef.id;

      // 4. Save user link
      await addDoc(collection(db, 'restaurantUsers'), {
        uid: user.uid,
        restaurantId,
        email,
        createdAt: new Date()
      });

      // 5. Clear form
      setMessage({ text: 'Restaurant and user added successfully!', type: 'success' });
      setName('');
      setSubdomain('');
      setPhone('');
      setUsername('');
      setPassword('');
      setLogoFile(null);
      setBackgroundImageFile(null);
      setIsAdding(false);
      fetchRestaurants();
      setSubmitting(true);
    } catch (err) {
      setSubmitting(true);
      if (err.code === 'auth/email-already-in-use') {
        setMessage({ text: 'This username is already taken. Choose another one.', type: 'error' });
      } else {
        console.error('Error adding restaurant:', err);
        setMessage({ text: `Error: ${err.message}`, type: 'error' });
        setSubmitting(true);
      }
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

      let dateValue = '';
      if (restaurant.expiresAt) {
        const date = restaurant.expiresAt.toDate
          ? restaurant.expiresAt.toDate()
          : new Date(restaurant.expiresAt);
        dateValue = date.toISOString().split('T')[0];
      }
      setEditExpiresAt(dateValue);

      // load theme colors
      setPrimaryColor(restaurant?.theme?.primaryColor || '#7b68ee');
      setBackgroundColor(restaurant?.theme?.backgroundColor || '#ffffff');
      setAccentColor(restaurant?.theme?.accentColor || '#9013FE');

      setOpenBranchId(null);
    }
  };


  const handleUpdateRestaurant = async (updatedData) => {
    try {
      let bgImageUrl = restaurants.find(r => r.id === editMode)?.backgroundImageUrl || '';
      let logoUrl = restaurants.find(r => r.id === editMode)?.logoUrl || '';
  
      if (updatedData.backgroundImageFile) {
        const bgStorageRef = ref(storage, `restaurant_backgrounds/${updatedData.backgroundImageFile.name}`);
        await uploadBytes(bgStorageRef, updatedData.backgroundImageFile);
        bgImageUrl = await getDownloadURL(bgStorageRef);
      }
  
      if (updatedData.logoFile) {
        const logoRef = ref(storage, `restaurant_logos/${updatedData.logoFile.name}`);
        await uploadBytes(logoRef, updatedData.logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }
  
      // 1. Update restaurant doc
      await updateDoc(doc(db, 'restaurants', editMode), {
        name: updatedData.name || editName,
        subdomain: updatedData.subdomain || editSubdomain,
        phone: updatedData.phone || editPhone,
        expiresAt: Timestamp.fromDate(new Date(updatedData.expiresAt || editExpiresAt)),
        ...(bgImageUrl && { backgroundImageUrl: bgImageUrl }),
        ...(logoUrl && { logoUrl }),
        theme: {
          primaryColor,
          backgroundColor,
          accentColor,
        }
      });
  
      // 2. Update related restaurant user (Firestore + Auth via Cloud Function)
      const userSnap = await getDocs(
        query(collection(db, 'restaurantUsers'), where('restaurantId', '==', editMode))
      );
  
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const currentEmail = userDoc.data().email;
        const uid = userDoc.data().uid;
  
        const newEmail = updatedData.username?.includes('@')
          ? updatedData.username
          : `${updatedData.username}@krave.me`;
  
        const emailChanged = newEmail && newEmail !== currentEmail;
        const passwordChanged = updatedData.password && updatedData.password.length > 0;
  
        if (emailChanged || passwordChanged) {
          // Update Firestore email field if needed
          if (emailChanged) {
            await updateDoc(doc(db, 'restaurantUsers', userDoc.id), {
              email: newEmail,
              updatedAt: new Date()
            });
          }
  
          // Call Cloud Function to update Firebase Auth user
          const userToken = await auth.currentUser.getIdToken();
          await fetch("https://us-central1-restopesto-a4825.cloudfunctions.net/updateRestaurantUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({
              uid,
              ...(emailChanged && { newEmail }),
              ...(passwordChanged && { newPassword: updatedData.password })
            })
          });
          toast.success('User credentials updated successfully!');
        }
      }
  
      setEditMode(null);
      fetchRestaurants();
    } catch (err) {
      console.error('Update failed:', err);
      setMessage({ text: `Update failed: ${err.message}`, type: 'error' });
    }
  };
  

  const handleToggleBranches = async (id) => {
    const newId = openBranchId === id ? null : id;
    setOpenBranchId(newId);
    setEditMode(null);
    if (newId && !branches[id]) await fetchBranches(id);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7b68ee]"></div>
          <p className="mt-3 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
            <p className="text-gray-600">Manage your restaurants and branches</p>
          </div>
          <div className="flex gap-2">

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7b68ee] hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
            >
              {isAdding ? (
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              {isAdding ? 'Cancel' : 'Add Restaurant'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
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
                  <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700">
                    Background Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      id="backgroundImage"
                      name="backgroundImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBackgroundImageFile(e.target.files[0])}
                      className="py-2 px-3 block w-full shadow-sm focus:ring-[#7b68ee] focus:border-[#7b68ee] border border-gray-300 rounded-md text-gray-400"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    This will be the background image behind your logo on the restaurant page
                  </p>
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
                      .krave.me
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
                <div className="sm:col-span-3">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 placeholder:text-gray-400 text-gray-800"
                    placeholder="owner@example.com"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 placeholder:text-gray-400 text-gray-800"
                    placeholder="••••••••"
                  />
                </div>

                {/* Primary Color */}
                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      onClick={() => togglePicker('primary')}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm  text-gray-800"
                    />
                    <div
                      className="w-6 h-6 rounded border cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => togglePicker('primary')}
                    />
                  </div>
                  {showPicker.primary && (
                    <div className="mt-2 z-10">
                      <SketchPicker
                        className='text-gray-800'
                        color={primaryColor}
                        onChangeComplete={(color) => setPrimaryColor(color.hex)}
                      />
                    </div>
                  )}
                </div>

                {/* Background Color */}
                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700">Background Color</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      onClick={() => togglePicker('background')}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm text-gray-800"
                    />
                    <div
                      className="w-6 h-6 rounded border cursor-pointer"
                      style={{ backgroundColor: backgroundColor }}
                      onClick={() => togglePicker('background')}
                    />
                  </div>
                  {showPicker.background && (
                    <div className="mt-2 z-10">
                      <SketchPicker
                        className='text-gray-800'
                        color={backgroundColor}
                        onChangeComplete={(color) => setBackgroundColor(color.hex)}
                      />
                    </div>
                  )}
                </div>

                {/* Accent Color */}
                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700">Accent Color</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      onClick={() => togglePicker('accent')}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7b68ee] focus:border-[#7b68ee] sm:text-sm  text-gray-800"
                    />
                    <div
                      className="w-6 h-6 rounded border cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                      onClick={() => togglePicker('accent')}
                    />
                  </div>
                  {showPicker.accent && (
                    <div className="mt-2 z-10">
                      <SketchPicker
                        color={accentColor}
                        className='text-gray-800'
                        onChangeComplete={(color) => setAccentColor(color.hex)}
                      />
                    </div>
                  )}
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
                  disabled={submitting}
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
                <div key={r.id}>
                  <RestaurantCard
                    restaurant={r}
                    branches={branches[r.id] || []}
                    openBranchId={openBranchId}
                    editMode={editMode}
                    editName={editName}
                    editSubdomain={editSubdomain}
                    editPhone={editPhone}
                    editExpiresAt={editExpiresAt}
                    onToggleBranches={handleToggleBranches}
                    onToggleEdit={() => toggleEdit(r)}
                    onEditChange={{
                      name: setEditName,
                      subdomain: setEditSubdomain,
                      phone: setEditPhone,
                      expiresAt: setEditExpiresAt,
                    }}
                    onUpdate={handleUpdateRestaurant}
                    onToggleActive={handleToggleActive}

                    primaryColor={primaryColor}
                    setPrimaryColor={setPrimaryColor}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={setBackgroundColor}
                    accentColor={accentColor}
                    setAccentColor={setAccentColor}


                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);