
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag, User as UserIcon, Heart, Search, Menu, X, ChevronRight,
  Star, Sparkles, Plus, Trash2, ArrowRight, TrendingUp, Clock, Layers,
  Ruler, Target, ClipboardList, Facebook, Twitter, Settings, LogOut, LayoutDashboard,
  Ticket, Gift, Calendar, DollarSign, Tag, Percent, ThumbsUp, CheckCircle, Scissors,
  MapPin, Package, CreditCard, ShieldCheck, Eye, EyeOff, Instagram, Youtube, Globe, Link as LinkIcon, Check, Filter, ChevronDown
} from 'lucide-react';
import { Product, CartItem, User, Order, Category, Review, Coupon, GiftCard, CustomMeasurements, Address, AppSettings } from './types';
import { PrivacyPolicy, TermsOfService, ShippingPolicy, AboutUs, ContactUs } from './components/LegalPages';
import { INITIAL_PRODUCTS } from './constants';
import { getFashionAdvice } from './services/geminiService';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut as firebaseSignOut, onAuthStateChanged } from './services/authService';
import { getProducts, getUserOrders, getUserDocument, getUserWishlist, updateWishlist, updateUserDocument } from './services/firestoreService';
import AdSenseManager from './components/AdSenseManager';
import StyleGuide from './components/StyleGuide';
import CartPage from './components/cart/CartPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import OrderConfirmationPage from './components/checkout/OrderConfirmationPage';
import HoliEffect from './components/festive/HoliEffect';
import BlogIndexPage from './components/blog/BlogIndexPage';
import BlogPostPage from './components/blog/BlogPostPage';

const LOGO_URL = "/logo.png";

// --- Legal Content ---
const PRIVACY_POLICY = `
Your privacy is paramount at Anandam Atelier. This policy outlines how we handle your data:
1. Data Collection: We collect only essential information required for order fulfillment and account management.
2. Data Usage: Your data is used exclusively to enhance your experience and fulfill your heritage acquisition.
3. Protection: We employ industry-standard encryption to safeguard your identity.
4. Third Parties: We never trade or sell your personal details to outside entities.
5. Cookies: We use cookies to remember your archive selections and preferences.
`;

const TERMS_OF_SERVICE = `
By engaging with Anandam Atelier, you agree to the following terms:
1. Intellectual Property: All designs and silhouettes are the exclusive property of Anandam Atelier.
2. Acquisition: Orders are subject to availability and artisanal production timelines.
3. Authenticity: Each piece is guaranteed as an authentic Anandam creation.
4. User Conduct: We maintain a prestigious environment; respectful conduct is expected.
5. Liability: Anandam Atelier is not liable for indirect or consequential damages.
`;

const SHIPPING_RETURNS = `
Our concierge service ensures a seamless acquisition experience:
1. Logistics: We partner with global luxury carriers for secure delivery.
2. Timelines: Artisanal pieces may require 2-4 weeks for fulfillment.
3. Returns: We accept returns within 7 days for boutique credit only, provided the seal remains intact.
4. Exchanges: Size exchanges are subject to archive availability.
5. Customs: International clients are responsible for local duties and taxes.
`;

const OUR_COMMITMENT = `
Anandam Atelier is built on a foundation of artisanal integrity and heritage preservation:
- Quality: We use only the finest natural fabrics and traditional weaving techniques.
- Ethical Craft: Every weaver in our collective is treated with the utmost respect and fair compensation.
- Sustainability: We produce in limited quantities to minimize environmental footprint.
- Heritage: We strive to keep ancient Indian embroidery and silhouette traditions alive for the modern era.
`;

// --- Context ---
interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (p: Product, size: string, color?: string, customization?: { measurements: CustomMeasurements, notes: string }) => void;
  removeFromCart: (id: string, size: string, color?: string) => void;
  removeItem: (id: string, size: string, color?: string) => void;
  clearCart: () => void;
  user: User | null;
  setUser: (u: User | null) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (o: Order) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  giftCards: GiftCard[];
  setGiftCards: React.Dispatch<React.SetStateAction<GiftCard[]>>;
  addReview: (productId: string, review: Review) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Standardized UI Components ---

