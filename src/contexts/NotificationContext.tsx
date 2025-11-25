import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getBackendUrl } from '../utils/backendUrl';
import { useAuth } from '../hooks/useAuth';
import { getSocket } from '../utils/socket';
import { syncIfOnline, queueSyncAction } from '../services/notificationSync';

export interface Notification {
  id: string;
  userId: string;
  type: 'live-update' | 'board' | 'timer' | 'admin' | 'twitch' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  metadata?: {
    timerDuration?: number;
    timerType?: 'focus' | 'break';
    link?: string;
    actor?: { id: string; name: string };
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  addNotification: (notification: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DB_NAME = 'ventures_notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('read', 'read', { unique: false });
      }
    };
  });
};

// Save to IndexedDB
const saveToIndexedDB = async (notifications: Notification[]): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Clear existing
    await store.clear();
    
    // Add all notifications
    for (const notification of notifications) {
      await store.add(notification);
    }
    
    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
  }
};

// Load from IndexedDB
const loadFromIndexedDB = async (): Promise<Notification[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    return [];
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationsRef = useRef<Notification[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/notifications?per_page=50`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        // Save to IndexedDB
        await saveToIndexedDB(data.notifications || []);
      } else {
        // Try loading from IndexedDB if backend fails
        const cached = await loadFromIndexedDB();
        setNotifications(cached);
        if (response.status !== 401) {
          setError('Failed to fetch notifications');
        }
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      // Try loading from IndexedDB
      const cached = await loadFromIndexedDB();
      setNotifications(cached);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Add notification
  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>) => {
    if (!isAuthenticated || !user) {
      // Add to local state only
      const newNotification: Notification = {
        ...notificationData,
        id: `local_${Date.now()}`,
        userId: 'local',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
        return updated;
      });
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/notifications`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
          return updated;
        });
      } else {
        // Add to local state if backend fails
        const newNotification: Notification = {
          ...notificationData,
          id: `local_${Date.now()}`,
          userId: user.id,
          timestamp: new Date().toISOString(),
          read: false,
        };
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
          return updated;
        });
      }
    } catch (err: any) {
      console.error('Error adding notification:', err);
      // Add to local state
      const newNotification: Notification = {
        ...notificationData,
        id: `local_${Date.now()}`,
        userId: user?.id || 'local',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
        return updated;
      });
    }
  }, [isAuthenticated, user]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
      return updated;
    });

    if (!isAuthenticated || !user) {
      // Queue for offline sync
      await queueSyncAction({ type: 'mark_read', notificationId: id });
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Queue for retry
        await queueSyncAction({ type: 'mark_read', notificationId: id });
        // Revert on error
        await fetchNotifications();
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Queue for retry
      await queueSyncAction({ type: 'mark_read', notificationId: id });
      // Revert on error
      await fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
      return updated;
    });

    if (!isAuthenticated || !user) {
      // Queue for offline sync
      await queueSyncAction({ type: 'mark_all_read', notificationId: 'all' });
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/notifications/read-all`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Queue for retry
        await queueSyncAction({ type: 'mark_all_read', notificationId: 'all' });
        await fetchNotifications();
      }
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      // Queue for retry
      await queueSyncAction({ type: 'mark_all_read', notificationId: 'all' });
      await fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic update
    let deleted: Notification | undefined;
    setNotifications(prev => {
      deleted = prev.find(n => n.id === id);
      const updated = prev.filter(n => n.id !== id);
      saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
      return updated;
    });

    if (!isAuthenticated || !user) {
      // Queue for offline sync
      await queueSyncAction({ type: 'delete', notificationId: id });
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Queue for retry
        await queueSyncAction({ type: 'delete', notificationId: id });
        // Revert on error
        if (deleted) {
          setNotifications(prev => [...prev, deleted!]);
        }
        await fetchNotifications();
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      // Queue for retry
      await queueSyncAction({ type: 'delete', notificationId: id });
      // Revert on error
      if (deleted) {
        setNotifications(prev => [...prev, deleted!]);
      }
      await fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = getSocket();
    
    // Join user's notification room
    socket.emit('join_notifications', { userId: user.id });

    // Listen for new notifications
    socket.on('notification:new', (notification: Notification) => {
      if (notification.userId === user.id) {
        setNotifications(prev => {
          const updated = [notification, ...prev];
          saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
          return updated;
        });
      }
    });

    // Listen for read updates
    socket.on('notification:read', (data: { id: string; userId: string }) => {
      if (data.userId === user.id) {
        setNotifications(prev => {
          const updated = prev.map(n => (n.id === data.id ? { ...n, read: true } : n));
          saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
          return updated;
        });
      }
    });

    // Listen for read-all updates
    socket.on('notification:read-all', (data: { userId: string; count: number }) => {
      if (data.userId === user.id) {
        setNotifications(prev => {
          const updated = prev.map(n => ({ ...n, read: true }));
          saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
          return updated;
        });
      }
    });

    // Listen for deleted notifications
    socket.on('notification:deleted', (data: { id: string; userId: string }) => {
      if (data.userId === user.id) {
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== data.id);
          saveToIndexedDB(updated).catch(err => console.error('Failed to save to IndexedDB:', err));
          return updated;
        });
      }
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:read');
      socket.off('notification:read-all');
      socket.off('notification:deleted');
    };
  }, [isAuthenticated, user, notifications]);

  // Fetch notifications on mount and when auth changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Sync when coming online
  useEffect(() => {
    if (isAuthenticated && user) {
      syncIfOnline();
    }
  }, [isAuthenticated, user]);

  // Load from IndexedDB on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      loadFromIndexedDB().then(setNotifications).finally(() => setIsLoading(false));
    }
  }, [isAuthenticated]);

  const value: NotificationContextType = {
    notifications,
    unreadCount: getUnreadCount(),
    isLoading,
    error,
    addNotification,
    markAsRead,
    markAllRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

