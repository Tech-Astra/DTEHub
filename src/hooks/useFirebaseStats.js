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

        // 2. Automated Stats Sync on Refresh
        // Fetch reality from all nodes
        const [usersSnap, notesSnap, papersSnap, dcetSnap] = await Promise.all([
          get(ref(database, 'users')),
          get(ref(database, 'resources/notes')),
          get(ref(database, 'resources/papers')),
          get(ref(database, 'resources/dcet'))
        ]);

        const actualUsers = usersSnap.exists() ? Object.keys(usersSnap.val()).length : 0;
        const actualResources = 
          (notesSnap.exists() ? Object.keys(notesSnap.val()).length : 0) +
          (papersSnap.exists() ? Object.keys(papersSnap.val()).length : 0) +
          (dcetSnap.exists() ? Object.keys(dcetSnap.val()).length : 0);

        // Calibrate the stats node so previous and current data match perfectly
        await Promise.all([
          set(ref(database, 'stats/totalVerifiedUsers'), actualUsers),
          set(ref(database, 'stats/totalResources'), actualResources)
        ]);

        // 3. Setup listener for the calibrated stats
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

    let unsubscribeStats = () => {};
    syncAndListen().then(cleanup => {
      if (typeof cleanup === 'function') unsubscribeStats = cleanup;
    });

    return () => unsubscribeStats();
  }, []);

  return { stats, loading, error };
}
