import { useState, useEffect } from 'react';
import { ref, onValue, runTransaction, get, set } from 'firebase/database';
import { database } from '../firebase';

export function useFirebaseStats() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalResources: 0,
    totalVerifiedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncAndListen = async () => {
      try {
        // 1. Session-based View Counter
        const SESSION_KEY = 'dte_hub_view_counted';
        if (!sessionStorage.getItem(SESSION_KEY)) {
          const viewsRef = ref(database, 'stats/totalViews');
          await runTransaction(viewsRef, (currentValue) => {
            return (currentValue || 0) + 1;
          });
          sessionStorage.setItem(SESSION_KEY, 'true');
        }

        // 2. Setup listener for the stats node

        const statsRef = ref(database, 'stats');
        const unsubscribe = onValue(statsRef, (snapshot) => {
          const data = snapshot.val() || {};
          setStats({
            totalViews: data.totalViews || 0,
            totalResources: data.totalResources || 0,
            totalVerifiedUsers: data.totalVerifiedUsers || 0
          });
          setLoading(false);
        });

        return unsubscribe;

      } catch (err) {
        console.error('Stats Sync Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    let unsubscribeStats = () => { };
    syncAndListen().then(cleanup => {
      if (typeof cleanup === 'function') unsubscribeStats = cleanup;
    });

    return () => unsubscribeStats();
  }, []);

  return { stats, loading, error };
}