const StarRating = ({ rating, size = 16, interactive = false, onRate }: { rating: number, size?: number, interactive?: boolean, onRate?: (r: number) => void }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive ? (hoverRating || rating) : rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-transform active:scale-90`}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRate && onRate(star)}
        >
          <Star
            size={size}
            fill={star <= displayRating ? '#C5A059' : 'none'}
            className={star <= displayRating ? 'text-gold' : 'text-slate-200'}
          />
        </button>
      ))}
    </div>
  );
};

const Navbar = () => {
  const { cart, user, wishlist, products } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Women', path: '/shop/Women' },
    { name: 'Girls', path: '/shop/Girls' },
    { name: 'Style Guide', path: '/style-guide' },
    { name: 'About Us', path: '/our-commitment' },
    { name: 'Contact', path: '/contact' },
    { name: 'Offers', path: '/offers', highlight: true },
  ];

  return (
    <>
      <nav className={`fixed w-full z-[60] transition-all duration-500 ${isScrolled ? 'bg-white shadow-md py-1' : 'bg-transparent py-3 md:py-5'
        }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className={`p-2 mr-2 lg:hidden transition-colors ${isScrolled ? 'text-slate-800' : 'text-white'}`}
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="flex items-center group transition-all">
                <div className={`relative transition-all duration-500 ${isScrolled ? 'h-12 w-auto' : 'h-16 w-auto'} flex items-center`}>
                  <img
                    src={LOGO_URL}
                    alt="Anandam Logo"
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>

              <div className="hidden lg:flex items-center ml-10 space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase transition-all hover:text-gold ${link.highlight ? 'text-rose-500' : (isScrolled ? 'text-slate-600' : 'text-white')
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-4">
              <div className="hidden md:flex items-center relative group">
                <Search size={16} className={`absolute left-3 ${isScrolled ? 'text-slate-400' : 'text-white/70'}`} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchTerm('');
                      navigate(`/shop?q=${searchTerm}`);
                    }
                  }}
                  className={`pl-9 pr-4 py-1.5 text-[10px] rounded-full border-none outline-none w-32 focus:w-48 transition-all ${isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white placeholder:text-white/50 backdrop-blur-md'
                    }`}
                />
                {/* Live Search Results */}
                {searchTerm && (
                  <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-sm mt-2 overflow-hidden border border-slate-100">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5).map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={() => setSearchTerm('')}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <img src={p.images[0]} alt={`${p.name} - Handcrafted Archive`} className="w-8 h-10 object-cover rounded-sm" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[9px] text-slate-400">₹{p.price}</p>
                        </div>
                      </Link>
                    ))}
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-[10px] font-serif italic text-slate-400">No pieces found.</div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/profile" className={`p-2 transition-all hover:scale-110 relative ${isScrolled ? 'text-slate-600' : 'text-white'}`}>
                <Heart size={20} strokeWidth={1.5} />
                {wishlist.length > 0 && <span className="absolute top-1 right-1 bg-gold w-2 h-2 rounded-full border border-white"></span>}
              </Link>

              <Link to="/cart" className={`p-2 transition-all hover:scale-110 relative ${isScrolled ? 'text-slate-600' : 'text-white'}`}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </Link>

              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  className={`p-2 transition-all hover:scale-110 ${isScrolled ? 'text-slate-600' : 'text-white'}`}
                >
                  {user.role === 'admin' ? <LayoutDashboard size={20} /> : <UserIcon size={20} />}
                </Link>
              ) : (
                <Link to="/login" className={`hidden sm:block text-[9px] font-bold tracking-[0.2em] px-4 py-2 rounded-sm uppercase transition-all ${isScrolled ? 'bg-slate-900 text-white hover:bg-gold' : 'bg-white text-slate-900 hover:bg-gold hover:text-white'
                  }`}>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/60 z-[70] transition-opacity duration-500 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <aside className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[80] shadow-2xl transition-transform duration-500 lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <div className="h-12 w-auto">
              <img src={LOGO_URL} alt="Anandam Logo" className="h-full w-auto object-contain" />
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 p-2">
              <X size={24} />
            </button>
          </div>
          <nav className="space-y-6">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="block text-xs font-bold uppercase tracking-[0.3em] text-slate-600">{link.name}</Link>
            ))}
            <div className="pt-6 border-t border-slate-50">
              <Link to="/profile" className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-600">
                <UserIcon size={16} /> {user ? 'Account' : 'Login'}
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { toggleWishlist, wishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <article className="group relative bg-white overflow-hidden transition-all duration-500 rounded-sm shadow-sm hover:shadow-lg border border-slate-100 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
        />
        {product.price < product.originalPrice && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[7px] font-black px-2 py-1 uppercase tracking-widest z-10 shadow-sm">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-slate-300 shadow-sm z-10 transition-colors hover:text-rose-500"
      >
        <Heart size={14} fill={isWishlisted ? '#f43f5e' : 'none'} className={isWishlisted ? 'text-rose-500' : ''} />
      </button>
      <div className="p-3 md:p-4 text-center flex flex-col flex-grow">
        <p className="text-[7px] md:text-[8px] text-gold font-bold uppercase tracking-[0.3em] mb-1">{product.subCategory}</p>
        <h3 className="text-[11px] md:text-[13px] font-serif italic text-slate-800 line-clamp-1 mb-2">{product.name}</h3>
        <div className="mt-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs md:text-sm font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
            {product.price < product.originalPrice && (
              <span className="text-[10px] text-slate-300 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

// --- Authentication Pages ---

const LoginPage = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
      } else {
        await signUpWithEmail(formData.email, formData.password, formData.name);
      }
      // User state will be set by onAuthStateChanged listener in AppProvider
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // User state will be set by onAuthStateChanged listener in AppProvider
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-sm border border-slate-100 p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif italic mb-2">{isLogin ? 'Welcome Back' : 'Create Registry'}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {isLogin ? 'Access your private archives' : 'Join our luxury fashion collective'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-sm">
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
              <input
                type="text" required
                value={formData.name}
                className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Email Identity</label>
            <input
              type="email" required
              value={formData.email}
              className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Archive Key (Password)</label>
            <input
              type="password" required
              value={formData.password}
              className="w-full p-3 bg-slate-50 text-sm outline-none border-b border-transparent focus:border-gold transition-all"
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] shadow-lg hover:bg-gold transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[9px] uppercase tracking-widest text-slate-300">Or</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 text-[10px] font-bold uppercase tracking-[0.4em] shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
          >
            {isLogin ? "New to the atelier? Create registry" : "Existing collector? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- User Profile & Orders ---

// --- ProfilePage Removed (Extracted to UserDashboard) ---


// --- Legal Page Component ---

const LegalPage = ({ title, content }: { title: string, content: string }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-6 py-32 text-left">
      <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-12">{title}</h1>
      <div className="prose prose-slate lg:prose-xl">
        <div className="whitespace-pre-wrap font-serif text-slate-600 leading-relaxed text-lg italic">
          {content}
        </div>
      </div>
      <div className="mt-20 pt-10 border-t border-slate-100">
        <Link to="/" className="text-gold font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">
          Return to Atelier
        </Link>
      </div>
    </article>
  );
};


// --- App Core ---

const HomePage = () => {
  const { products } = useApp();
  return (
    <div className="space-y-16 md:space-y-32 pb-20 overflow-hidden">
      <section className="bg-[#1a0507] pt-24 md:pt-32 pb-12 px-4 min-h-[70vh] md:min-h-[90vh] flex items-center relative">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
          <div className="w-full lg:w-[60%] relative group">
            <div className="relative overflow-hidden rounded-sm aspect-[4/5] sm:aspect-video lg:aspect-[4/5] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?fm=jpg&q=60&w=3000&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-90 transition-transform duration-[10s] group-hover:scale-105"
                alt="Luxe Edit Couture"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0507] via-black/5 to-transparent"></div>
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 space-y-4 text-left max-w-lg">
                <span className="text-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.6em] block">The Prestige Archive</span>
                <h1 className="text-white text-4xl md:text-7xl font-serif italic leading-tight">Luxe Edit</h1>
                <div className="pt-2">
                  <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-black px-6 md:px-10 py-3 md:py-4 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all shadow-xl">
                    Explore <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[40%] grid grid-cols-2 gap-3 md:gap-4 h-full">
            {products.slice(0, 4).map((p, i) => (
              <Link key={i} to={`/product/${p.id}`} className="relative group overflow-hidden aspect-[3/4] rounded-sm shadow-lg">
                <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={p.name} />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all"></div>
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-white text-[7px] font-bold uppercase tracking-widest opacity-80">{p.subCategory}</p>
                  <h3 className="text-white text-[10px] md:text-xs font-serif italic line-clamp-1">{p.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mb-12 md:mb-20 space-y-3">
          <span className="text-gold text-[9px] font-bold uppercase tracking-[0.6em]">The Collection Post</span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-slate-800">Must-Have Curations</h2>
          <div className="h-px w-16 bg-gold/30 mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
  const { category } = useParams<{ category: string }>();
  const { products } = useApp();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSubCats, setSelectedSubCats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Derived data for filters
  const allSizes: string[] = Array.from(new Set<string>(products.flatMap((p: Product) => p.sizes))).sort();
  const allSubCats: string[] = Array.from(new Set<string>(products.filter((p: Product) => !category || p.category === category).map((p: Product) => p.subCategory))).sort();

  // Filter Logic
  const filteredProducts = products.filter(p => {
    if (category && p.category !== category) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery) && !p.description.toLowerCase().includes(searchQuery) && !p.subCategory.toLowerCase().includes(searchQuery)) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !p.sizes.some(s => selectedSizes.includes(s))) return false;
    if (selectedSubCats.length > 0 && !selectedSubCats.includes(p.subCategory)) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleFilter = (item: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-8 border-b border-slate-100 pb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif italic text-left mb-6">{category || 'All Collections'}</h1>
          <div className="space-y-6 text-slate-500 font-serif italic text-base md:text-lg leading-relaxed text-left">
            {category === 'Women' && (
              <>
                <p>Explore our exquisite collection of Women's fashion, where traditional heritage meets modern sophistication. From hand-woven silk lehangas that tell stories of ancient craft to contemporary silhouettes designed for the discerning modern woman, our collection is a celebration of artisanal excellence. Every piece is meticulously crafted using high-quality natural fabrics, ensuring luxury that is as sustainable as it is beautiful.</p>
                <p>Our Women's archive focuses on the 'Slow Fashion' philosophy. We collaborate directly with master weavers in Varanasi and Bhagalpur to bring you authentic textures that cannot be replicated by machines. Each garment undergoes a rigorous quality check, ensuring that the embroidery, silhouette, and fabric feel are of a prestige standard worthy of becoming a modern heirloom.</p>
                <p>Whether you are seeking a statement piece for a heritage wedding or a minimalist ensemble for a sophisticated daytime event, our curated selection offers versatility and grace. We invite you to delve into the details of our Zardosi work and hand-spun silks, discovering the passion and human touch that defines every Anandam creation.</p>
              </>
            )}
            {category === 'Girls' && (
              <>
                <p>Discover enchanting dresses for your little princesses. Our Girls' collection features soft, high-quality fabrics and magical details that sparkle. From sequinned party dresses to elegant ethnic wear, each garment is designed for comfort and joy. We believe that childhood should be filled with wonder, and our clothes are made to accompany every twirl, giggle, and celebration with timeless charm.</p>
                <p>Safety and comfort are at the heart of our children's wear. Every sequin is hand-sewn with rounded edges to prevent scratching, and we use 100% organic cotton linings to ensure breathability for delicate skin. Our designs are inspired by the same heritage patterns found in our women's collection, allowing for beautiful 'Mini-Me' styling moments during family festivities.</p>
                <p>Each piece in the Girls' archive is built to last, designed with adjustable sashes and generous hems to accommodate growth. We believe in creating pieces that are cherished and passed down, fostering a spirit of sustainability and heritage appreciation from a young age.</p>
              </>
            )}
            {category === 'Children' && (
              <>
                <p>Curated essentials and occasion wear for the youngest members of your family. Our Children's collection focuses on pure, breathable fabrics like soft cotton and linen, ensuring comfort for delicate skin. Whether it's a family gathering or a festive occasion, these pieces are designed with heritage-inspired details that keep tradition alive from a young age, without compromising on practicality.</p>
                <p>Our Children's edit is a tribute to the simplicity of natural textiles. We avoid synthetic blends, opting instead for hand-loomed khadi and soft mul-mul that grow softer with every wash. The designs are minimalist yet prestigious, featuring subtle hand-embroidered accents that highlight the artisanal nature of the garment.</p>
                <p>From baptism ceremonies to traditional holiday gatherings, our Children's collection provides a sophisticated alternative to mainstream retail. We prioritize ethical production and small-batch manufacturing, ensuring that your little one's first heritage pieces are made with the same care and integrity as the rest of our atelier.</p>
              </>
            )}
            {!category && (
              <>
                <p>Welcome to the complete Anandam Atelier archive. Here, you will find our full range of artisanal creations spanning different categories and styles. Each piece in this curated selection reflects our commitment to preserving India's rich textile history while embracing the needs of contemporary fashion. Browse through our heritage weaves, delicate embroideries, and sustainable silhouettes to find your next heirloom piece.</p>
                <p>Our overarching mission is to redefine luxury as a connection between the wearer and the maker. By exploring our full archive, you are supporting a network of over 50 master artisans who keep ancestral techniques alive. From the vibrant hues of our ethnic wear to the muted elegance of our western linen blends, every item is selected for its story and craftsmanship.</p>
                <p>We invite you to use the filters to navigate our collections by category, size, or price. If you require a bespoke fit, many of our pieces offer custom measurement options, bringing the personalized experience of a high-end atelier directly to your screen. Experience the bliss of heritage fashion with Anandam.</p>
              </>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-6">{filteredProducts.length} Pieces Found in Archive</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex-1 bg-white border border-slate-200 px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            Filters <Filter size={14} />
          </button>

          <div className="relative flex-1 md:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48 appearance-none bg-white border border-slate-200 px-4 py-3 pr-8 text-[10px] font-bold uppercase tracking-widest focus:border-gold outline-none cursor-pointer"
            >
              <option value="newest">Newest Additions</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12 relative">
        {/* Sidebar Filters */}
        <aside className={`w-full md:w-64 space-y-8 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Price Range</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif italic text-slate-500">₹{priceRange[0]}</span>
              <input
                type="range" min="0" max="50000" step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-grow h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <span className="text-xs font-serif italic text-slate-500">₹{priceRange[1]}</span>
            </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Category</h3>
            <div className="space-y-2">
              {allSubCats.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border border-slate-300 flex items-center justify-center transition-all ${selectedSubCats.includes(cat) ? 'bg-black border-black' : 'group-hover:border-gold'}`}>
                    {selectedSubCats.includes(cat) && <Check size={10} className="text-white" />}
                  </div>
                  <input
                    type="checkbox" className="hidden"
                    checked={selectedSubCats.includes(cat)}
                    onChange={() => toggleFilter(cat, selectedSubCats, setSelectedSubCats)}
                  />
                  <span className={`text-xs font-serif italic transition-colors ${selectedSubCats.includes(cat) ? 'text-slate-900' : 'text-slate-500 group-hover:text-gold'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Size</h3>
            <div className="flex flex-wrap gap-2">
              {allSizes.map(size => (
                <button
                  key={size}
                  onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                  className={`w-10 h-10 border text-[10px] font-bold transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-slate-400 border-slate-200 hover:border-gold'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-sm">
              <Filter size={48} className="mx-auto text-slate-200" />
              <p className="font-serif italic text-slate-400">No pieces match your curation criteria.</p>
              <button
                onClick={() => { setPriceRange([0, 50000]); setSelectedSizes([]); setSelectedSubCats([]); }}
                className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-black transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const PinterestIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.408-.09.379-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
  </svg>
);
const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useApp();
  const product = products.find(p => p.id === id);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center' });
  const [showCustomization, setShowCustomization] = useState(false);
  const [measurements, setMeasurements] = useState({ bust: '', waist: '', hips: '', length: '', shoulder: '' });
  const [customNotes, setCustomNotes] = useState('');

  useEffect(() => {
    if (product?.images?.length) setActiveImage(product.images[0]);
  }, [product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      transform: 'scale(2)', // Increased zoom level
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' });
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${product?.name} at Anandam`);
    const image = product ? encodeURIComponent(product.images[0]) : '';

    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === 'pinterest') {
      shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${text}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) return <div className="p-40 text-center font-serif italic">Archive entry not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-20">

        {/* Gallery Section */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar scroll-smooth h-24 md:h-[600px] w-full md:w-24">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-20 md:w-full h-24 md:h-32 flex-shrink-0 border-2 transition-all ${activeImage === img ? 'border-gold opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`${product.name} - Detail View ${i + 1}`} />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div
            className="flex-1 aspect-[3/4] overflow-hidden rounded-sm shadow-2xl relative group cursor-zoom-in bg-slate-50"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage || product.images[0]}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={zoomStyle}
              alt={product.name}
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 text-left space-y-8 md:space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{product.subCategory}</span>
              {product.numReviews > 0 && <span className="text-[10px] font-bold text-slate-300">({product.numReviews} Client Testimonials)</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 leading-tight">{product.name}</h1>
            <p className="text-sm font-serif italic text-slate-600 leading-relaxed border-l-2 border-gold pl-4 bg-slate-50/50 py-2">
              {product.description}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-slate-900">₹{product.price.toLocaleString()}</p>
            <p className="text-xs text-slate-400 line-through italic italic">MSRP ₹{product.originalPrice.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Dimensions</p>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`w-10 h-10 md:w-12 md:h-12 border flex items-center justify-center font-bold text-xs transition-all ${size === s ? 'bg-black text-white border-black' : 'hover:border-gold'}`}>{s}</button>
              ))}
            </div>
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Color</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 border font-bold text-xs transition-all ${color === c ? 'bg-black text-white border-black' : 'hover:border-gold bg-white text-slate-900'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Customization Box */}
          {product.isCustomizable && (
            <div className="border border-gold/20 rounded-sm p-4 md:p-6 bg-gold/5 space-y-4">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Scissors size={16} className="text-gold" />
                  <span className="text-sm font-bold text-slate-900">Customize This Piece</span>
                </div>
                <ChevronRight size={16} className={`text-gold transition-transform ${showCustomization ? 'rotate-90' : ''}`} />
              </button>

              {showCustomization && (
                <div className="space-y-4 pt-4 border-t border-gold/20">
                  <p className="text-[10px] text-slate-500 italic">Provide your measurements for a bespoke fit</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Bust (cm)</label>
                      <input
                        type="number"
                        value={measurements.bust}
                        onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                        placeholder="85"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Waist (cm)</label>
                      <input
                        type="number"
                        value={measurements.waist}
                        onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Hips (cm)</label>
                      <input
                        type="number"
                        value={measurements.hips}
                        onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                        placeholder="95"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Length (cm)</label>
                      <input
                        type="number"
                        value={measurements.length}
                        onChange={(e) => setMeasurements({ ...measurements, length: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                        placeholder="100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Special Instructions</label>
                    <textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full p-2 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold resize-none"
                      placeholder="Any specific requirements or preferences..."
                    />
                    <p className="text-[8px] text-slate-400 mt-1">{customNotes.length}/500 characters</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trust & Quality Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-6">
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-sm hover:bg-gold/5 transition-colors group">
              <CheckCircle size={20} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600 text-center">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-sm hover:bg-gold/5 transition-colors group">
              <ShieldCheck size={20} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600 text-center">Secure Checkout</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-sm hover:bg-gold/5 transition-colors group">
              <Package size={20} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600 text-center">7-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-sm hover:bg-gold/5 transition-colors group">
              <Star size={20} className="text-slate-400 group-hover:text-gold transition-colors" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600 text-center">Premium Quality</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => size && (!product.colors?.length || color) && addToCart(product, size, color)}
              className={`w-full bg-black text-white py-4 md:py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl ${(!size || (product.colors?.length && !color)) ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
            >
              Acquire for Archive
            </button>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">Share this Piece</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleShare('facebook')}
                className="p-3 bg-slate-50 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-all rounded-full"
                aria-label="Share on Facebook"
              >
                <Facebook size={18} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-3 bg-slate-50 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-all rounded-full"
                aria-label="Share on Twitter"
              >
                <Twitter size={18} />
              </button>
              <button
                onClick={() => handleShare('pinterest')}
                className="p-3 bg-slate-50 text-slate-600 hover:bg-[#BD081C] hover:text-white transition-all rounded-full"
                aria-label="Share on Pinterest"
              >
                <PinterestIcon size={18} />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white transition-all rounded-full relative group"
                aria-label="Copy Link"
              >
                {copied ? <Check size={18} /> : <LinkIcon size={18} />}
                {copied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-1 px-2 rounded opacity-100 transition-opacity whitespace-nowrap">
                    Copied
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Admin Components ---
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import InventoryManager from './components/admin/InventoryManager';
import OrderSymphony from './components/admin/OrderSymphony';
import BespokeRegistry from './components/admin/BespokeRegistry';
import CouponForge from './components/admin/CouponForge';
import AdminSettings from './components/admin/AdminSettings';
import UserDashboard from './components/user/UserDashboard';
import NotFound from './components/NotFound';
import { getSettings } from './services/firestoreService';

// --- App Provider ---

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ festivalMode: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getUserDocument(firebaseUser.uid);
        if (userDoc) {
          setUser(userDoc);
          const userOrders = await getUserOrders(firebaseUser.uid);
          setOrders(userOrders);
          const userWishlist = await getUserWishlist(firebaseUser.uid);
          setWishlist(userWishlist);
          if (window.location.hash === '#/login') {
            navigate(userDoc.role === 'admin' ? '/admin' : '/profile');
          }
        }
      } else {
        setUser(null);
        setOrders([]);
        setWishlist([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch products and settings
  useEffect(() => {
    const fetchInitialData = async () => {
      const [firestoreProducts, appSettings] = await Promise.all([
        getProducts(),
        getSettings()
      ]);

      if (firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
      setSettings(appSettings);

      // If admin, fetch all orders/users could be lazily loaded or here
      // For simplicity/reactivity in this demo, we might fetch all orders here if admin
      // But we don't have user role check here easily without user state being ready.
      // So we'll rely on Admin components fetching or AppProvider fetching if user is admin.    
    };
    fetchInitialData();
  }, []);

  // Fetch Admin Data if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      // In a real app, use SWR or React Query. Here we just fetch once on admin recognition.
      const fetchAdminData = async () => {
        const firestoreService = await import('./services/firestoreService');
        const allOrders = await firestoreService.getAllOrders();
        const allCoupons = await firestoreService.getCoupons();
        setOrders(allOrders);
        setCoupons(allCoupons);
      }
      fetchAdminData();
    }
  }, [user]);

  // Sync wishlist to Firestore when it changes
  useEffect(() => {
    if (user && wishlist.length >= 0) {
      updateWishlist(user.id, wishlist).catch(console.error);
    }
  }, [wishlist, user]);

  const addToCart = (product: Product, selectedSize: string, selectedColor?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
      if (existing) return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [{ ...product, selectedSize, selectedColor, quantity: 1 }, ...prev];
    });
  };

  const removeFromCart = (id: string, size: string, color?: string) => setCart(prev => prev.map(i => i.id === id && i.selectedSize === size && i.selectedColor === color ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  const removeItem = (id: string, size: string, color?: string) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedSize === size && i.selectedColor === color)));
  const clearCart = () => setCart([]);
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const addReview = (pid: string, r: Review) => setProducts(p => p.map(it => it.id === pid ? { ...it, reviews: [r, ...it.reviews] } : it));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Atelier...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      products, setProducts, cart, addToCart, removeFromCart, removeItem, clearCart,
      user, setUser, orders, setOrders, addOrder, wishlist, toggleWishlist,
      coupons, setCoupons, giftCards, setGiftCards, addReview, settings, setSettings,
      loading
    }}>{children}</AppContext.Provider>
  );
};

// ... LegalPage ...

// --- App Root ---

const App = () => (
  <Router>
    <AdSenseManager />
    <AppProvider>
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col relative">
        <HoliEffect />
        <ConditionalNavbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/style-guide" element={<StyleGuide />} />
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/profile" element={<UserDashboard />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="inventory" element={<InventoryManager />} />
              <Route path="orders" element={<OrderSymphony />} />
              <Route path="bespoke" element={<BespokeRegistry />} />
              <Route path="coupons" element={<CouponForge />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/shipping-returns" element={<ShippingPolicy />} />
            <Route path="/our-commitment" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ConditionalFooter />
      </div>
    </AppProvider>
  </Router>
);

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Navbar />;
}


const ConditionalFooter = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#111111] text-white pt-12 md:pt-16 pb-10 md:pb-12 mt-20 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 text-left">
          <div className="space-y-6">
            <Link to="/" className="inline-block h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-full mb-2">
              <img src={LOGO_URL} alt="Anandam Logo" className="h-full w-full object-cover" />
            </Link>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Anandam Fashion</h4>
              <p className="text-white/40 italic font-light text-xs max-w-xs leading-relaxed font-serif">
                Contemporary luxury, artisanal Indian heritage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 text-left">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/80">Archive</h4>
              <ul className="space-y-3">
                {['Women', 'Girls', 'Style Guide', 'Offers'].map((item) => (
                  <li key={item}>
                    <Link to={item === 'Offers' ? '/offers' : (item === 'Style Guide' ? '/style-guide' : `/shop/${item}`)} className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 text-left">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/80">Concierge</h4>
              <ul className="space-y-3">
                <li><Link to="/shipping-returns" className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">Shipping & Returns</Link></li>
                <li><Link to="/contact" className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">Contact Us</Link></li>
                <li><Link to="/our-commitment" className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">Our Commitment</Link></li>
                <li><Link to="/privacy-policy" className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/80">Prestige Circle</h4>
            <div className="space-y-4">
              <p className="text-white/40 italic font-serif text-sm leading-relaxed">Invitations to private archive previews.</p>
              <div className="relative group max-w-[280px]">
                <input
                  type="email"
                  placeholder="Identity Email"
                  className="w-full bg-white/5 border-b border-white/20 pb-2 text-[10px] italic font-serif outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 w-full flex flex-col items-center justify-center text-center gap-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Blog', to: '/blog' },
              { label: 'Contact', to: '/contact' },
              { label: 'Shipping', to: '/shipping-returns' },
              { label: 'Privacy', to: '/privacy-policy' },
              { label: 'Terms', to: '/terms-of-service' },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
            <CreditCard size={14} />
            <ShieldCheck size={14} />
            <Globe size={14} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[8px] font-medium uppercase tracking-[0.4em] text-white/20">
              &copy; {new Date().getFullYear()} Anandam Fashion Global.
            </p>
            <p className="text-[8px] font-medium uppercase tracking-[0.4em] text-white/10">
              website designed <span className="text-white/40">by</span> <span className="text-gold">saveragraphics</span> a <span className="text-red-500 italic font-serif lowercase tracking-normal px-1">sindhuragroup</span> company
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default App;


