import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFYvzKavhrf4bnoFI0GckLk-dO40_ftJ4",
  authDomain: "eliran-apps.firebaseapp.com",
  projectId: "eliran-apps",
  storageBucket: "eliran-apps.firebasestorage.app",
  messagingSenderId: "383762752947",
  appId: "1:383762752947:web:d88d6f69bfcfda12f557c6",
  measurementId: "G-614P3HPTF5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let authPromise: Promise<User> | null = null;

export const waitForAuth = (): Promise<User> => {
  if (authPromise) return authPromise;

  authPromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        // Sign in anonymously if no user
        signInAnonymously(auth).catch((error) => {
           console.error("Error signing in anonymously:", error);
           // Depending on needs, could reject or retry, 
           // but keeping the promise pending or logging is safer for now.
        });
      }
    });
  });
  return authPromise;
};