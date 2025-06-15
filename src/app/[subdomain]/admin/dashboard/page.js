'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function DashboardPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user logged in — redirect to login
        router.push('/admin/login');
      }
    });

    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('restaurantName');
      if (name) setRestaurantName(name);
    }

    return () => unsubscribe();
  }, [router]);

  return (
    <h1 className="text-2xl font-semibold text-gray-800 mb-4">
      Welcome, {restaurantName}
    </h1>
  );
}
