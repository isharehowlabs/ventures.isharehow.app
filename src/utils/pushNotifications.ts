import { getBackendUrl } from './backendUrl';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Request push notification permission and subscribe
export async function requestPushPermission(): Promise<PushSubscription | null> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('Push notifications are not supported');
    return null;
  }

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }

  // Register service worker if not already registered
  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.ready;
  } catch (error) {
    try {
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    } catch (regError) {
      console.error('Service worker registration failed:', regError);
      return null;
    }
  }

  // Subscribe to push service
  try {
    // VAPID public key - should be in environment variable
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };

    // Send subscription to backend
    await sendSubscriptionToBackend(pushSubscription);

    return pushSubscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Convert VAPID key from base64 URL to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Send subscription to backend
async function sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/notifications/push/subscribe`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend');
    }
  } catch (error) {
    console.error('Error sending subscription to backend:', error);
    throw error;
  }
}

// Unsubscribe from push notifications
export async function unsubscribePush(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify backend
      const backendUrl = getBackendUrl();
      await fetch(`${backendUrl}/api/notifications/push/unsubscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
  }
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Check current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

