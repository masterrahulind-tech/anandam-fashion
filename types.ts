
export type Category = 'Women' | 'Girls' | 'Children';

export interface AppSettings {
  festivalMode: boolean;
  festivalName?: string;
  bannerMessage?: string;
}

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
  colors?: string[];
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
  selectedColor?: string;
  quantity: number;
  isCustomized?: boolean;
  customMeasurements?: CustomMeasurements;
  customNotes?: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  addresses: Address[];
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
  courierName?: string;
  address: string | Address;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  userEmail: string;
  userPhone: string;
  createdAt: string;
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
