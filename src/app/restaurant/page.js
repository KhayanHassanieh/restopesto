'use client';
import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const subdomain = typeof window !== 'undefined'
    ? window.location.hostname.split('.')[0]
    : null;

  useEffect(() => {
    if (!subdomain) return;

    async function fetchData() {
      const q = query(collection(db, 'restaurants'), where('subdomain', '==', subdomain));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const doc = snap.docs[0];
        const data = doc.data();
        const restId = doc.id;

        setRestaurant(data);

        const menuSnap = await getDocs(collection(db, 'restaurants', restId, 'menu'));
        setMenuItems(menuSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const catSnap = await getDocs(collection(db, 'restaurants', restId, 'categories'));
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    }

    fetchData();
  }, [subdomain]);

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div>
      <h1>{restaurant.name}</h1>
      {categories.map(cat => (
        <div key={cat.id}>
          <h2>{cat.name}</h2>
          {menuItems
            .filter(item => item.type === cat.id)
            .map(item => (
              <div key={item.id}>
                <p>{item.name} - ${item.price}</p>
                <p>{item.description}</p>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
