import { db } from '@/firebase/firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  addDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// 🛒 Create a new shared cart
export const createCart = async ({ restaurantId, createdBy }) => {
  const cartId = uuidv4();
  const cartRef = doc(db, 'carts', cartId);
  const cartData = {
    restaurantId,
    createdBy: createdBy || null,
    createdAt: serverTimestamp(),
    items: [],
    status: 'active', // 'active' | 'ordered' | 'abandoned'
    address: null,
    location: null,
  };
  await setDoc(cartRef, cartData);
  return cartId;
};

// ➕ Add item to cart
export const addItemToCart = async (cartId, item) => {
  const cartRef = doc(db, 'carts', cartId);
  await updateDoc(cartRef, {
    items: arrayUnion(item),
  });
};

export const subscribeToCart = (cartId, onUpdate) => {
  const cartRef = doc(db, 'carts', cartId);
  return onSnapshot(cartRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate({ id: docSnap.id, ...docSnap.data() });
    }
  });
};

// ❌ Remove item from cart by customKey
export const removeItemFromCart = async (cartId, itemKey) => {
  const cartRef = doc(db, 'carts', cartId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) throw new Error('Cart not found');

  const existingItems = cartSnap.data().items || [];
  const updatedItems = existingItems.filter(item => item.customKey !== itemKey);

  await updateDoc(cartRef, { items: updatedItems });
};

// 📦 Get the cart
export const getCart = async (cartId) => {
  const cartRef = doc(db, 'carts', cartId);
  const cartSnap = await getDoc(cartRef);
  if (cartSnap.exists()) {
    return { id: cartSnap.id, ...cartSnap.data() };
  } else {
    throw new Error('Cart not found');
  }
};

// 📍 Save address info
export const updateCartAddress = async (cartId, addressObj) => {
  const cartRef = doc(db, 'carts', cartId);
  await updateDoc(cartRef, {
    address: addressObj,
  });
};

// 📌 Save Google Maps location
export const updateCartLocation = async (cartId, location) => {
  const cartRef = doc(db, 'carts', cartId);
  await updateDoc(cartRef, {
    location,
  });
};

// ✅ Confirm order from cart
export const placeOrderFromCart = async (cartId) => {
  const cartRef = doc(db, 'carts', cartId);
  const cartSnap = await getDoc(cartRef);

  if (!cartSnap.exists()) throw new Error('Cart not found');

  const cartData = cartSnap.data();

  // Create order doc
  await addDoc(collection(db, 'orders'), {
    ...cartData,
    cartId,
    orderedAt: new Date(),
    status: 'placed', // optionally: placed | preparing | delivered
  });

  // Update cart status to 'ordered'
  await updateDoc(cartRef, { status: 'ordered' });
};
