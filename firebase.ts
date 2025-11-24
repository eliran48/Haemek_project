import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

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

// Initialize analytics conditionally to prevent crashes if not supported or registration fails
let analytics = null;

isSupported().then(supported => {
  if (supported) {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Analytics failed to initialize:", e);
    }
  }
}).catch(err => {
  console.warn("Analytics support check failed:", err);
});

export { analytics };