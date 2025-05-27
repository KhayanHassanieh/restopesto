'use client';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default function BranchManager({ restaurantId, visible }) {
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState({ name: '', phone: '', city: '', areas: '' });
  const [editingBranch, setEditingBranch] = useState(null); // To handle editing
  
  // Use useRef to persist the fetched data across visibility toggles
  const fetchedRestaurants = useRef({}); // Track fetched branches per restaurant using useRef
  const hasCheckedCache = useRef(false); // Track if we've already checked the cache

  useEffect(() => {
    if (!visible || hasCheckedCache.current) return; // Only run if visible and cache has not been checked

    console.log(`Checking for cached data for restaurant ${restaurantId}`);
    // Check if branches for this restaurant are already cached in localStorage
    const cachedData = localStorage.getItem(`branches-${restaurantId}`);

    if (cachedData) {
      console.log(`Using cached data for restaurant ${restaurantId} from localStorage`);
      setBranches(JSON.parse(cachedData)); // Use the cached data from localStorage
      hasCheckedCache.current = true; // Mark cache as checked
      return; // Skip fetching from Firestore
    }

    console.log(`No cached data for restaurant ${restaurantId}, fetching from Firestore`);

    // Fetch branches if not cached
    const fetchBranches = async () => {
      console.log('Fetching branches from Firestore');
      const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'branches'));
      const branchesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBranches(branchesData);

      // Cache the fetched branches for future visibility toggles
      localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(branchesData));
      hasCheckedCache.current = true; // Mark cache as checked
    };

    fetchBranches();
  }, [visible, restaurantId]); // This effect runs when `visible` or `restaurantId` changes

  const addBranch = async () => {
    if (!newBranch.name || !newBranch.phone) return;
    const branchRef = collection(db, 'restaurants', restaurantId, 'branches');
    await addDoc(branchRef, {
      name: newBranch.name,
      phone: newBranch.phone,
      city: newBranch.city,
      areas: newBranch.areas.split(',').map(a => a.trim())
    });

    setNewBranch({ name: '', phone: '', city: '', areas: '' });

    // Refresh the cached list of branches after adding a new one
    const snap = await getDocs(branchRef);
    const newBranches = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBranches(newBranches);
    localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(newBranches)); // Update the cache
  };

  const deleteBranch = async (branchId) => {
    try {
      console.log('Deleting branch:', branchId);
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'branches', branchId));
      setBranches(prevBranches => prevBranches.filter(branch => branch.id !== branchId));
      
      // Update cache after deletion
      const updatedBranches = branches.filter(branch => branch.id !== branchId);
      localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(updatedBranches)); // Update the cache
    } catch (err) {
      console.error("Error deleting branch:", err);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch({ ...branch }); // Populate the editing form with the current branch data
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch) return;

    const updatedBranch = { ...editingBranch };

    // Ensure areas is an array, split the string by commas and trim spaces
    if (typeof updatedBranch.areas === 'string') {
      updatedBranch.areas = updatedBranch.areas.split(',').map(a => a.trim());
    }

    const branchRef = doc(db, 'restaurants', restaurantId, 'branches', updatedBranch.id);
    await updateDoc(branchRef, {
      name: updatedBranch.name,
      phone: updatedBranch.phone,
      city: updatedBranch.city,
      areas: updatedBranch.areas
    });

    // Update the branches list locally
    setBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.id === updatedBranch.id ? { ...branch, ...updatedBranch } : branch
      )
    );

    // Update cache after update
    const updatedBranches = branches.map(branch =>
      branch.id === updatedBranch.id ? { ...branch, ...updatedBranch } : branch
    );
    localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(updatedBranches)); // Update the cache

    setEditingBranch(null); // Reset the editing form
  };

  if (!visible) return null;

  return (
    <div className="bg-gray-100 p-4 rounded w-full mt-2">
      <h3 className="font-semibold mb-2 text-gray-800">Branches</h3>
      <div className="space-y-2">
        {branches.map(branch => (
          <div key={branch.id} className="p-2 border rounded bg-white">
            <p className="text-gray-800"><strong>{branch.name}</strong> 📞 {branch.phone}</p>
            <p className="text-sm text-gray-800">City: {branch.city || 'N/A'}</p>
            <p className="text-sm text-gray-800">
              Delivers to: {Array.isArray(branch.areas) ? branch.areas.join(', ') : 'No areas'}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEditBranch(branch)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBranch(branch.id)}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingBranch && (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            placeholder="Branch Name"
            className="w-full border p-2 rounded text-gray-800"
            value={editingBranch.name}
            onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="w-full border p-2 rounded text-gray-800"
            value={editingBranch.phone}
            onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            className="w-full border p-2 rounded text-gray-800"
            value={editingBranch.city}
            onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="Areas (comma separated)"
            className="w-full border p-2 rounded text-gray-800"
            value={editingBranch.areas.join(', ')} // Join array elements with commas
            onChange={(e) => setEditingBranch({ ...editingBranch, areas: e.target.value.split(',').map(a => a.trim()) })}
          />
          <button
            onClick={handleUpdateBranch}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <input
          type="text"
          placeholder="Branch Name"
          className="w-full border p-2 rounded text-gray-800"
          value={newBranch.name}
          onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          className="w-full border p-2 rounded text-gray-800"
          value={newBranch.phone}
          onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="City"
          className="w-full border p-2 rounded text-gray-800"
          value={newBranch.city}
          onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="Areas (comma separated)"
          className="w-full border p-2 rounded text-gray-800"
          value={newBranch.areas}
          onChange={(e) => setNewBranch({ ...newBranch, areas: e.target.value })}
        />
        <button onClick={addBranch} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Branch
        </button>
      </div>
    </div>
  );
}
