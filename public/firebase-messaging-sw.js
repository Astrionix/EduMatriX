importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAiI5_fKfLZ33OpV5aajGT6C7No3QN8d_U",
    authDomain: "edumatrix-9e538.firebaseapp.com",
    projectId: "edumatrix-9e538",
    storageBucket: "edumatrix-9e538.firebasestorage.app",
    messagingSenderId: "269100786314",
    appId: "1:269100786314:web:606134a970e66454ff0373",
    measurementId: "G-7YFVFNQX2K"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png' // You might want to add an icon to public folder
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
