// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPX7ZAbmSRbCqBp4VXWNyKGFGln9HT6YY",
  authDomain: "anandame-com.firebaseapp.com",
  projectId: "anandame-com",
  storageBucket: "anandame-com.firebasestorage.app",
  messagingSenderId: "101479769840",
  appId: "1:101479769840:web:0cc0018c2977eded82c435",
  measurementId: "G-G358MVG21T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const functions = getFunctions(app);
const storage = getStorage(app);

export { app, analytics, db, auth, googleProvider, functions, storage };
