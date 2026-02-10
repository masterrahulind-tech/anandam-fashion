import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPX7ZAbmSRbCqBp4VXWNyKGFGln9HT6YY",
  authDomain: "anandame-com.firebaseapp.com",
  projectId: "anandame-com",
  storageBucket: "anandame-com.appspot.com",
  messagingSenderId: "101479769840",
  appId: "1:101479769840:web:0cc0018c2977eded82c435",
  measurementId: "G-G358MVG21T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestUser() {
  const userRef = doc(db, 'users', 'testuser');
  await setDoc(userRef, {
    name: 'Test User',
    email: 'testuser@example.com',
    role: 'user',
    createdAt: new Date().toISOString()
  });
  console.log('Test user created in Firestore users collection.');
}

createTestUser().catch(console.error);
