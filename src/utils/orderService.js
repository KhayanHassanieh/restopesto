// utils/orderService.js
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createOrder(orderData) {
  const orderRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    status: 'Ordered',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return orderRef;
}

export async function clearCart(cartId) {
  // Implement cart clearing logic based on your cart service
  // This might involve updating the cart document in Firestore
}