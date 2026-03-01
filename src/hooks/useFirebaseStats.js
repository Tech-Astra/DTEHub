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

        // 2. Setup listeners for the users and resources lengths

        const usersRef = ref(database, 'users');
        const notesRef = ref(database, 'resources/notes');
        const papersRef = ref(database, 'resources/papers');
        const dcetRef = ref(database, 'resources/dcet');
        const statsViewsRef = ref(database, 'stats/totalViews');

        // Note: For large DBs, sending full objects onValue is heavy, 
        // but it fulfills the request of grabbing exact item count.

        let localUsers = 0;
        let localNotes = 0;
        let localPapers = 0;
        let localDcet = 0;
        let localViews = 0;

        const updateStats = () => {
          setStats({
            totalViews: localViews,
            totalResources: localNotes + localPapers + localDcet,
            totalVerifiedUsers: localUsers
          });
          setLoading(false);
        };

        const unsubUsers = onValue(usersRef, (snap) => {
          localUsers = snap.exists() ? Object.keys(snap.val()).length : 0;
          updateStats();
        });

        const unsubNotes = onValue(notesRef, (snap) => {
          localNotes = snap.exists() ? Object.keys(snap.val()).length : 0;
          updateStats();
        });

        const unsubPapers = onValue(papersRef, (snap) => {
          localPapers = snap.exists() ? Object.keys(snap.val()).length : 0;
          updateStats();
        });

        const unsubDcet = onValue(dcetRef, (snap) => {
          localDcet = snap.exists() ? Object.keys(snap.val()).length : 0;
          updateStats();
        });

        const unsubViews = onValue(statsViewsRef, (snapshot) => {
          localViews = snapshot.val() || 0;
          updateStats();
        });

        return () => {
          unsubUsers();
          unsubNotes();
          unsubPapers();
          unsubDcet();
          unsubViews();
        };

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
