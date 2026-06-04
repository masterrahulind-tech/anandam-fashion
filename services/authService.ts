import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { createUserDocument, getUserDocument } from './firestoreService';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await createUserDocument({
            id: user.uid,
            name: name,
            email: user.email!,
            role: 'user',
            createdAt: new Date().toISOString(),
            addresses: []
        });

        return user;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign up');
    }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in');
    }
};

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists, if not create one
        const userDoc = await getUserDocument(user.uid);
        if (!userDoc) {
            await createUserDocument({
                id: user.uid,
                name: user.displayName || 'User',
                email: user.email!,
                role: 'user',
                createdAt: new Date().toISOString(),
                addresses: []
            });
        }

        return user;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign in with Google');
    }
};

// Sign out
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to sign out');
    }
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};
