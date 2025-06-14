import { signInWithEmailAndPassword } from 'firebase/auth';

const handleLogin = async () => {
  const email = username.includes('@') ? username : `${username}@krave.me`;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const q = query(
      collection(db, 'restaurantUsers'),
      where('uid', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const userDoc = snapshot.docs[0];
    
    const { restaurantId } = userDoc.data();

    // Redirect to dashboard
    router.push(`/admin/dashboard?restaurantId=${restaurantId}`);
  } catch (err) {
    setMessage({ text: 'Invalid credentials', type: 'error' });
  }
};
