
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
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Returned' | 'Refunded' | 'Replacement Requested' | 'Replaced';
  date: string;
  trackingNumber?: string;
  courier?: string;
  timeline: { status: string; date: string; note?: string }[];
  returnReason?: string;
  cancellationReason?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: 'COD' | 'PrePaid';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  currency: 'INR' | 'USD';
  shippingCost: number;
  codFee?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  expiryDate?: string;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  bannerImage?: string;
  bannerText: string;
  active: boolean;
  link?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
}

export interface AuditLog {
  id: string;
  event: string;
  user: string;
  userId: string;
  timestamp: any;
  metadata?: any;
}
export interface BespokeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  measurements: {
    bust?: number;
    waist?: number;
    hips?: number;
    length?: number;
    shoulder?: number;
    sleeve?: number;
  };
  unit: 'Inches' | 'CM';
  notes: string;
  status: 'Pending' | 'Consulted' | 'Fulfilled';
  createdAt: any;
}

export interface PaymentSettings {
  codEnabled: boolean;
  prepaidDiscount: number; // Percentage
  shippingCharge: number;
  freeShippingThreshold: number;
  codFee: number;
}
