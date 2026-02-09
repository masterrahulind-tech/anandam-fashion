// Create a new order document
export async function createOrder(data: any) {
  return databases.createDocument('anandamfashion01', 'orders', 'unique()', data);
}

// Fetch all orders for a user
export async function fetchOrdersByUser(userId: string) {
  return databases.listDocuments('anandamfashion01', 'orders', [
    // Appwrite query: filter by userId field
    // Example: Query.equal('userId', userId)
  ]);
}
// Create a new product document
export async function createProduct(data: any) {
  return databases.createDocument('anandamfashion01', 'products', 'unique()', data);
}

// Update a product document
export async function updateProduct(id: string, data: any) {
  return databases.updateDocument('anandamfashion01', 'products', id, data);
}

// Delete a product document
export async function deleteProduct(id: string) {
  return databases.deleteDocument('anandamfashion01', 'products', id);
}
// Register a new user with Appwrite
export async function registerUser(email: string, password: string, name: string) {
  return account.create('unique()', email, password, name);
}

// Login user with Appwrite
export async function loginUser(email: string, password: string) {
  return account.createEmailSession(email, password);
}

// Get current user
export async function getCurrentUser() {
  return account.get();
}

// Logout user
export async function logoutUser() {
  return account.deleteSession('current');
}
// services/appwriteService.ts
import { Client, Databases, Account } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('anandamfashion01'); // Project name: AnandamFashion, ID: anandamfashion01

const databases = new Databases(client);
const account = new Account(client);

// Helper to fetch all documents from AnandamFashion database (replace COLLECTION_ID as needed)
export async function fetchAnandamFashionDocuments(collectionId: string) {
  try {
    const response = await databases.listDocuments('anandamfashion01', collectionId);
    return response;
  } catch (error) {
    throw error;
  }
}

export { client, databases, account };