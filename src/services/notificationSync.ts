import { getBackendUrl } from '../utils/backendUrl';
import { Notification } from '../contexts/NotificationContext';

const DB_NAME = 'ventures_notifications';
const DB_VERSION = 2; // Incremented to trigger upgrade for sync_queue store
const STORE_NAME = 'notifications';
const SYNC_QUEUE_STORE = 'sync_queue';

// Initialize IndexedDB with proper version handling
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // First check if database exists and get its version
    const checkRequest = indexedDB.open(DB_NAME);
    
    checkRequest.onsuccess = () => {
      const existingDb = checkRequest.result;
      const currentVersion = existingDb.version;
      existingDb.close();
      
      // Use the maximum of current version or our target version to avoid downgrade errors
      const targetVersion = Math.max(currentVersion, DB_VERSION);
      
      // If we need to upgrade, use a higher version
      const finalVersion = currentVersion < DB_VERSION ? DB_VERSION : targetVersion;
      
      const request = indexedDB.open(DB_NAME, finalVersion);
      
      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Notifications store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('read', 'read', { unique: false });
        }
        
        // Sync queue store for offline actions
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const queueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('type', 'type', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    };
    
    checkRequest.onerror = () => {
      // Database doesn't exist, create it
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Notifications store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('read', 'read', { unique: false });
        }
        
        // Sync queue store for offline actions
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const queueStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('type', 'type', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    };
  });
};

interface SyncAction {
  id?: number;
  type: 'mark_read' | 'mark_all_read' | 'delete';
  notificationId: string;
  timestamp: number;
}

// Add action to sync queue
export async function queueSyncAction(action: Omit<SyncAction, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = await initDB();
    // Check if store exists before accessing
    if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
      console.warn('Sync queue store does not exist, skipping queue action');
      return;
    }
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    
    await store.add({
      ...action,
      timestamp: Date.now(),
    });
    
    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error queueing sync action:', error);
  }
}

// Get all queued actions
export async function getQueuedActions(): Promise<SyncAction[]> {
  try {
    const db = await initDB();
    // Check if store exists before accessing
    if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
      console.warn('Sync queue store does not exist, returning empty array');
      return [];
    }
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readonly');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        console.error('Error getting queued actions:', request.error);
        resolve([]); // Return empty array instead of rejecting
      };
    });
  } catch (error) {
    console.error('Error getting queued actions:', error);
    return [];
  }
}

// Remove action from sync queue
export async function removeQueuedAction(actionId: number): Promise<void> {
  try {
    const db = await initDB();
    // Check if store exists before accessing
    if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
      console.warn('Sync queue store does not exist, skipping remove action');
      return;
    }
    const tx = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(SYNC_QUEUE_STORE);
    await store.delete(actionId);
    
    // Wait for transaction to complete
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Error removing queued action:', error);
  }
}

// Sync queued actions with backend
export async function syncQueuedActions(): Promise<void> {
  const actions = await getQueuedActions();
  if (actions.length === 0) return;

  const backendUrl = getBackendUrl();
  
  for (const action of actions) {
    try {
      let response: Response;
      
      switch (action.type) {
        case 'mark_read':
          response = await fetch(`${backendUrl}/api/notifications/${action.notificationId}/read`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        case 'mark_all_read':
          response = await fetch(`${backendUrl}/api/notifications/read-all`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        case 'delete':
          response = await fetch(`${backendUrl}/api/notifications/${action.notificationId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          break;
        default:
          continue;
      }
      
      if (response.ok && action.id) {
        await removeQueuedAction(action.id);
      }
    } catch (error) {
      console.error(`Error syncing action ${action.id}:`, error);
      // Keep action in queue for retry
    }
  }
}

// Sync notifications from backend to local cache
export async function syncNotificationsFromBackend(): Promise<Notification[]> {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/notifications?per_page=50`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const notifications = data.notifications || [];
      
      // Save to IndexedDB
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
      return notifications;
    }
    
    return [];
  } catch (error) {
    console.error('Error syncing notifications from backend:', error);
    return [];
  }
}

// Check if online and sync
export async function syncIfOnline(): Promise<void> {
  if (navigator.onLine) {
    try {
      await syncQueuedActions();
      await syncNotificationsFromBackend();
    } catch (error) {
      console.error('Error during sync:', error);
    }
  }
}

// Register background sync
export function registerBackgroundSync(): void {
  if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
    navigator.serviceWorker.ready.then((registration: any) => {
      registration.sync.register('sync-notifications').catch((error: Error) => {
        console.error('Background sync registration failed:', error);
      });
    });
  }
}

// Listen for online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncIfOnline();
  });
}

