importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const configFromSearch = () => {
  const params = new URL(self.location.href).searchParams;
  return {
    apiKey: params.get('apiKey') || '',
    authDomain: params.get('authDomain') || '',
    projectId: params.get('projectId') || '',
    storageBucket: params.get('storageBucket') || '',
    messagingSenderId: params.get('messagingSenderId') || '',
    appId: params.get('appId') || '',
    measurementId: params.get('measurementId') || undefined,
  };
};

const config = configFromSearch();

if (config.apiKey && config.authDomain && config.projectId && config.storageBucket && config.messagingSenderId && config.appId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || 'Eclinic reminder';
    const options = {
      body: payload?.notification?.body || 'You have a new appointment update.',
      data: payload?.data || {},
    };

    self.registration.showNotification(title, options);
  });
}
