import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    setDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Order, User } from '../types';

// ============================================
// PRODUCTS
// ============================================

export const getProducts = async (): Promise<Product[]> => {
    try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        const productDoc = doc(db, 'products', id);
        const productSnapshot = await getDoc(productDoc);
        if (productSnapshot.exists()) {
            return { id: productSnapshot.id, ...productSnapshot.data() } as Product;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    try {
        const productsCol = collection(db, 'products');
        const docRef = await addDoc(productsCol, {
            ...product,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<void> => {
    try {
        const productDoc = doc(db, 'products', id);
        await updateDoc(productDoc, data);
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    try {
        const productDoc = doc(db, 'products', id);
        await deleteDoc(productDoc);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// ============================================
// ORDERS
// ============================================

export const createOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
    try {
        const ordersCol = collection(db, 'orders');
        const docRef = await addDoc(ordersCol, {
            ...order,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const ordersCol = collection(db, 'orders');
        const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const orderSnapshot = await getDocs(q);
        return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
};

export const getAllOrders = async (): Promise<Order[]> => {
    try {
        const ordersCol = collection(db, 'orders');
        const q = query(ordersCol, orderBy('createdAt', 'desc'));
        const orderSnapshot = await getDocs(q);
        return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return [];
    }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await updateDoc(orderDoc, { status });
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']): Promise<void> => {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await updateDoc(orderDoc, { paymentStatus });
    } catch (error) {
        console.error('Error updating order payment status:', error);
        throw error;
    }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await deleteDoc(orderDoc);
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
};

export const updateOrderTracking = async (orderId: string, trackingNumber: string, courierName: string): Promise<void> => {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await updateDoc(orderDoc, { trackingNumber, courierName });
    } catch (error) {
        console.error('Error updating order tracking:', error);
        throw error;
    }
};

export const shipOrder = async (orderId: string, trackingNumber: string, courierName: string): Promise<void> => {
    try {
        const orderDoc = doc(db, 'orders', orderId);
        await updateDoc(orderDoc, {
            status: 'Shipped',
            trackingNumber,
            courierName
        });
    } catch (error) {
        console.error('Error shipping order:', error);
        throw error;
    }
};

// ============================================
// USERS
// ============================================

export const createUserDocument = async (user: { id: string; name: string; email: string; role: 'admin' | 'user'; createdAt: string; addresses: User['addresses'] }): Promise<void> => {
    try {
        const userDoc = doc(db, 'users', user.id);
        await setDoc(userDoc, user);
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

export const getUserDocument = async (userId: string): Promise<User | null> => {
    try {
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            // Migration: Ensure addresses array exists
            const addresses = data.addresses || (data.address ? [{
                id: 'default',
                type: 'Home',
                street: data.address,
                city: '',
                state: '',
                zipCode: '',
                country: '',
                isDefault: true
            }] : []);

            return { id: userSnapshot.id, ...data, addresses } as User;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user document:', error);
        return null;
    }
};

export const updateUserDocument = async (userId: string, data: Partial<User>): Promise<void> => {
    try {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, data);
    } catch (error) {
        console.error('Error updating user document:', error);
        throw error;
    }
};

export const setAdminRole = async (userId: string): Promise<void> => {
    try {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, { role: 'admin' });
    } catch (error) {
        console.error('Error setting admin role:', error);
        throw error;
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
};

// ============================================
// WISHLIST
// ============================================

export const getUserWishlist = async (userId: string): Promise<string[]> => {
    try {
        const wishlistDoc = doc(db, 'wishlists', userId);
        const wishlistSnapshot = await getDoc(wishlistDoc);
        if (wishlistSnapshot.exists()) {
            return wishlistSnapshot.data().productIds || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return [];
    }
};

export const updateWishlist = async (userId: string, productIds: string[]): Promise<void> => {
    try {
        const wishlistDoc = doc(db, 'wishlists', userId);
        await setDoc(wishlistDoc, { productIds, updatedAt: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating wishlist:', error);
        throw error;
    }
};

// ============================================
// SETTINGS (Global Toggles)
// ============================================

import { AppSettings } from '../types';

export const getSettings = async (): Promise<AppSettings> => {
    try {
        const settingsDoc = doc(db, 'settings', 'global');
        const settingsSnapshot = await getDoc(settingsDoc);
        if (settingsSnapshot.exists()) {
            return settingsSnapshot.data() as AppSettings;
        }
        return { festivalMode: false, festivalName: '', bannerMessage: '' };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { festivalMode: false };
    }
};

export const updateSettings = async (settings: AppSettings): Promise<void> => {
    try {
        const settingsDoc = doc(db, 'settings', 'global');
        await setDoc(settingsDoc, settings, { merge: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

// ============================================
// COUPONS
// ============================================

import { Coupon } from '../types';

export const getCoupons = async (): Promise<Coupon[]> => {
    try {
        const couponsCol = collection(db, 'coupons');
        const couponSnapshot = await getDocs(couponsCol);
        return couponSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return [];
    }
};

export const createCoupon = async (coupon: Omit<Coupon, 'id'>): Promise<string> => {
    try {
        const couponsCol = collection(db, 'coupons');
        const docRef = await addDoc(couponsCol, coupon);
        return docRef.id;
    } catch (error) {
        console.error('Error creating coupon:', error);
        throw error;
    }
};

export const deleteCoupon = async (id: string): Promise<void> => {
    try {
        const couponDoc = doc(db, 'coupons', id);
        await deleteDoc(couponDoc);
    } catch (error) {
        console.error('Error deleting coupon:', error);
        throw error;
    }
};
