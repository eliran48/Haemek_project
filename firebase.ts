import { initializeApp } from "firebase/app";

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

// Fix: Analytics imports removed due to "module has no exported member" errors in the current environment.
export const analytics = null;
