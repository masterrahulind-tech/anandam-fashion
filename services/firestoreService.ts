// services/firestoreService.ts
import { db } from './firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { Product, Order, User, Coupon, AuditLog, Campaign, BespokeRequest, PaymentSettings } from '../types';

// --- Products ---

export async function fetchProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Safely convert Firestore Timestamp to string
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
    } as Product;
  });
}

export async function addProduct(product: Omit<Product, 'id'>) {
  return addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp()
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, 'products', id));
}

// --- Orders ---

export async function fetchOrdersByUser(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function addOrder(order: Omit<Order, 'id'>) {
  return addDoc(collection(db, 'orders'), {
    ...order,
    createdAt: serverTimestamp()
  });
}

// --- Users ---

export async function fetchUser(id: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', id));
  return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
}

export async function saveUser(user: User) {
  return setDoc(doc(db, 'users', user.id), {
    ...user,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function fetchAllUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

// --- Orders Suite ---

export async function fetchAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function updateOrder(id: string, data: Partial<Order>) {
  return updateDoc(doc(db, 'orders', id), data);
}

// --- Coupons ---

export async function fetchCoupons(): Promise<Coupon[]> {
  const snapshot = await getDocs(collection(db, 'coupons'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
}

export async function addCoupon(coupon: Omit<Coupon, 'id'>) {
  return addDoc(collection(db, 'coupons'), coupon);
}

export async function deleteCoupon(id: string) {
  return deleteDoc(doc(db, 'coupons', id));
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  return updateDoc(doc(db, 'coupons', id), data);
}

// --- Campaigns ---

export async function fetchCampaigns(): Promise<Campaign[]> {
  const snapshot = await getDocs(collection(db, 'campaigns'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
}

export async function addCampaign(campaign: Omit<Campaign, 'id'>) {
  return addDoc(collection(db, 'campaigns'), campaign);
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  return updateDoc(doc(db, 'campaigns', id), data);
}

export async function deleteCampaign(id: string) {
  return deleteDoc(doc(db, 'campaigns', id));
}

// --- Audit Registry ---

export async function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  return addDoc(collection(db, 'audit_logs'), {
    ...log,
    timestamp: serverTimestamp()
  });
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const snapshot = await getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
}

// --- Bespoke Requests ---

export async function addBespokeRequest(request: Omit<BespokeRequest, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'bespoke_requests'), {
    ...request,
    createdAt: serverTimestamp()
  });
}

export async function fetchAllBespokeRequests(): Promise<BespokeRequest[]> {
  const snapshot = await getDocs(query(collection(db, 'bespoke_requests'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BespokeRequest));
}

export async function updateBespokeRequest(id: string, data: Partial<BespokeRequest>) {
  return updateDoc(doc(db, 'bespoke_requests', id), data);
}

// --- Payment Settings ---

export async function fetchPaymentSettings(): Promise<PaymentSettings | null> {
  const docRef = doc(db, 'settings', 'payment');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as PaymentSettings : null;
}

export async function savePaymentSettings(settings: PaymentSettings) {
  return setDoc(doc(db, 'settings', 'payment'), settings, { merge: true });
}
