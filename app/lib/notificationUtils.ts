export type LocalNotificationPayload = {
  title: string;
  body: string;
  url?: string;
};

let lastNotificationSignature = '';
let lastNotificationAt = 0;

export async function showLocalNotification(payload: LocalNotificationPayload): Promise<void> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const now = Date.now();
  const signature = `${payload.title}|${payload.body}|${payload.url ?? ''}`;
  if (signature === lastNotificationSignature && now - lastNotificationAt < 2500) {
    return;
  }
  lastNotificationSignature = signature;
  lastNotificationAt = now;

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: '/jobbridge-logo.svg',
    data: {
      url: payload.url,
    },
  });

  notification.onclick = () => {
    const targetUrl = (notification.data as { url?: string } | undefined)?.url;
    window.focus();
    if (targetUrl) {
      window.location.href = targetUrl;
    }
    notification.close();
  };
}
