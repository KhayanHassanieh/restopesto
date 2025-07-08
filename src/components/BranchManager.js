'use client';
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default function BranchManager({ restaurantId, visible }) {
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState({ name: '', phone: '',openingHours:'',location:'' , city: '', areas: '',instagramURL:'',tiktokURL:'',facebookURL:''  });
  const [editingBranch, setEditingBranch] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const fetchedRestaurants = useRef({});
  const hasCheckedCache = useRef(false);

  useEffect(() => {
    if (!visible || hasCheckedCache.current) return;

    const cachedData = localStorage.getItem(`branches-${restaurantId}`);

    if (cachedData) {
      setBranches(JSON.parse(cachedData));
      hasCheckedCache.current = true;
      return;
    }

    const fetchBranches = async () => {
      const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'branches'));
      const branchesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBranches(branchesData);
      localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(branchesData));
      hasCheckedCache.current = true;
    };

    fetchBranches();
  }, [visible, restaurantId]);

  const addBranch = async () => {
    if (!newBranch.name || !newBranch.phone) return;
    const branchRef = collection(db, 'restaurants', restaurantId, 'branches');
    await addDoc(branchRef, {
      name: newBranch.name,
      phone: newBranch.phone,
      openingHours: newBranch.openingHours,
      location: newBranch.location,
      city: newBranch.city,
      instagramURL: newBranch.instagramURL,
      tiktokURL: newBranch.tiktokURL,
      facebookURL: newBranch.facebookURL,
      areas: newBranch.areas.split(',').map(a => a.trim())
    });

    setNewBranch({ name: '', phone: '',openingHours:'',location:'' , city: '', areas: '',instagramURL:'',tiktokURL:'',facebookURL:'' });
    setIsAdding(false);

    const snap = await getDocs(branchRef);
    const newBranches = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBranches(newBranches);
    localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(newBranches));
  };

  const deleteBranch = async (branchId) => {
    try {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'branches', branchId));
      setBranches(prevBranches => prevBranches.filter(branch => branch.id !== branchId));
      
      const updatedBranches = branches.filter(branch => branch.id !== branchId);
      localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(updatedBranches));
    } catch (err) {
      console.error("Error deleting branch:", err);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch({ ...branch });
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch) return;

    const updatedBranch = { ...editingBranch };

    if (typeof updatedBranch.areas === 'string') {
      updatedBranch.areas = updatedBranch.areas.split(',').map(a => a.trim());
    }

    const branchRef = doc(db, 'restaurants', restaurantId, 'branches', updatedBranch.id);
    await updateDoc(branchRef, {
      name: updatedBranch.name,
      phone: updatedBranch.phone,
      openingHours: updatedBranch.openingHours,
      location: updatedBranch.location,
      city: updatedBranch.city,
      instagramURL: updatedBranch.instagramURL,
      tiktokURL: updatedBranch.tiktokURL,
      facebookURL: updatedBranch.facebookURL,
      areas: updatedBranch.areas
    });

    setBranches(prevBranches =>
      prevBranches.map(branch =>
        branch.id === updatedBranch.id ? { ...branch, ...updatedBranch } : branch
      )
    );

    const updatedBranches = branches.map(branch =>
      branch.id === updatedBranch.id ? { ...branch, ...updatedBranch } : branch
    );
    localStorage.setItem(`branches-${restaurantId}`, JSON.stringify(updatedBranches));

    setEditingBranch(null);
  };

  if (!visible) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Branches</h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-[#7b68ee] hover:bg-[#6a58d6] text-white rounded-md text-sm font-medium transition-colors"
          >
            + Add Branch
          </button>
        )}
      </div>

      <div className="space-y-3">
        {branches.map(branch => (
          <div key={branch.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900 mr-2">{branch.name}</h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {branch.city || 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {branch.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Delivery Areas:</span> {Array.isArray(branch.areas) ? branch.areas.join(', ') : 'None specified'}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => handleEditBranch(branch)}
                  aria-label="Edit branch"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  onClick={() => deleteBranch(branch.id)}
                  aria-label="Delete branch"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {editingBranch?.id === branch.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.name}
                      onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.phone}
                      onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.city}
                      onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Areas (comma separated)</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={Array.isArray(editingBranch.areas) ? editingBranch.areas.join(', ') : editingBranch.areas}
                      onChange={(e) => setEditingBranch({ ...editingBranch, areas: e.target.value })}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.openingHours}
                      onChange={(e) => setEditingBranch({ ...editingBranch, openingHours: e.target.value })}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.location}
                      onChange={(e) => setEditingBranch({ ...editingBranch, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Page</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.instagramURL}
                      onChange={(e) => setEditingBranch({ ...editingBranch, instagramURL: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiktok Page</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.tiktokURL}
                      onChange={(e) => setEditingBranch({ ...editingBranch, tiktokURL: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={editingBranch.facebookURL}
                      onChange={(e) => setEditingBranch({ ...editingBranch, facebookURL: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setEditingBranch(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateBranch}
                    className="px-4 py-2 bg-[#7b68ee] hover:bg-[#6a58d6] text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Add New Branch</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name*</label>
              <input
                type="text"
                placeholder="e.g. Downtown Branch"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
              <input
                type="text"
                placeholder="e.g. +1234567890"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.phone}
                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. New York"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.city}
                onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Areas</label>
              <input
                type="text"
                placeholder="e.g. Downtown, Midtown, Uptown"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.areas}
                onChange={(e) => setNewBranch({ ...newBranch, areas: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
              <input
                type="text"
                placeholder="9:00 AM - 12:00 PM"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.openingHours}
                onChange={(e) => setNewBranch({ ...newBranch, openingHours: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Downtown - Beirut"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.location}
                onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Page</label>
              <input
                type="text"
                placeholder="https://instagram/krave.me"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.instagramURL}
                onChange={(e) => setNewBranch({ ...newBranch, instagramURL: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiktok Page</label>
              <input
                type="text"
                placeholder="https://www.tiktok.com/@krave.me"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.tiktokURL}
                onChange={(e) => setNewBranch({ ...newBranch, tiktokURL: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page</label>
              <input
                type="text"
                placeholder="https://www.facebook.com/krave.me/"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newBranch.facebookURL}
                onChange={(e) => setNewBranch({ ...newBranch, facebookURL: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addBranch}
              className="px-4 py-2 bg-[#7b68ee] hover:bg-[#6a58d6] text-white rounded-md text-sm font-medium transition-colors"
              disabled={!newBranch.name || !newBranch.phone}
            >
              Add Branch
            </button>
          </div>
        </div>
      )}

      {branches.length === 0 && !isAdding && (
        <div className="text-center py-8">
          
          <h3 className="mt-2 text-sm font-medium text-gray-900">No branches</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first branch.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center px-4 py-2 bg-[#7b68ee] hover:bg-[#6a58d6] text-white rounded-md text-sm font-medium transition-colors"
            >
             
              Add Branch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}