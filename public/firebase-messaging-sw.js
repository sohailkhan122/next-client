/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBXnMST33ZZdnQijyHoAGVRMLhrmSMA5KI',
  authDomain: 'job-bridge-f8922.firebaseapp.com',
  projectId: 'job-bridge-f8922',
  storageBucket: 'job-bridge-f8922.firebasestorage.app',
  messagingSenderId: '756847027361',
  appId: '1:756847027361:web:ee7c2e72b3c030880b3ce0',
  measurementId: 'G-FRGH2NREG7',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'New message';
  const body = payload.notification?.body || '';
  const clickAction = payload.data?.clickAction || payload.data?.url || '/messages';

  self.registration.showNotification(title, {
    body,
    icon: '/jobbridge-logo.svg',
    data: {
      url: clickAction,
    },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/messages';
  event.waitUntil(clients.openWindow(targetUrl));
});
