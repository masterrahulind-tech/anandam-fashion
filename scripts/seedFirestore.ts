import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_PRODUCTS } from '../constants';

async function seedFirestore() {
    console.log('Starting Firestore seeding...');

    try {
        // Seed products
        console.log('Seeding products...');
        const productsCol = collection(db, 'products');

        for (const product of INITIAL_PRODUCTS) {
            const { id, ...productData } = product; // Remove the id field
            await addDoc(productsCol, productData);
            console.log(`Added product: ${product.name}`);
        }

        console.log('✅ Firestore seeding completed successfully!');
        console.log(`Added ${INITIAL_PRODUCTS.length} products`);
    } catch (error) {
        console.error('❌ Error seeding Firestore:', error);
    }
}

// Run the seed function
seedFirestore();
