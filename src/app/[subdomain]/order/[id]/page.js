'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default function TrackOrderPage({ params }) {
  const { subdomain, id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order #{order.id.slice(0,6)}</h1>
      <p className="mb-2"><span className="font-semibold">Status:</span> {order.status}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Items</h2>
      <ul className="list-disc ml-6">
        {order.items?.map((item, idx) => (
          <li key={idx}>{item.name} x{item.quantity}</li>
        ))}
      </ul>
      <p className="mt-4 font-bold">Total: ${order.finalTotal?.toFixed(2)}</p>
    </div>
  );
}
