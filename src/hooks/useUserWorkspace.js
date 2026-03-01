import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set, serverTimestamp, remove, get } from 'firebase/database';
import { database } from '../firebase';

/**
 * Per-user workspace stored at: users/{uid}/workspace/
 * 
 * Structure:
 *   users/{uid}/workspace/
 *     recentlyViewed/       — notes & papers the user opened
 *     downloads/            — items the user downloaded
 *     searchHistory/        — past search queries
 *     favorites/            — bookmarked items
 */
export function useUserWorkspace(user) {
  const [workspace, setWorkspace] = useState({
    recentlyViewed: [],
    downloads: [],
    searchHistory: [],
    favorites: [],
    preferences: { branch: '', syllabus: '', semester: '' }
  });
  const [loading, setLoading] = useState(true);
  const [resourceKeys, setResourceKeys] = useState(new Set());

  const basePath = user ? `users/${user.uid}/workspace` : null;

  // Listen for ALL valid resource IDs to handle cleanup of deleted files
  useEffect(() => {
    const resRef = ref(database, 'resources');
    const unsub = onValue(resRef, (snap) => {
      const data = snap.val() || {};
      const keys = new Set();
      Object.keys(data).forEach(cat => {
        if (data[cat] && typeof data[cat] === 'object') {
          Object.keys(data[cat]).forEach(id => {
            keys.add(`${cat}_${id}`);
          });
        }
      });
      setResourceKeys(keys);
    });
    return () => unsub();
  }, []);

  // Listen for workspace data in real-time
  useEffect(() => {
    if (!basePath) {
      setLoading(false);
      return;
    }

    const workspaceRef = ref(database, basePath);
    const unsubscribe = onValue(
      workspaceRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        // Convert Firebase objects to sorted arrays (newest first)
        const toArray = (obj) => {
          if (!obj) return [];
          const entries = Object.entries(obj).map(([key, val]) => ({ id: key, ...val }));
          
          // Secondary deduplication & cleanup of deleted resources
          const seen = new Set();
          const uniqueEntries = entries.filter(item => {
            // Keep searches (they don't have itemId)
            if (!item.itemId || !item.type) return true;

            // Check if resource still exists
            const typeId = `${item.type}_${item.itemId}`;
            if (resourceKeys.size > 0 && !resourceKeys.has(typeId)) {
                return false; 
            }

            const deDupKey = `${item.type}_${item.itemId}`;
            if (seen.has(deDupKey)) return false;
            seen.add(deDupKey);
            return true;
          });

          return uniqueEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        };

        const workspaceData = {
          recentlyViewed: toArray(data.recentlyViewed),
          downloads: toArray(data.downloads),
          searchHistory: toArray(data.searchHistory),
          favorites: toArray(data.favorites),
          preferences: data.preferences || { branch: '', syllabus: '', semester: '' }
        };

        setWorkspace(workspaceData);
        setLoading(false);
      },
      (err) => {
        console.error('Error reading workspace:', err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [basePath]);

  // ── Actions ──

  const addRecentlyViewed = useCallback(
    async (item) => {
      if (!basePath || !item.itemId) return;
      
      // Use deterministic ID to prevent duplicates at DB level
      const recordId = `${item.type}_${item.itemId}`;
      const itemRef = ref(database, `${basePath}/recentlyViewed/${recordId}`);
      
      await set(itemRef, {
        ...item,
        timestamp: serverTimestamp(),
      });
    },
    [basePath]
  );

  const addDownload = useCallback(
    async (item) => {
      if (!basePath || !item.itemId) return;

      // Use deterministic ID to prevent duplicates at DB level
      const recordId = `${item.type}_${item.itemId}`;
      const itemRef = ref(database, `${basePath}/downloads/${recordId}`);
      
      await set(itemRef, {
        ...item,
        timestamp: serverTimestamp(),
      });
    },
    [basePath]
  );

  const addSearchQuery = useCallback(
    async (query) => {
      if (!basePath || !query.trim()) return;
      const trimmedQuery = query.trim();
      const queryId = btoa(trimmedQuery.toLowerCase()).replace(/[/+=]/g, '_'); // Safe ID

      const queryRef = ref(database, `${basePath}/searchHistory/${queryId}`);
      await set(queryRef, {
        query: trimmedQuery,
        timestamp: serverTimestamp(),
      });
    },
    [basePath]
  );

  const toggleFavorite = useCallback(
    async (item) => {
      if (!basePath) return;
      
      // Use deterministic ID for favorites too
      const recordId = `${item.type}_${item.itemId}`;
      const favRef = ref(database, `${basePath}/favorites/${recordId}`);
      
      const snapshot = await get(favRef);
      if (snapshot.exists()) {
        await remove(favRef);
      } else {
        await set(favRef, {
          ...item,
          timestamp: serverTimestamp(),
        });
      }
    },
    [basePath]
  );

  const isFavorited = useCallback(
    (itemId, type) => {
      return workspace.favorites.some(
        (f) => f.itemId === itemId && f.type === type
      );
    },
    [workspace.favorites]
  );

  const updatePreferences = useCallback(
    async (newPrefs) => {
      if (!basePath) return;
      const prefRef = ref(database, `${basePath}/preferences`);
      await set(prefRef, {
        ...workspace.preferences,
        ...newPrefs,
        lastUpdated: serverTimestamp()
      });
    },
    [basePath, workspace.preferences]
  );

  return {
    workspace,
    loading,
    addRecentlyViewed,
    addDownload,
    addSearchQuery,
    toggleFavorite,
    isFavorited,
    updatePreferences,
    preferences: workspace.preferences
  };
}
