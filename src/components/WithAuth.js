// components/WithAuth.js
'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/admin/login');
          return;
        }
        setAuthChecked(true);
      });

      return () => unsubscribe();
    }, [router]);

    if (!authChecked) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7b68ee]"></div>
            <p className="mt-3 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}