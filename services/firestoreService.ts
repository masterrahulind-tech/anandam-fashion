// firestoreService.ts
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';

// Products
export async function fetchProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addProduct(product: any) {
  return addDoc(collection(db, 'products'), product);
}

export async function updateProduct(id: string, data: any) {
  return updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, 'products', id));
}

// Orders
export async function fetchOrdersByUser(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addOrder(order: any) {
  return addDoc(collection(db, 'orders'), order);
}

// Users
export async function fetchUser(id: string) {
  const userDoc = await getDoc(doc(db, 'users', id));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
}

export async function addUser(user: any) {
  return addDoc(collection(db, 'users'), user);
}
