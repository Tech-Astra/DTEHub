import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { ref, set, get, serverTimestamp, runTransaction } from 'firebase/database';
import { auth, googleProvider, database } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Info: Standard browser log, not an error - adblockers often block Google tracking logs.
    // DTEHub Auth engine is initializing...
    console.info("DTEHub Auth: Initializing high-reliability session check...");

    // Check for redirect results (handles return from redirect-based sign-ins)
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.info("DTEHub Auth: Successfully resolved redirect credentials.");
          setUser(result.user);
        }
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          console.error("DTEHub Auth: Redirect resolution anomaly:", error);
        }
      }
    };
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Set user immediately so protected routes work right away
          setUser(firebaseUser);
          // ... rest of logic stays same
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.info("DTEHub Auth: Initiating secure Google handshake...");
      // Try popup first (best for desktop/unrestricted mobile)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (popupError) {
        // Fallback to redirect if popup is blocked or fails on mobile
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
          console.info("DTEHub Auth: Popup restricted. Transitioning to secure redirect flow.");
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error('DTEHub Auth: Handshake failed:', error);
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
