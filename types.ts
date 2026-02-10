
export type Category = 'Women' | 'Girls' | 'Children';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: Category;
  subCategory: string;
  images: string[];
  sizes: string[];
  ratings: number;
  numReviews: number;
  stock: number;
  isOffer: boolean;
  isCustomizable: boolean;
  createdAt: string;
  reviews: Review[];
}

export interface CustomMeasurements {
  bust?: number;
  waist?: number;
  hips?: number;
  length?: number;
  shoulder?: number;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
  isCustomized?: boolean;
  customMeasurements?: CustomMeasurements;
  customNotes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  address?: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  giftCardApplied: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  trackingNumber: string;
  address: string;
  paymentMethod: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  expiryDate?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
}
