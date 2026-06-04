import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 * 
 * @param file The file object to upload
 * @param basePath The base path in storage (e.g. 'products', 'uploads')
 * @returns The public download URL of the uploaded file
 */
export const uploadFileToStorage = async (file: File, basePath: string = 'uploads'): Promise<string> => {
    try {
        // Create a unique file name to avoid collisions
        const uniqueFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `${basePath}/${uniqueFileName}`);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
    } catch (error) {
        console.error('Error uploading file to storage:', error);
        throw error;
    }
};
