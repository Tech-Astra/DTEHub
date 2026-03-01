import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ref, set, get, serverTimestamp, runTransaction } from 'firebase/database';
import { auth, googleProvider, database } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Set user immediately so protected routes work right away
          setUser(firebaseUser);

          // Update user profile in Realtime Database in the background
          // These operations should NOT block auth state resolution
          try {
            const userRef = ref(database, `users/${firebaseUser.uid}`);
            const snapshot = await get(userRef);
            const existingData = snapshot.val() || {};

            // If it's a new user, increment the global verified users counter
            if (!existingData.createdAt) {
              const statsRef = ref(database, 'stats/totalVerifiedUsers');
              runTransaction(statsRef, (count) => {
                return (count || 0) + 1;
              }).catch(err => console.error('Error incrementing user count:', err));
            }

            await set(userRef, {
              ...existingData,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified || false,
              lastLoginAt: serverTimestamp(),
              ...(existingData.createdAt ? {} : { createdAt: serverTimestamp() }),
            });
          } catch (dbError) {
            // Database write errors should NOT block user from accessing the app
            console.error('Error updating user profile in DB:', dbError);
          }
        } else {
          setUser(null);
        }
      } finally {
        // Always mark loading as done, even if DB operations fail
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const { signInWithRedirect } = await import('firebase/auth');
      await signInWithRedirect(auth, googleProvider);
      // signInWithRedirect does not return anything, browser redirects away
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return { user, loading, loginWithGoogle, logout };
}
