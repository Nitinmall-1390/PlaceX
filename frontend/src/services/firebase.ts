import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAdAVT8Jri6YH-Z9kRqkvL-ykLTqFry3rc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placex-658b5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placex-658b5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placex-658b5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "931355585241",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:931355585241:web:fb599d5349d02093882cc8",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult };
