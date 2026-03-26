import { getToken, MessagePayload, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/app/lib/firebase';
import { apiRegisterFcmToken } from './authApi';

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
let hasLoggedPermissionDenied = false;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'default';
  }
  return Notification.requestPermission();
}

export async function getFcmDeviceToken(): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.warn('[FCM] Messaging is not supported in this browser/context.');
    return null;
  }
  if (!vapidKey) {
    console.warn('[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.');
    return null;
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  return getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration,
  });
}

export async function initializePushNotifications(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (typeof Notification === 'undefined') {
    return null;
  }

  let permission = Notification.permission;
  if (permission === 'denied') {
    if (!hasLoggedPermissionDenied) {
      console.warn('[FCM] Notification permission is blocked at browser level.');
      hasLoggedPermissionDenied = true;
    }
    return null;
  }

  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    if (!hasLoggedPermissionDenied) {
      console.warn('[FCM] Notification permission was not granted:', permission);
      hasLoggedPermissionDenied = true;
    }
    return null;
  }

  hasLoggedPermissionDenied = false;

  const token = await getFcmDeviceToken();
  if (!token) {
    console.warn('[FCM] Failed to obtain device token.');
    return null;
  }

  try {
    await apiRegisterFcmToken(token);
  } catch {
    console.warn('[FCM] Failed to register token via API.');
  }

  return token;
}

export async function subscribeToForegroundMessages(
  handler: (payload: MessagePayload) => void,
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, handler);
}
