'use client';
import { use, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import OrderModal from '@/components/OrderModal';
import { db } from '@/firebase/firebaseConfig';

export default function TrackOrderPage({ params }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'orders', orderId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data();
        setOrder({
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      } else {
        setOrder(null);
      }
      setLoading(false);
    }, err => {
      console.error('Error loading order:', err);
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!order) {
    return <div className="flex justify-center items-center h-screen">Order not found</div>;
  }

  return <OrderModal order={order} mode="view" />;
}
