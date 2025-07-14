'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export default function UserLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const email = username.includes('@') ? username : `${username}@krave.me`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let restaurantId = null;
      let branchId = null;

      let snapshot = await getDocs(
        query(collection(db, 'restaurantUsers'), where('uid', '==', user.uid))
      );

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        restaurantId = userDoc.data().restaurantId;
        // Ensure no stale branch access when logging in as a restaurant user
        localStorage.removeItem('branchId');
      } else {
        snapshot = await getDocs(
          query(collection(db, 'branchUsers'), where('uid', '==', user.uid))
        );
        if (snapshot.empty) throw new Error('No linked restaurant found.');
        const userDoc = snapshot.docs[0];
        restaurantId = userDoc.data().restaurantId;
        branchId = userDoc.data().branchId;
        localStorage.setItem('branchId', branchId);
      }

      // ✅ Fetch restaurant name and save to localStorage
      const restaurantSnap = await getDoc(doc(db, 'restaurants', restaurantId));
      const restaurantData = restaurantSnap.data();
      if (restaurantData?.name) {
        localStorage.setItem('restaurantName', restaurantData.name);
      }

      // ✅ Redirect to dashboard (keeps subdomain intact)
      router.push(`../admin/dashboard`);

    } catch (err) {
      console.error('Login failed:', err);
      setMessage('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Restaurant Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#7b68ee] focus:border-[#7b68ee]"
              placeholder="yourname or your@email.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-[#7b68ee] focus:border-[#7b68ee]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <div className="text-red-600 text-sm">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7b68ee] text-white py-2 px-4 rounded-md hover:bg-[#6a58d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b68ee]"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
