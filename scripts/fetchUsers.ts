import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function fetchUsers() {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log('Users:', userList);
}

fetchUsers().catch(console.error);
