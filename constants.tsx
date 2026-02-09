
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Royal Silk Zardosi Lehanga',
    description: 'A masterpiece of traditional Indian embroidery on pure Banarasi silk. Hand-stitched with love and precision.',
    price: 18500,
    originalPrice: 24000,
    category: 'Women',
    subCategory: 'Ethnic Wear',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800',
      'https://images.unsplash.com/photo-1595967783875-c371f35d8049?q=80&w=800',
      'https://images.unsplash.com/photo-1594633313217-0628e932943e?q=80&w=800'
    ],
    sizes: ['S', 'M', 'L'],
    ratings: 4.9,
    numReviews: 3,
    stock: 5,
    isOffer: true,
    isCustomizable: true,
    createdAt: new Date().toISOString(),
    reviews: [
      { id: 'r1', productId: '1', userName: 'Ananya Sharma', rating: 5, comment: 'Absolutely stunning work! The quality of silk is premium.', date: '2025-01-15' },
      { id: 'r2', productId: '1', userName: 'Meera K.', rating: 5, comment: 'The zardosi work is very intricate. Worth every penny.', date: '2025-02-10' },
      { id: 'r3', productId: '1', userName: 'Ritu Singh', rating: 4, comment: 'Very beautiful, but took a bit long to arrive.', date: '2025-02-20' }
    ]
  },
  {
    id: '2',
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
    createdAt: new Date().toISOString(),
    reviews: [
      { id: 'r4', productId: '2', userName: 'Sarah J.', rating: 5, comment: 'So comfortable and perfect for the heat.', date: '2025-03-01' },
      { id: 'r5', productId: '2', userName: 'Priya Verma', rating: 4, comment: 'Linen is high quality. Runs slightly large.', date: '2025-03-05' }
    ]
  },
  {
    id: '3',
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
    createdAt: new Date().toISOString(),
    reviews: [
      { id: 'r6', productId: '3', userName: 'Mama Bear', rating: 5, comment: 'My daughter looked like a princess. Very happy!', date: '2025-02-28' }
    ]
  }
];
