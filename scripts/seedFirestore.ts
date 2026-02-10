import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

// Hardcoded config for seeding script to avoid env issue in CLI
const firebaseConfig = {
    apiKey: "AIzaSyBPX7ZAbmSRbCqBp4VXWNyKGFGln9HT6YY",
    authDomain: "anandame-com.firebaseapp.com",
    projectId: "anandame-com",
    storageBucket: "anandame-com.firebasestorage.app",
    messagingSenderId: "101479769840",
    appId: "1:101479769840:web:0cc0018c2977eded82c435",
    measurementId: "G-G358MVG21T"
};

const INITIAL_PRODUCTS = [
    {
        name: 'Royal Silk Zardosi Lehanga',
        description: 'A masterpiece of traditional Indian embroidery on pure Banarasi silk. Hand-stitched with love and precision.',
        price: 18500,
        originalPrice: 24000,
        category: 'Women',
        subCategory: 'Ethnic Wear',
        images: [
            'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800',
            'https://images.unsplash.com/photo-1595967783875-c371f35d8049?q=80&w=800'
        ],
        sizes: ['S', 'M', 'L'],
        ratings: 4.9,
        numReviews: 3,
        stock: 5,
        isOffer: true,
        isCustomizable: true,
        createdAt: new Date().toISOString()
    },
    {
        name: 'Boho-Chic Linen Summer Dress',
        description: 'Breathable linen blend with delicate lace detailing. Ideal for summer brunches and beach strolls.',
        price: 3200,
        originalPrice: 4500,
        category: 'Women',
        subCategory: 'Western Wear',
        images: [
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800'
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        ratings: 4.7,
        numReviews: 2,
        stock: 25,
        isOffer: true,
        isCustomizable: false,
        createdAt: new Date().toISOString()
    },
    {
        name: 'Sequinned Tutu Party Dress',
        description: 'Every little girl deserves to sparkle. This tiered tulle dress features a satin bodice and hand-sewn sequins.',
        price: 2100,
        originalPrice: 3500,
        category: 'Girls',
        subCategory: 'Occasion Wear',
        images: [
            'https://images.unsplash.com/photo-1518833503222-793084185c3c?q=80&w=800',
            'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800'
        ],
        sizes: ['2Y', '4Y', '6Y', '8Y'],
        ratings: 4.5,
        numReviews: 1,
        stock: 12,
        isOffer: true,
        isCustomizable: false,
        createdAt: new Date().toISOString()
    }
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
    console.log('Starting Firestore seeding...');

    try {
        const productsCol = collection(db, 'products');

        // Check if products already exist
        console.log('Checking for existing products...');
        const existing = await getDocs(query(productsCol, limit(1)));
        if (!existing.empty) {
            console.log('Products already exist in Firestore. Skipping seeding.');
            return;
        }

        for (const product of INITIAL_PRODUCTS) {
            const docRef = await addDoc(productsCol, product);
            console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
        }

        console.log('Seeding completed successfully!');
    } catch (error: any) {
        console.error('FATAL ERROR during seeding:', error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

seed().catch(err => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
