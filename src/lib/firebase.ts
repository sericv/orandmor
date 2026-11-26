import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCjpJ9ateL8w9-L5gBaYiT8JD0WwBrWfwo',
  authDomain: 'coffee-platform-52b80.firebaseapp.com',
  projectId: 'coffee-platform-52b80',
  storageBucket: 'coffee-platform-52b80.firebasestorage.app',
  messagingSenderId: '868712905693',
  appId: '1:868712905693:web:3ae6d3d227a3b5901d1434',
  measurementId: 'G-52MSG356QD',
};

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      // Analytics is optional; ignore if blocked by browser privacy settings
    });
}
