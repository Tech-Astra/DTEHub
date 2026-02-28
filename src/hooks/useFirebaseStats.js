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
    // 1. Session-based View Counter
    const SESSION_KEY = 'dte_hub_view_counted';
    if (!sessionStorage.getItem(SESSION_KEY)) {
      const viewsRef = ref(database, 'stats/totalViews');
      runTransaction(viewsRef, (currentValue) => {
        return (currentValue || 0) + 1;
      }).then(() => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        console.log('✅ New session view recorded');
      }).catch(err => console.error('View Counter Error:', err));
    }

    // 2. Listen to Stats Node (Views & Resources)
    const statsRef = ref(database, 'stats');
    const unsubscribeStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      // Seed totalResources with initial data if it's missing (one-time setup)
      if (data.totalResources === undefined) {
        runTransaction(ref(database, 'stats/totalResources'), () => 12);
      }

      setStats(prev => ({
        ...prev,
        totalViews: data.totalViews || 0,
        totalResources: data.totalResources || 0
      }));
    }, (err) => {
      console.error('Stats Read Error:', err);
      setError(err.message);
    });

    // 3. Count Verified Users directly from Users node
    // This is the most accurate way - counts every account in the DB
    const usersRef = ref(database, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const count = Object.keys(usersData).length;
        setStats(prev => ({
          ...prev,
          totalVerifiedUsers: count
        }));
      }
      setLoading(false);
    }, (err) => {
      console.error('Users Count Error:', err);
      setLoading(false);
    });

    return () => {
      unsubscribeStats();
      unsubscribeUsers();
    };
  }, []);

  return { stats, loading, error };
}
