// services/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPX7ZAbmSRbCqBp4VXWNyKGFGln9HT6YY",
  authDomain: "anandame-com.firebaseapp.com",
  projectId: "anandame-com",
  storageBucket: "anandame-com.appspot.com", // <-- fixed typo: should be .appspot.com
  messagingSenderId: "101479769840",
  appId: "1:101479769840:web:0cc0018c2977eded82c435",
  measurementId: "G-G358MVG21T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);