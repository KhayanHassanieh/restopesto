'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default function BranchManager({ restaurantId, visible }) {
  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState({ name: '', phone: '',  city: '', areas: '' });

  useEffect(() => {
    if (!visible) return;

    const fetchBranches = async () => {
      const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'branches'));
      setBranches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchBranches();
  }, [visible, restaurantId]);

  const addBranch = async () => {
    if (!newBranch.name || !newBranch.phone) return;
    const branchRef = collection(db, 'restaurants', restaurantId, 'branches');
    await addDoc(branchRef, {
  name: newBranch.name,
  phone: newBranch.phone,
  city: newBranch.city,
  areas: newBranch.areas.split(',').map(a => a.trim())
});

    setNewBranch({ name: '', phone: '', areas: '' });

    // Refresh list
    const snap = await getDocs(branchRef);
    setBranches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
</div>


        ))}
      </div>

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
