import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
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
  });
  const [loading, setLoading] = useState(true);

  const basePath = user ? `users/${user.uid}/workspace` : null;

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
        const toArray = (obj) =>
          obj
            ? Object.entries(obj)
                .map(([key, val]) => ({ id: key, ...val }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            : [];

        setWorkspace({
          recentlyViewed: toArray(data.recentlyViewed),
          downloads: toArray(data.downloads),
          searchHistory: toArray(data.searchHistory),
          favorites: toArray(data.favorites),
        });
        setLoading(false);
      },
      (err) => {
        console.error('❌ Error reading workspace:', err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [basePath]);

  // ── Actions ──

  const addRecentlyViewed = useCallback(
    async (item) => {
      if (!basePath) return;
      const itemRef = push(ref(database, `${basePath}/recentlyViewed`));
      await set(itemRef, {
        ...item,
        timestamp: serverTimestamp(),
      });
    },
    [basePath]
  );

  const addDownload = useCallback(
    async (item) => {
      if (!basePath) return;
      const itemRef = push(ref(database, `${basePath}/downloads`));
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
      const queryRef = push(ref(database, `${basePath}/searchHistory`));
      await set(queryRef, {
        query: query.trim(),
        timestamp: serverTimestamp(),
      });
    },
    [basePath]
  );

  const toggleFavorite = useCallback(
    async (item) => {
      if (!basePath) return;
      // Check if already favorited
      const existing = workspace.favorites.find(
        (f) => f.itemId === item.itemId && f.type === item.type
      );
      if (existing) {
        // Remove favorite
        const favRef = ref(database, `${basePath}/favorites/${existing.id}`);
        await set(favRef, null);
      } else {
        // Add favorite
        const favRef = push(ref(database, `${basePath}/favorites`));
        await set(favRef, {
          ...item,
          timestamp: serverTimestamp(),
        });
      }
    },
    [basePath, workspace.favorites]
  );

  const isFavorited = useCallback(
    (itemId, type) => {
      return workspace.favorites.some(
        (f) => f.itemId === itemId && f.type === type
      );
    },
    [workspace.favorites]
  );

  return {
    workspace,
    loading,
    addRecentlyViewed,
    addDownload,
    addSearchQuery,
    toggleFavorite,
    isFavorited,
  };
}
