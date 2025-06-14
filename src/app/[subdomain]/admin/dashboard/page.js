'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function DashboardPage() {
  const [restaurantName, setRestaurantName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('restaurantName');
      if (name) setRestaurantName(name);
    }
  }, []);
return(<h1 className="text-2xl font-semibold text-gray-800 mb-4">
    Welcome, {restaurantName}
  </h1>)

}
