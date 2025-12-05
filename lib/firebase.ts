import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAiI5_fKfLZ33OpV5aajGT6C7No3QN8d_U",
    authDomain: "edumatrix-9e538.firebaseapp.com",
    projectId: "edumatrix-9e538",
    storageBucket: "edumatrix-9e538.firebasestorage.app",
    messagingSenderId: "269100786314",
    appId: "1:269100786314:web:606134a970e66454ff0373",
    measurementId: "G-7YFVFNQX2K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let messaging: any = null;
let analytics: any = null;

if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });

    isAnalyticsSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, messaging, analytics };
