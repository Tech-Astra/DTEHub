import { useState, useEffect } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
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
    // Track counts from multiple nodes
    let notesCount = 0;
    let dcetCount = 0;
    let usersCount = 0;
    let viewsCount = 0;
    let ready = { notes: false, dcet: false, users: false, views: false };

    const updateStats = () => {
      // Only update once all listeners have fired at least once
      if (ready.notes && ready.dcet && ready.users && ready.views) {
        setStats({
          totalResources: notesCount + dcetCount,
          totalVerifiedUsers: usersCount,
          totalViews: viewsCount,
        });
        setLoading(false);
      }
    };

    try {
      // 1. Session-based View Counter (increment once per session)
      const SESSION_KEY = 'dte_hub_view_counted';
      if (!sessionStorage.getItem(SESSION_KEY)) {
        const viewsRef = ref(database, 'stats/totalViews');
        runTransaction(viewsRef, (currentValue) => (currentValue || 0) + 1);
        sessionStorage.setItem(SESSION_KEY, 'true');
      }

      // 2. Listen to stats/totalViews (this is a counter, not derivable)
      const unsubViews = onValue(ref(database, 'stats/totalViews'), (snap) => {
        viewsCount = snap.val() || 0;
        ready.views = true;
        updateStats();
      });

      // 3. Listen to resources/notes — count all items
      const unsubNotes = onValue(ref(database, 'resources/notes'), (snap) => {
        notesCount = snap.exists() ? Object.keys(snap.val()).length : 0;
        ready.notes = true;
        updateStats();
      });

      // 4. Listen to resources/dcet — count all items
      const unsubDcet = onValue(ref(database, 'resources/dcet'), (snap) => {
        dcetCount = snap.exists() ? Object.keys(snap.val()).length : 0;
        ready.dcet = true;
        updateStats();
      });

      // 5. Listen to users node for accurate count (requires auth)
      //    Falls back to stats/totalVerifiedUsers for public visitors
      let unsubUsersFallback = null;
      const unsubUsers = onValue(ref(database, 'users'), (snap) => {
        usersCount = snap.exists() ? Object.keys(snap.val()).length : 0;
        ready.users = true;
        updateStats();
      }, (err) => {
        // Fallback for unauthenticated users who cannot read /users
        unsubUsersFallback = onValue(ref(database, 'stats/totalVerifiedUsers'), (snap) => {
          usersCount = snap.val() || 0;
          ready.users = true;
          updateStats();
        });
      });

      return () => {
        unsubViews();
        unsubNotes();
        unsubDcet();
        unsubUsers();
        if (unsubUsersFallback) unsubUsersFallback();
      };
    } catch (err) {
      console.error('Stats Sync Error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return { stats, loading, error };
}
