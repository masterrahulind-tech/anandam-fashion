
import React, { useState, useEffect, createContext, useContext, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag, User as UserIcon, Heart, Search, Menu, X, ChevronRight,
  Star, Sparkles, Plus, Trash2, ArrowRight, TrendingUp, Clock, Layers,
  Ruler, Target, ClipboardList, Facebook, Twitter, Settings, LogOut, LayoutDashboard,
  Ticket, Gift, Calendar, DollarSign, Tag, Percent, ThumbsUp, CheckCircle, Scissors,
  MapPin, Package, CreditCard, ShieldCheck, Eye, EyeOff, Instagram, Youtube, Globe,
  Share2, Truck, BarChart3, History, Edit, Info, Ruler as RulerIcon, Check, Lock, Home, Activity
} from 'lucide-react';
import { Product, CartItem, User, Order, Category, Review, Coupon, GiftCard, CustomMeasurements, AuditLog, Campaign, BespokeRequest, PaymentSettings } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { getFashionAdvice } from './services/geminiService';
import * as firestoreService from './services/firestoreService';
import { auth, googleProvider } from './services/firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';

// --- Constants ---
const LOGO_URL = "/logo.png";

// --- Context ---
interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (p: Product, size: string, customization?: { measurements: CustomMeasurements, notes: string }) => void;
  removeFromCart: (id: string, size: string) => void;
  removeItem: (id: string, size: string) => void;
  clearCart: () => void;
  user: User | null;
  setUser: (u: User | null) => void;
  orders: Order[];
  addOrder: (o: Order) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  giftCards: GiftCard[];
  setGiftCards: React.Dispatch<React.SetStateAction<GiftCard[]>>;
  addReview: (productId: string, review: Review) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
  authLoading: boolean;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  recentlyViewed: string[];
  addToRecentlyViewed: (id: string) => void;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  bgCurrency: (amount: number) => string;
  paymentSettings: PaymentSettings;
}

const AppContext = createContext<AppContextType | null>(null);

const useApp = () => {
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
  const { cart, user, wishlist, setUser, products } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestions = () => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();

    const matchedProducts = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedCategories = Array.from(new Set(products
      .map(p => p.category)
      .filter(c => c.toLowerCase().includes(query))
    )).slice(0, 3);

    const matchedFabrics = Array.from(new Set(products
      .map(p => p.subCategory)
      .filter(f => f.toLowerCase().includes(query))
    )).slice(0, 3);

    if (matchedProducts.length === 0 && matchedCategories.length === 0 && matchedFabrics.length === 0) return null;

    return { products: matchedProducts, categories: matchedCategories, fabrics: matchedFabrics };
  };

  const suggestions = getSuggestions();

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
    { name: 'Children', path: '/shop/Children' },
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
                <div className={`relative transition-all duration-500 ${isScrolled ? 'h-14 w-40 md:h-16 md:w-48' : 'h-20 w-56 md:h-24 md:w-64'} overflow-hidden rounded-sm border-none flex justify-start`}>
                  <img
                    src={LOGO_URL}
                    alt="Anandam Logo"
                    className="h-full w-full object-contain object-left"
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
              {/* Desktop Search */}
              <div ref={searchRef} className="hidden md:flex items-center relative">
                <Search size={16} className={`absolute left-3 ${isScrolled ? 'text-slate-400' : 'text-white/70'}`} />
                <input
                  type="text"
                  placeholder="Search archive..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setShowSearchSuggestions(true);
                    if (location.pathname.startsWith('/shop')) {
                      // Real-time Myntra-style filtering
                      const params = new URLSearchParams(location.search);
                      if (val) params.set('q', val);
                      else params.delete('q');
                      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/shop?q=${searchQuery}`);
                      setShowSearchSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  className={`pl-9 pr-4 py-1.5 text-[10px] rounded-full border-none outline-none w-32 focus:w-64 transition-all ${isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white placeholder:text-white/50 backdrop-blur-md'
                    }`}
                />

                {showSearchSuggestions && searchQuery.trim() && (
                  <div className="absolute top-full right-0 w-80 bg-white mt-2 shadow-2xl rounded-sm border border-slate-100 overflow-hidden z-[100] animate-fadeIn">
                    {suggestions ? (
                      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {suggestions.categories.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[8px] font-bold uppercase tracking-widest text-gold border-b border-gold/10 pb-1 text-left">Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestions.categories.map(cat => (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    navigate(`/shop/${cat}`);
                                    setShowSearchSuggestions(false);
                                    setSearchQuery('');
                                  }}
                                  className="text-[10px] bg-slate-50 px-3 py-1 rounded-full hover:bg-gold hover:text-white transition-all text-slate-600"
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {suggestions.fabrics.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[8px] font-bold uppercase tracking-widest text-gold border-b border-gold/10 pb-1 text-left">Fabrics</h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestions.fabrics.map(fab => (
                                <button
                                  key={fab}
                                  className="text-[10px] bg-slate-50 px-3 py-1 rounded-full hover:bg-gold hover:text-white transition-all text-slate-600"
                                  onClick={() => {
                                    navigate(`/shop?q=${fab}`);
                                    setShowSearchSuggestions(false);
                                    setSearchQuery('');
                                  }}
                                >
                                  {fab}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {suggestions.products.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-[8px] font-bold uppercase tracking-widest text-gold border-b border-gold/10 pb-1 text-left">Products</h4>
                            {suggestions.products.map(p => (
                              <Link
                                key={p.id}
                                to={`/product/${p.id}`}
                                onClick={() => {
                                  setShowSearchSuggestions(false);
                                  setSearchQuery('');
                                }}
                                className="flex items-center gap-3 group/item border-b border-slate-50 pb-2 last:border-0"
                              >
                                <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-sm grayscale group-hover/item:grayscale-0 transition-all" />
                                <div className="text-left">
                                  <p className="text-[11px] font-serif italic text-slate-800 line-clamp-1">{p.name}</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">₹{p.price.toLocaleString()}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50/30">
                        <p className="text-xs font-serif italic text-slate-400">No archival matches found</p>
                      </div>
                    )}
                    <div className="bg-slate-900 p-2 text-center">
                      <button
                        onClick={() => {
                          navigate('/shop');
                          setShowSearchSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold hover:text-white transition-all"
                      >
                        Explore Full Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Search Toggle */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowSearchSuggestions(true);
                }}
                className={`p-2 md:hidden transition-all ${isScrolled ? 'text-slate-600' : 'text-white'}`}
              >
                {showSearchSuggestions && !searchQuery ? <X size={20} /> : <Search size={20} />}
              </button>

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

              <div className="relative group profile-dropdown-container">
                <Link
                  to={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/login'}
                  className={`p-2 transition-all hover:scale-110 flex flex-col items-center ${isScrolled ? 'text-slate-600' : 'text-white'}`}
                >
                  <UserIcon size={20} />
                  <span className="text-[7px] font-bold uppercase tracking-widest mt-1 hidden md:block">{user ? 'Profile' : 'Login'}</span>
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
                  <div className="bg-white shadow-2xl rounded-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-1">
                        {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Welcome User'}
                      </p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-4">To access account and manage orders</p>
                      {!user && (
                        <Link to="/login" className="block text-center border border-rose-100 text-rose-500 text-[9px] font-bold uppercase tracking-widest py-3 hover:bg-rose-50 transition-all">
                          Login / Signup
                        </Link>
                      )}
                    </div>

                    <div className="py-2 px-2">
                      <Link to="/profile?tab=orders" className="flex items-center gap-3 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-sm">Orders</Link>
                      <Link to="/profile?tab=wishlist" className="flex items-center gap-3 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-sm">Wishlist</Link>
                      <Link to="/profile?tab=coupons" className="flex items-center gap-3 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-sm">Coupons</Link>
                      <Link to="/profile?tab=addresses" className="flex items-center gap-3 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-sm">Addresses</Link>
                      <Link to="/profile?tab=details" className="flex items-center gap-3 px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all rounded-sm">Edit Profile</Link>
                    </div>

                    {user && (
                      <div className="border-t border-slate-50">
                        <button onClick={() => signOut(auth)} className="w-full text-left flex items-center gap-3 px-6 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 transition-all">
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            <div className="h-12 w-32 overflow-hidden rounded-sm">
              <img src={LOGO_URL} alt="Anandam Logo" className="h-full w-full object-contain" />
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

      {/* Mobile Search Overlay */}
      {showSearchSuggestions && (
        <div className="fixed inset-0 bg-white z-[200] lg:hidden animate-fadeIn flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <button
              onClick={() => {
                setShowSearchSuggestions(false);
                setSearchQuery('');
              }}
              className="text-slate-400"
            >
              <ArrowRight className="rotate-180" size={24} />
            </button>
            <div className="flex-grow relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold" />
              <input
                type="text"
                autoFocus
                placeholder="Browse the archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 py-3 pl-10 pr-4 text-xs font-serif italic outline-none rounded-sm border-none"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            {searchQuery.trim() ? (
              suggestions ? (
                <div className="p-6 space-y-8 text-left">
                  {suggestions.categories.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">Archival Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map(cat => (
                          <button
                            key={cat} onClick={() => { navigate(`/shop/${cat}`); setShowSearchSuggestions(false); setSearchQuery(''); }}
                            className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-600 rounded-full"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.fabrics.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">Masterpiece Fabrics</h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.fabrics.map(fab => (
                          <button
                            key={fab} onClick={() => { navigate(`/shop?q=${fab}`); setShowSearchSuggestions(false); setSearchQuery(''); }}
                            className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-600 rounded-full"
                          >
                            {fab}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.products.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold">Curated Pieces</h4>
                      <div className="space-y-4">
                        {suggestions.products.map(p => (
                          <Link
                            key={p.id} to={`/product/${p.id}`} onClick={() => { setShowSearchSuggestions(false); setSearchQuery(''); }}
                            className="flex items-center gap-4 group"
                          >
                            <img src={p.images[0]} className="w-14 h-18 object-cover rounded-sm shadow-sm" alt={p.name} />
                            <div>
                              <h5 className="font-serif italic text-sm text-slate-900">{p.name}</h5>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">₹{p.price.toLocaleString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-20 text-center space-y-4">
                  <Scissors size={48} className="mx-auto text-slate-100" />
                  <p className="font-serif italic text-slate-400">No archival matches found.</p>
                </div>
              )
            ) : (
              <div className="p-10 text-left space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Popular Searches</h4>
                <div className="flex flex-wrap gap-3">
                  {['Silk', 'Luxury', 'Bridal', 'Kurta'].map(tag => (
                    <button key={tag} onClick={() => setSearchQuery(tag)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 px-4 py-2 rounded-full">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100">
            <button
              onClick={() => { navigate('/shop'); setShowSearchSuggestions(false); setSearchQuery(''); }}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em]"
            >
              Explore Full Archive
            </button>
          </div>
        </div>
      )
      }
    </>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { toggleWishlist, wishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="group relative bg-white overflow-hidden transition-all duration-500 rounded-sm shadow-sm hover:shadow-lg border border-slate-100 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        {/* Primary Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110 ${product.images.length > 1 ? 'group-hover:opacity-0' : ''}`}
        />
        {/* Secondary Image (Hover) */}
        {product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[1.5s] scale-105 group-hover:scale-110 opacity-0 group-hover:opacity-100"
          />
        )}
        {(product.originalPrice > product.price) && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[7px] font-black px-2 py-1 uppercase tracking-widest z-10 shadow-sm">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-slate-300 shadow-sm z-10 transition-colors hover:text-rose-500"
        aria-label={`Add ${product.name} to wishlist`}
      >
        <Heart size={14} fill={isWishlisted ? '#f43f5e' : 'none'} className={isWishlisted ? 'text-rose-500' : ''} />
      </button>
      <div className="p-3 md:p-4 text-center flex flex-col flex-grow">
        <p className="text-[7px] md:text-[8px] text-gold font-bold uppercase tracking-[0.3em] mb-1">{product.category} {product.subCategory} Collection</p>
        <h3 className="text-[11px] md:text-[13px] font-serif italic text-slate-800 line-clamp-1 mb-2">{product.name}</h3>
        <div className="mt-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs md:text-sm font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
            {(product.originalPrice > product.price) && (
              <span className="text-[10px] text-slate-300 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentlyViewed: React.FC = () => {
  const { recentlyViewed, products } = useApp();
  const recentProducts = recentlyViewed.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];

  if (recentProducts.length === 0) return null;

  return (
    <div className="py-20 border-t border-slate-50">
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-serif italic text-slate-900 leading-tight">Recently Viewed</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Refining Your Archive Explore</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {recentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { user, setUser, authLoading, showToast } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return showToast('Please enter your email', 'info');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      showToast('Recovery instructions sent to your email');
      setIsResetOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email', 'info');
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/profile');
    }
  }, [user, authLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const userData = await firestoreService.fetchUser(userCredential.user.uid);
        if (userData) setUser(userData);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const newUser: User = {
          id: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.email === 'admin@anandam.com' ? 'admin' : 'user'
        };
        await firestoreService.saveUser(newUser);
        setUser(newUser);
      }
      navigate('/profile');
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { signInWithPopup } = await import('firebase/auth');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const userData = await firestoreService.fetchUser(userCredential.user.uid);
      if (userData) {
        setUser(userData);
      } else {
        const newUser: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
          email: userCredential.user.email || '',
          phone: '',
          role: userCredential.user.email === 'admin@anandam.com' ? 'admin' : 'user'
        };
        await firestoreService.saveUser(newUser);
        setUser(newUser);
      }
      navigate('/profile');
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || 'Google Authentication failed');
    } finally {
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
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
              <input
                type="text" required
                className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Email Identity</label>
            <input
              type="email" required
              className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Archive Key (Password)</label>
            <input
              type="password" required
              className="w-full p-3 bg-slate-50 text-sm outline-none border-b border-transparent focus:border-gold transition-all"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            {isLogin && (
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => setIsResetOpen(true)} className="text-[8px] font-bold uppercase tracking-widest text-slate-400 hover:text-gold transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] shadow-lg hover:bg-gold transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-slate-300">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Identity
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
          >
            {isLogin ? "New to the atelier? Create registry" : "Existing collector? Sign in"}
          </button>
        </div>
      </div>

      {isResetOpen && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl relative">
            <button onClick={() => setIsResetOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-serif italic mb-2">Reset Access</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Enter your email to receive recovery instructions.</p>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <input
                type="email" required
                className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
                placeholder="Email Identity"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] shadow-lg hover:bg-gold transition-all"
              >
                Send Recovery Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- User Profile & Orders ---

const PaymentModal = ({ isOpen, onClose, totalAmount, onComplete }: { isOpen: boolean, onClose: () => void, totalAmount: number, onComplete: (data: any) => void }) => {
  const { paymentSettings, bgCurrency, user, showToast } = useApp();
  const [method, setMethod] = useState<'COD' | 'PrePaid'>('PrePaid');
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [details, setDetails] = useState({
    street: '', city: '', state: '', zip: '', country: 'India', phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const shippingCost = totalAmount >= paymentSettings.freeShippingThreshold ? 0 : paymentSettings.shippingCharge;
  const codCost = method === 'COD' && paymentSettings.codEnabled ? paymentSettings.codFee : 0;
  const discount = method === 'PrePaid' ? (totalAmount * paymentSettings.prepaidDiscount / 100) : 0;
  const finalTotal = totalAmount + shippingCost + codCost - discount;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    onComplete({
      shippingAddress: details,
      paymentMethod: method,
      paymentStatus: method === 'PrePaid' ? 'Paid' : 'Pending', // COD is Pending
      shippingCost,
      codFee: codCost,
      discount,
      finalTotal
    });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-serif italic text-slate-800">Secure Checkout</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-1">
              {step === 'address' ? 'Shipping Details' : 'Payment & Confirmation'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          {step === 'address' ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Street Address</label>
                  <input
                    type="text"
                    value={details.street}
                    onChange={e => setDetails({ ...details, street: e.target.value })}
                    className="w-full bg-slate-50 p-3 outline-none border-b border-transparent focus:border-gold transition-all text-xs font-medium"
                    placeholder="House No, Street Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">City</label>
                  <input
                    type="text"
                    value={details.city}
                    onChange={e => setDetails({ ...details, city: e.target.value })}
                    className="w-full bg-slate-50 p-3 outline-none border-b border-transparent focus:border-gold transition-all text-xs font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">State</label>
                  <input
                    type="text"
                    value={details.state}
                    onChange={e => setDetails({ ...details, state: e.target.value })}
                    className="w-full bg-slate-50 p-3 outline-none border-b border-transparent focus:border-gold transition-all text-xs font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">ZIP Code</label>
                  <input
                    type="text"
                    value={details.zip}
                    onChange={e => setDetails({ ...details, zip: e.target.value })}
                    className="w-full bg-slate-50 p-3 outline-none border-b border-transparent focus:border-gold transition-all text-xs font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Phone</label>
                  <input
                    type="tel"
                    value={details.phone}
                    onChange={e => setDetails({ ...details, phone: e.target.value })}
                    className="w-full bg-slate-50 p-3 outline-none border-b border-transparent focus:border-gold transition-all text-xs font-medium"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!details.street || !details.city || !details.zip) return showToast('Please complete shipping details', 'info');
                  setStep('payment');
                }}
                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-lg mt-6"
              >
                Proceed to Payment
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-slate-50 p-6 rounded-sm space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span>{bgCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : bgCurrency(shippingCost)}</span>
                </div>
                {method === 'PrePaid' && discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Pre-Paid Privilege ({paymentSettings.prepaidDiscount}%)</span>
                    <span>-{bgCurrency(discount)}</span>
                  </div>
                )}
                {method === 'COD' && codCost > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>COD Convenience Fee</span>
                    <span>{bgCurrency(codCost)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Valuation</span>
                  <span>{bgCurrency(finalTotal)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMethod('PrePaid')}
                    className={`p-4 border text-left transition-all relative overflow-hidden group ${method === 'PrePaid' ? 'border-gold bg-gold/5' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard size={16} className={method === 'PrePaid' ? 'text-gold' : 'text-slate-400'} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${method === 'PrePaid' ? 'text-slate-900' : 'text-slate-500'}`}>Pre-Paid</span>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-relaxed">Secure Gateway via Stripe/Razorpay. Save {paymentSettings.prepaidDiscount}% instantly.</p>
                    {method === 'PrePaid' && <div className="absolute top-0 right-0 p-1 bg-gold text-white"><Check size={10} /></div>}
                  </button>

                  {paymentSettings.codEnabled && (
                    <button
                      onClick={() => setMethod('COD')}
                      className={`p-4 border text-left transition-all relative overflow-hidden group ${method === 'COD' ? 'border-gold bg-gold/5' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Truck size={16} className={method === 'COD' ? 'text-gold' : 'text-slate-400'} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${method === 'COD' ? 'text-slate-900' : 'text-slate-500'}`}>Cash on Delivery</span>
                      </div>
                      <p className="text-[8px] text-slate-400 leading-relaxed">Pay at your doorstep. Additional handling fee {bgCurrency(paymentSettings.codFee)}.</p>
                      {method === 'COD' && <div className="absolute top-0 right-0 p-1 bg-gold text-white"><Check size={10} /></div>}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-slate-900 text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Securely...
                  </>
                ) : (
                  <>
                    <Lock size={12} />
                    Authorize Payment of {bgCurrency(finalTotal)}
                  </>
                )}
              </button>
              <button
                onClick={() => setStep('address')}
                className="w-full text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600"
              >
                Back to Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, addToCart, removeItem, clearCart, user, addOrder, bgCurrency } = useApp();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) return;
    setIsCheckoutOpen(true);
  };

  const handlePaymentComplete = async (paymentData: any) => {
    if (!user) return;

    const order: Order = {
      id: `AN-${Math.floor(Math.random() * 100000)}`,
      userId: user.id,
      userName: user.name,
      items: [...cart],
      subtotal: subtotal,
      shipping: paymentData.shippingCost,
      shippingCost: paymentData.shippingCost, // Ensure compatibility
      codFee: paymentData.codFee,
      discount: paymentData.discount,
      total: paymentData.finalTotal,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      timeline: [
        { status: 'Pending', date: new Date().toISOString(), note: 'Order placed successfully' }
      ],
      trackingNumber: '',
      giftCardApplied: 0,
      shippingAddress: paymentData.shippingAddress,
      paymentMethod: paymentData.paymentMethod,
      paymentStatus: paymentData.paymentStatus,
      currency: 'INR' // Default to INR for now or fetch from context if needed
    };

    await addOrder(order);
    clearCart();
    setIsCheckoutOpen(false);
    navigate('/profile');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif italic">The Cart Archive</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{cart.length} Items Selected</p>
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center space-y-6 bg-slate-50/50 rounded-sm">
          <ShoppingBag size={64} className="mx-auto text-slate-100" />
          <p className="font-serif italic text-slate-400 text-xl">Your archive is currently empty.</p>
          <Link to="/shop" className="inline-block px-10 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all">Explore Collections</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 pb-8 border-b border-slate-50 relative group">
                <div className="w-24 h-32 md:w-32 md:h-40 overflow-hidden rounded-sm shadow-md">
                  <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold">{item.subCategory}</p>
                      <h3 className="text-lg md:text-xl font-serif italic">{item.name}</h3>
                    </div>
                    <button onClick={() => removeItem(item.id, item.selectedSize)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm font-bold opacity-60 italic font-serif">Size: {item.selectedSize}</p>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center border border-slate-100 rounded-sm">
                      <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="px-3 py-1 hover:bg-slate-50"><X size={12} /></button>
                      <span className="px-4 text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => addToCart(item, item.selectedSize)} className="px-3 py-1 hover:bg-slate-50"><Plus size={12} /></button>
                    </div>
                    <p className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside>
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm sticky top-32">
              <h3 className="text-xl font-serif italic mb-6">Archive Summary</h3>
              <div className="space-y-4 text-xs font-medium uppercase tracking-widest text-slate-500">
                <div className="flex justify-between pb-4 border-b border-slate-50">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-slate-50">
                  <span>Shipping</span>
                  <span className="text-slate-900 italic">Complimentary</span>
                </div>
                <div className="flex justify-between pt-4 text-slate-900 font-bold">
                  <span>Total Valuation</span>
                  <span className="text-xl">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-5 mt-10 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl"
              >
                {user ? 'Finalize Acquisition' : 'Login to Checkout'}
              </button>
              <p className="text-[8px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-gold" /> Secure Artisanal Fulfillment
              </p>
            </div>
          </aside>
        </div>
      )}
      <PaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={subtotal}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
};

const ProfilePage = () => {
  const { user, setUser, orders, authLoading, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  const TabButton = ({ name, id, icon: Icon }: { name: string, id: string, icon: any }) => (
    <button
      onClick={() => setSearchParams({ tab: id })}
      className={`flex items-center gap-3 py-2.5 px-4 text-[8px] font-bold uppercase tracking-[0.2em] transition-all border-l-2 rounded-sm ${activeTab === id
        ? 'text-slate-950 bg-slate-50 border-gold shadow-sm'
        : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50'
        }`}
    >
      <Icon size={16} /> {name}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3 space-y-8">
          <div className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm">
            <div className="flex flex-col items-center text-center gap-4 pb-6 border-b border-slate-50">
              <div className="w-20 h-20 bg-[#1a0507] rounded-full flex items-center justify-center text-gold text-3xl font-serif italic shadow-xl border-4 border-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-serif italic text-slate-900">{user.name}</h2>
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold mt-1">Elite Member</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1 mt-6">
              <TabButton name="Order History" id="orders" icon={Package} />
              <TabButton name="Saved Addresses" id="addresses" icon={MapPin} />
              <TabButton name="Profile Details" id="details" icon={UserIcon} />
              <TabButton name="My Wishlist" id="wishlist" icon={Heart} />
              <TabButton name="Coupons" id="coupons" icon={Tag} />
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-rose-500 p-4 mt-4 border-t border-slate-50 hover:bg-rose-50 transition-all rounded-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-12 animate-fadeIn">
          {activeTab === 'orders' && (
            <>
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <h3 className="text-2xl md:text-3xl font-serif italic text-slate-800">Acquisition Archives</h3>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">{orders.length} Records Found</p>
              </div>

              {orders.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-sm">
                  <ShoppingBag size={48} className="mx-auto text-slate-100" />
                  <p className="font-serif italic text-slate-400">Your fashion archive is currently empty.</p>
                  <Link to="/shop" className="inline-block px-8 py-3 bg-black text-white text-[9px] font-bold uppercase tracking-widest">Shop Collection</Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-slate-100 p-6 md:p-8 rounded-sm shadow-sm hover:shadow-md transition-all group lg:relative overflow-hidden">
                      {order.status === 'Delivered' && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20"></div>
                      )}

                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 border-b border-slate-50 pb-6">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-1 px-2 py-0.5 bg-slate-50 inline-block">Ref: #{order.id.slice(-8).toUpperCase()}</p>
                          <h4 className="text-base font-serif italic mt-2">Archived on {order.date}</h4>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest rounded-full ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                            order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                              'bg-gold/10 text-gold shadow-sm'
                            }`}>
                            {order.status}
                          </span>
                          <p className="text-[9px] font-bold text-slate-900 tracking-tight">₹{order.total.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <div className="mb-10 px-4">
                        <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                          {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                            const stepsArr = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
                            const currentIdx = stepsArr.indexOf(order.status);
                            const isPast = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;

                            if (currentIdx === -1 && ['Cancelled', 'Returned'].includes(order.status)) return null;

                            return (
                              <div key={step} className="flex flex-col items-center relative z-10">
                                <div className={`w-3 h-3 rounded-full border-2 mb-2 transition-all duration-500 ${isPast ? 'bg-gold border-gold scale-125' : 'bg-white border-slate-100'
                                  } ${isCurrent ? 'animate-pulse ring-4 ring-gold/10 scale-150' : ''}`} />
                                <span className={`text-[7px] font-bold uppercase tracking-widest ${isPast ? 'text-slate-900' : 'text-slate-200'}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                          {(!['Cancelled', 'Returned'].includes(order.status)) && (
                            <div className="absolute top-1.5 left-0 right-0 h-[1px] bg-slate-50 -z-0">
                              <div className="bg-gold h-full transition-all duration-700" style={{ width: `${Math.max(0, ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].indexOf(order.status) * 25)}%` }} />
                            </div>
                          )}
                        </div>
                        {order.status === 'Shipped' && order.trackingNumber && (
                          <div className="text-center mt-6 p-4 bg-slate-50 border border-slate-100 rounded-sm inline-block">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Logistics Partner: {order.courier}</p>
                            <p className="text-sm font-serif italic text-slate-900">Waybill: {order.trackingNumber}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-6 items-center group/item">
                            <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded-sm border border-slate-50">
                              <img src={item.images[0]} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt="" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-800">{item.name}</h5>
                              <p className="text-[9px] italic font-serif text-slate-400 mt-1">Size: {item.selectedSize} &bull; Qty: {item.quantity}</p>
                            </div>
                            <p className="text-[11px] font-bold text-slate-900 tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Fulfillment Verified by Anandam Fashion</p>
                        <div className="flex gap-4">
                          {['Pending', 'Confirmed', 'Packed'].includes(order.status) && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Cancel this archival request?')) {
                                  await firestoreService.updateOrder(order.id, { status: 'Cancelled' });
                                  const updated = await firestoreService.fetchOrdersByUser(user.id);
                                  // We need to update local state passed from props or re-fetch logic
                                  window.location.reload(); // Simple reload to refresh for now
                                }
                              }}
                              className="text-[9px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-600 border-b border-rose-200 transition-all pb-0.5"
                            >
                              Cancel Request
                            </button>
                          )}

                          {order.status === 'Delivered' && (
                            <button
                              onClick={async () => {
                                const reason = prompt("Reason for Return/Exchange:");
                                if (reason) {
                                  await firestoreService.updateOrder(order.id, { status: 'Return Requested', returnReason: reason });
                                  window.location.reload();
                                }
                              }}
                              className="text-[9px] font-bold uppercase tracking-widest text-gold border-b border-gold/30 hover:text-slate-900 hover:border-slate-900 transition-all pb-0.5"
                            >
                              Request Return / Exchange
                            </button>
                          )}
                          <button className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Support</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <h3 className="text-2xl md:text-3xl font-serif italic text-slate-800">Saved Addresses</h3>
                <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold border border-gold/20 px-6 py-2.5 hover:bg-gold hover:text-white transition-all rounded-sm">Add New Address</button>
              </div>
              <div className="py-24 border-2 border-dashed border-slate-100 rounded-sm text-center space-y-4 bg-white/50">
                <MapPin size={32} className="mx-auto text-slate-200" />
                <p className="font-serif italic text-slate-400">No delivery coordinates saved yet.</p>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <h3 className="text-2xl md:text-3xl font-serif italic text-slate-800">Coupons & Offers</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 border border-gold/20 bg-gold/5 rounded-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2">
                    <Ticket size={24} className="text-gold/20 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-2">Welcome Bonus</p>
                  <h4 className="text-xl font-serif italic text-slate-900 mb-1">ANANDAM10</h4>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">10% OFF on your next acquisition</p>
                </div>
                <div className="p-8 border border-slate-100 bg-slate-50/50 rounded-sm flex flex-col items-center justify-center text-center opacity-60">
                  <Gift size={24} className="text-slate-200 mb-2" />
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">No active gift cards</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <h3 className="text-2xl md:text-3xl font-serif italic text-slate-800">Profile Details</h3>
              </div>
              <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-sm shadow-sm">
                <form className="max-w-xl space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full name</label>
                      <input type="text" defaultValue={user.name} className="w-full bg-slate-50 p-4 rounded-sm outline-none border border-transparent focus:border-gold/30 text-xs font-bold transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phone number</label>
                      <input type="text" defaultValue={user.phone || ''} placeholder="Add number" className="w-full bg-slate-50 p-4 rounded-sm outline-none border border-transparent focus:border-gold/30 text-xs font-bold transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registered Email</label>
                    <input type="email" defaultValue={user.email} disabled className="w-full bg-slate-50 p-4 rounded-sm outline-none text-xs font-bold text-slate-400 cursor-not-allowed border border-slate-100" />
                    <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest italic flex items-center gap-2"><ShieldCheck size={10} /> Email verification managed by Google Identity</p>
                  </div>
                  <button className="bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl rounded-sm">Update Identity</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                <h3 className="text-2xl md:text-3xl font-serif italic text-slate-800">My Wishlist</h3>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300">Curated Desires</p>
              </div>
              <div className="py-24 text-center space-y-6 bg-white border border-slate-100 border-dashed rounded-sm">
                <div className="relative inline-block">
                  <Heart size={48} className="mx-auto text-slate-50" />
                  <Sparkles size={20} className="absolute -top-2 -right-2 text-gold animate-pulse" />
                </div>
                <p className="font-serif italic text-slate-400">Your curated desires list is currently empty.</p>
                <Link to="/shop" className="inline-block px-12 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-lg rounded-sm">Continue Exploration</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Admin Section ---

const OrderManagementModal: React.FC<{
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (orderId: string, updates: Partial<Order>) => Promise<void>;
}> = ({ order, isOpen, onClose, onUpdate }) => {
  if (!isOpen || !order) return null;

  const [trackingId, setTrackingId] = useState(order.trackingNumber || '');
  const [courierName, setCourierName] = useState(order.courier || '');
  const [processing, setProcessing] = useState(false);

  const steps = [
    { status: 'Pending', label: 'Order Placed', icon: ClipboardList },
    { status: 'Confirmed', label: 'Confirmed', icon: CheckCircle },
    { status: 'Packed', label: 'Packed', icon: Package },
    { status: 'Shipped', label: 'Shipped', icon: Truck },
    { status: 'Delivered', label: 'Delivered', icon: Home }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';
  const isReturned = order.status.includes('Return');

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    setProcessing(true);
    try {
      const updates: Partial<Order> = {
        status: newStatus,
        timeline: [
          ...order.timeline,
          {
            status: newStatus,
            date: new Date().toISOString(),
            note: `Status updated to ${newStatus}`
          }
        ]
      };

      if (newStatus === 'Shipped') {
        updates.trackingNumber = trackingId;
        updates.courier = courierName;
      }

      await onUpdate(order.id, updates);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[600] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative flex flex-col md:flex-row">

        {/* Left Panel - Order Details */}
        <div className="md:w-2/3 p-8 border-r border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-serif italic text-slate-900">Order #{order.id}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Placed on {order.date} via {order.paymentMethod}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${isCancelled ? 'bg-rose-50 text-rose-600' :
              isReturned ? 'bg-orange-50 text-orange-600' :
                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
              }`}>
              {order.status}
            </div>
          </div>

          <div className="space-y-8">
            {/* Customer Info */}
            <div className="bg-slate-50 p-6 rounded-sm">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <UserIcon size={12} /> Customer Identity
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-900">{order.userName}</p>
                  <p className="text-xs text-slate-500">{order.shippingAddress.street}</p>
                  <p className="text-xs text-slate-500">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{order.shippingAddress.country}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {order.userId}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <ShoppingBag size={12} /> Comparison Manifest
              </h4>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0">
                    <img src={item.images[0]} alt={item.name} className="w-12 h-16 object-cover rounded-sm" />
                    <div className="flex-grow">
                      <p className="text-xs font-serif italic text-slate-900">{item.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                        {item.selectedSize} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Valuation</span>
                <span className="text-lg font-serif italic text-slate-900">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Actions & Timeline */}
        <div className="md:w-1/3 bg-slate-50 p-8 flex flex-col justify-between">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>

          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Activity size={12} /> Fulfillment Lifecycle
            </h4>

            <div className="relative pl-4 space-y-8 border-l border-slate-200 ml-2">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${idx === order.timeline.length - 1 ? 'bg-gold border-gold' : 'bg-white border-slate-300'
                    }`} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">{event.status}</p>
                  <p className="text-[9px] text-slate-400">{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {event.note && <p className="text-[9px] italic text-slate-500 mt-1">"{event.note}"</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Administrative Actions</h4>

            {/* Dynamic Actions based on Status */}
            {order.status === 'Pending' && (
              <button
                onClick={() => handleStatusUpdate('Confirmed')}
                disabled={processing}
                className="w-full bg-slate-900 text-white py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all"
              >
                Confirm Order
              </button>
            )}

            {order.status === 'Confirmed' && (
              <button
                onClick={() => handleStatusUpdate('Packed')}
                disabled={processing}
                className="w-full bg-slate-900 text-white py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all"
              >
                Mark as Packed
              </button>
            )}

            {order.status === 'Packed' && (
              <div className="space-y-3 bg-white p-4 rounded-sm border border-slate-200">
                <input
                  type="text"
                  placeholder="Courier Name (e.g. BlueDart)"
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  className="w-full text-xs p-2 border-b border-slate-200 outline-none"
                />
                <input
                  type="text"
                  placeholder="Tracking ID"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  className="w-full text-xs p-2 border-b border-slate-200 outline-none"
                />
                <button
                  onClick={() => handleStatusUpdate('Shipped')}
                  disabled={!trackingId || !courierName || processing}
                  className="w-full bg-slate-900 text-white py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50"
                >
                  Ship Order
                </button>
              </div>
            )}

            {order.status === 'Shipped' && (
              <button
                onClick={() => handleStatusUpdate('Delivered')}
                disabled={processing}
                className="w-full bg-emerald-600 text-white py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all"
              >
                Mark as Delivered
              </button>
            )}

            {!['Delivered', 'Cancelled', 'Returned'].includes(order.status) && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order?')) handleStatusUpdate('Cancelled');
                }}
                className="w-full border border-rose-200 text-rose-500 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-all"
              >
                Cancel Order
              </button>
            )}

            {order.status === 'Return Requested' && (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleStatusUpdate('Returned')} className="bg-slate-900 text-white py-2 text-[9px] font-bold uppercase tracking-widest">Approve Return</button>
                <button className="border border-slate-200 text-slate-500 py-2 text-[9px] font-bold uppercase tracking-widest">Reject</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { products, setProducts, user, showToast, authLoading, campaigns, setCampaigns } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [bespokeRequests, setBespokeRequests] = useState<BespokeRequest[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    const loadAdminData = async () => {
      try {
        const [logs, orders, users, fetchedCoupons, fetchedCampaigns, requests] = await Promise.all([
          firestoreService.fetchAuditLogs(),
          firestoreService.fetchAllOrders(),
          firestoreService.fetchAllUsers(),
          firestoreService.fetchCoupons(),
          firestoreService.fetchCampaigns(),
          firestoreService.fetchAllBespokeRequests()
        ]);
        setAuditLogs(logs);
        setAllOrders(orders);
        setAllUsers(users);
        setCoupons(fetchedCoupons);
        setCampaigns(fetchedCampaigns);
        setBespokeRequests(requests);
      } catch (err) {
        console.error("Critical: Admin data fetch failed. Check Firestore indexes.", err);
        showToast("Archive connectivity issue identified", "info");
      }
    };
    loadAdminData();
  }, [user, navigate]);

  const logAction = async (event: string, metadata?: any) => {
    if (user) {
      await firestoreService.addAuditLog({
        event,
        user: user.name,
        userId: user.id,
        metadata
      });
      const updatedLogs = await firestoreService.fetchAuditLogs();
      setAuditLogs(updatedLogs);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the archive?`)) return;
    try {
      await firestoreService.deleteProduct(id);
      await logAction('Product Deleted', { productId: id, productName: name });
      const updated = await firestoreService.fetchProducts();
      setProducts(updated);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const updateQuickField = async (id: string, field: 'price' | 'stock', value: number) => {
    try {
      await firestoreService.updateProduct(id, { [field]: value });
      const updated = await firestoreService.fetchProducts();
      setProducts(updated);
      showToast(`Archive updated: ${field}`, 'info');
    } catch (err) {
      console.error("Quick edit failed:", err);
    }
  };

  const ProductForm = ({ initialData, onCancel }: { initialData?: Product | null, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>(initialData || {
      name: '', description: '', price: 0, originalPrice: 0,
      category: 'Women', subCategory: '', images: [''], sizes: ['S', 'M', 'L'],
      stock: 10, isOffer: false, ratings: 5, numReviews: 0, reviews: [],
      isCustomizable: false
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        // Strict payload construction
        const cleanData = {
          name: formData.name || '',
          description: formData.description || '',
          price: Number(formData.price) || 0,
          originalPrice: Number(formData.originalPrice) || 0,
          category: formData.category || 'Women',
          subCategory: formData.subCategory || '',
          images: (formData.images || []).filter((u: any) => typeof u === 'string' && u.trim() !== ''),
          sizes: formData.sizes || ['S', 'M', 'L', 'XL'],
          stock: Number(formData.stock) || 0,
          isOffer: Boolean(formData.isOffer),
          isCustomizable: Boolean(formData.isCustomizable),
        };

        // DIAGNOSTIC LOGGING
        console.log("Form Submission State:", {
          initialDataId: initialData?.id,
          isLegacyCheck: ['1', '2', '3'].includes(initialData?.id || ''),
          formDataName: formData.name
        });

        // Check if this is a real Firestore document or a legacy demo item
        const isLegacyId = initialData?.id && ['1', '2', '3'].includes(initialData.id);
        const hasValidId = initialData?.id && !isLegacyId;

        if (hasValidId) {
          console.log("DECISION: UPDATE existing product", initialData.id);
          try {
            await firestoreService.updateProduct(initialData.id, cleanData);
            console.log("Update success.");
            await logAction('Product Updated', { productId: initialData.id, productName: cleanData.name });
            showToast(`Masterpiece entry refined: ${cleanData.name}`);
          } catch (updateErr) {
            console.error("Update failed:", updateErr);
            throw updateErr;
          }
        } else {
          console.log("DECISION: CREATE new product (Reason: No ID or Legacy ID)");
          // Create new product if it's new OR if it was a legacy demo item
          const newProductPayload = {
            ...cleanData,
            ratings: initialData?.ratings || 5, // Preserve ratings if converting legacy
            numReviews: initialData?.numReviews || 0,
            reviews: initialData?.reviews || [],
            // createdAt is handled by firestoreService
          };

          await firestoreService.addProduct(newProductPayload as any);
          console.log("Create success.");
          await logAction('Product Added', { productName: cleanData.name });
          showToast(isLegacyId ? `Demo masterpiece archived permanently: ${cleanData.name}` : `New masterpiece archived: ${cleanData.name}`);
        }

        console.log("Fetching updated products list...");
        const updated = await firestoreService.fetchProducts();
        console.log("Fetched products count:", updated.length);
        setProducts(updated);
        onCancel();
        return;

      } catch (err: any) {
        console.error("CRITICAL ARCHIVAL ERROR:", err);
        const code = err.code || 'unknown';
        const msg = err.message || 'Check console for details';
        showToast(`Error (${code}): ${msg}`, "info");
        // Also alert for visibility if toast misses
        if (msg.includes("permission")) alert("Permission Error: Please check if you are logged in as Admin.");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-sm shadow-2xl animate-fadeIn">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h3 className="text-xl font-serif italic text-slate-800">{initialData ? 'Refine Masterpiece' : 'Archive New Entry'}</h3>
            <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 text-sm grid grid-cols-2 gap-x-8">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Piece Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 p-4 outline-none border-b border-transparent focus:border-gold transition-all" required />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Archival Story</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 p-4 outline-none border-b border-transparent focus:border-gold h-20 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Valuation (Price)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-slate-50 p-4 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Original MSRP</label>
              <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })} className="w-full bg-slate-50 p-4 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full bg-slate-50 p-4 outline-none">
                <option value="Women">Women</option>
                <option value="Girls">Girls</option>
                <option value="Children">Children</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Count</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-slate-50 p-4 outline-none" required />
            </div>
            <div className="col-span-2 flex items-center gap-4 py-2 border-y border-slate-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCustomizable}
                  onChange={e => setFormData({ ...formData, isCustomizable: e.target.checked })}
                  className="accent-gold h-4 w-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Bespoke Customization Enabled</span>
              </label>
            </div>
            <div className="col-span-2 space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Archive Image Perspectives (URLs)</label>
              {(formData.images || ['']).map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={e => {
                      const newImages = [...(formData.images || [''])];
                      newImages[index] = e.target.value;
                      setFormData({ ...formData, images: newImages });
                    }}
                    className="flex-grow bg-slate-50 p-4 outline-none border-b border-transparent focus:border-gold transition-all placeholder:text-slate-300 text-[11px]"
                    placeholder="https://images.unsplash.com/..."
                    required={index === 0}
                  />
                  {(formData.images?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.images?.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="px-4 text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, images: [...(formData.images || []), ''] })}
                className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-slate-900 transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Add Perspective
              </button>
            </div>
            <div className="col-span-2 pt-6 flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 bg-slate-900 text-white py-5 font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl flex items-center justify-center gap-3 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold'}`}
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Executing Archival...
                  </>
                ) : 'Commit to Registry'}
              </button>
              <button type="button" onClick={onCancel} className="flex-1 border border-slate-100 py-5 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all text-slate-400">Discard Entry</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const GlobalSettingsForm = () => {
    const { paymentSettings, showToast, user } = useApp();
    const [settings, setSettings] = useState<PaymentSettings>(paymentSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      setSettings(paymentSettings);
    }, [paymentSettings]);

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        await firestoreService.savePaymentSettings(settings);
        await logAction('Global Settings Updated', { ...settings });
        showToast('Financial Protocols Updated Successfully');
      } catch (err) {
        console.error("Settings save failed:", err);
        showToast('Failed to update protocols', 'info');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold border-b border-gold/10 pb-2">Logistics Charges</h4>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Standard Shipping Fee</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-[10px] font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={settings.shippingCharge}
                  onChange={(e) => setSettings({ ...settings, shippingCharge: Number(e.target.value) })}
                  className="w-full bg-slate-50 pl-8 pr-4 py-3 outline-none border-b border-transparent focus:border-gold transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Free Shipping Threshold</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-[10px] font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full bg-slate-50 pl-8 pr-4 py-3 outline-none border-b border-transparent focus:border-gold transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold border-b border-gold/10 pb-2">Payment Gateways</h4>
            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.codEnabled}
                  onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                  className="accent-gold h-4 w-4"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Enable Cash on Delivery (COD)</span>
              </label>

              {settings.codEnabled && (
                <div className="space-y-2 pl-7 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">COD Handling Fee</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[10px] font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={settings.codFee}
                      onChange={(e) => setSettings({ ...settings, codFee: Number(e.target.value) })}
                      className="w-full bg-slate-50 pl-8 pr-4 py-3 outline-none border-b border-transparent focus:border-gold transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pre-Paid Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.prepaidDiscount}
                    onChange={(e) => setSettings({ ...settings, prepaidDiscount: Number(e.target.value) })}
                    className="w-full bg-slate-50 p-3 outline-none border-b border-transparent focus:border-gold transition-all"
                  />
                  <span className="absolute right-4 top-3 text-[10px] font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-slate-900 text-white py-4 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl"
        >
          {isSaving ? 'Updating Registry...' : 'Save Configuration'}
        </button>
      </form>
    );
  };

  const statCards = [
    { label: 'Total Revenue', value: `₹${allOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Client Base', value: allUsers.length, icon: UserIcon, color: 'text-blue-500' },
    { label: 'Stock Valuation', value: `₹${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}`, icon: Package, color: 'text-gold' },
    { label: 'Pending Orders', value: allOrders.filter(o => o.status === 'Processing').length, icon: ShoppingBag, color: 'text-rose-500' },
  ];

  const filteredProducts = products.filter(p => filterCategory === 'All' || p.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row pt-16 mt-4">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-100 p-8 flex flex-col h-[calc(100vh-80px)] sticky top-20">
        <div className="mb-12">
          <h2 className="text-xl font-serif italic text-slate-900">Admin Console</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gold mt-1">Marketplace Suite</p>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'dashboard', name: 'Overview', icon: LayoutDashboard },
            { id: 'inventory', name: 'Inventory Registry', icon: Package },
            { id: 'analytics', name: 'Market Intelligence', icon: BarChart3 },
            { id: 'orders', name: 'Acquisition Logs', icon: ClipboardList },
            { id: 'bespoke', name: 'Bespoke Registry', icon: Scissors },
            { id: 'coupons', name: 'Prestige Coupons', icon: Ticket },
            { id: 'campaigns', name: 'Festival Campaigns', icon: Sparkles },
            { id: 'settings', name: 'Global Settings', icon: Settings },
            { id: 'logs', name: 'Audit Trails', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-100">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all">
            <ArrowRight className="rotate-180" size={16} /> Exit Command
          </button>
        </div>
      </aside>

      {/* Main Command Area */}
      <main className="flex-grow p-6 lg:p-12 text-left">
        {activeTab === 'dashboard' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-8 border border-slate-100 rounded-sm shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 bg-slate-50 rounded-sm ${stat.color}`}><stat.icon size={20} /></div>
                    <TrendingUp size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <h4 className="text-2xl font-serif italic text-slate-900 mt-1">{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 border border-slate-100 rounded-sm shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                  <History size={16} className="text-gold" /> Recent Audit Entries
                </h3>
                <div className="space-y-6">
                  {auditLogs.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0 hover:translate-x-1 transition-transform">
                      <div className="w-1 bg-gold/20 rounded-full h-10"></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">{log.event}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1"><UserIcon size={10} /> {log.user}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1"><Clock size={10} /> {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'Now'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 border border-slate-100 rounded-sm shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                  <Package size={16} className="text-gold" /> High Inventory Exposure
                </h3>
                <div className="space-y-4">
                  {products.sort((a, b) => b.stock - a.stock).slice(0, 4).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-sm">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} className="w-10 h-12 object-cover rounded-sm" />
                        <span className="text-xs font-serif italic">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-900">{p.stock} Units</p>
                        <p className="text-[8px] text-slate-400 uppercase font-bold">In Archive</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Registry Management</h2>
                <div className="flex gap-4 mt-4">
                  {['All', 'Women', 'Girls', 'Children'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all ${filterCategory === cat ? 'bg-gold text-white border-gold' : 'border-slate-100 text-slate-400 hover:border-gold/30'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all shadow-xl active:scale-95"
              >
                <Plus size={16} /> Archive New Piece
              </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 border-b bg-slate-50/50">
                    <th className="p-6">Masterpiece Entry</th>
                    <th className="p-6">Valuation (Quick Edit)</th>
                    <th className="p-6">Stock Status</th>
                    <th className="p-6 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="text-xs group hover:bg-slate-50 transition-all">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={p.images[0]} className="w-12 h-16 object-cover rounded-sm shadow-sm group-hover:scale-105 transition-all" />
                          <div>
                            <p className="font-serif italic text-lg text-slate-900">{p.name}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">{p.category} | {p.subCategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 border-b border-transparent focus-within:border-gold transition-all group-hover:bg-white px-2 py-1 rounded-sm w-32">
                          <span className="text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            defaultValue={p.price}
                            onBlur={(e) => updateQuickField(p.id, 'price', Number(e.target.value))}
                            className="w-full bg-transparent outline-none font-bold text-slate-900"
                          />
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 border-b border-transparent focus-within:border-gold transition-all group-hover:bg-white px-2 py-1 rounded-sm w-24">
                          <input
                            type="number"
                            defaultValue={p.stock}
                            onBlur={(e) => updateQuickField(p.id, 'stock', Number(e.target.value))}
                            className="w-full bg-transparent outline-none font-medium text-slate-600 font-mono"
                          />
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setIsEditing(p)} className="p-2 text-slate-200 hover:text-gold hover:bg-white rounded-full transition-all" title="Detailed Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-slate-200 hover:text-rose-500 hover:bg-white rounded-full transition-all" title="Delete Archive"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="mb-10">
              <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Registry Audit Trails</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Verified System Activity</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 border-b bg-slate-50/50">
                    <th className="p-6">Archival Timestamp</th>
                    <th className="p-6">Initiator</th>
                    <th className="p-6">Archival Action</th>
                    <th className="p-6">Metadata Registry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {auditLogs.map((log, i) => (
                    <tr key={i} className="text-[11px] hover:bg-slate-50 transition-colors">
                      <td className="p-6 text-slate-400 font-mono">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Processing...'}
                      </td>
                      <td className="p-6 font-bold uppercase tracking-widest text-slate-600">{log.user}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${log.event.includes('Product') ? 'bg-gold/10 text-gold' : 'bg-slate-100 text-slate-500'}`}>
                          {log.event}
                        </span>
                      </td>
                      <td className="p-6 text-slate-400 italic">
                        {log.metadata ? JSON.stringify(log.metadata) : 'N/A Registry'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="mb-10">
              <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Acquisition Logs</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Client Fulfillment Registry</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 border-b bg-slate-50/50">
                    <th className="p-6">Order Identity</th>
                    <th className="p-6">Client</th>
                    <th className="p-6">Valuation</th>
                    <th className="p-6">Fulfillment Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allOrders.map((order) => (
                    <tr key={order.id} className="text-[11px] group hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-slate-900">ORD-{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-[8px] text-slate-400 font-mono mt-1">{order.date}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-medium text-slate-800">{order.userName}</p>
                        <p className="text-[9px] text-slate-400 italic">{order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.country}` : 'Processing...'}</p>
                      </td>
                      <td className="p-6 font-bold text-slate-900 tracking-tight">₹{order.total.toLocaleString()}</td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-sm text-[8px] font-bold uppercase tracking-widest border ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === 'Shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all rounded-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bespoke' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Bespoke Consultations</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">{bespokeRequests.length} Artisanal Requests Found</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {bespokeRequests.map(req => (
                <div key={req.id} className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${req.status === 'Pending' ? 'bg-gold/10 text-gold shadow-sm' :
                          req.status === 'Consulted' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                          {req.status}
                        </span>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Received {new Date(req.createdAt?.toDate ? req.createdAt.toDate() : Date.now()).toLocaleDateString()}</p>
                      </div>

                      <div>
                        <h4 className="text-xl font-serif italic text-slate-900">{req.userName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{req.userEmail}</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-sm inline-block">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gold mb-2">Subject Masterpiece</p>
                        <p className="text-xs font-serif italic text-slate-700">{req.productName} <span className="text-slate-400 opacity-60">#{req.productId.slice(-6).toUpperCase()}</span></p>
                      </div>
                    </div>

                    <div className="lg:w-1/3 grid grid-cols-2 gap-4">
                      {Object.entries(req.measurements).map(([key, val]) => (
                        (val as number) > 0 && (
                          <div key={key} className="bg-slate-50 p-3 rounded-sm border border-slate-100/50">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{key}</p>
                            <p className="text-xs font-bold text-slate-900">{val}<span className="text-[8px] ml-1 opacity-40">{req.unit}</span></p>
                          </div>
                        )
                      ))}
                    </div>

                    <div className="lg:w-1/4 flex flex-col justify-between items-end border-l border-slate-50 pl-8">
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 underline decoration-gold/30">Admin Response</p>
                        <select
                          value={req.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as any;
                            await firestoreService.updateBespokeRequest(req.id, { status: newStatus });
                            setBespokeRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
                            showToast("Consultation status upgraded");
                          }}
                          className="bg-slate-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none rounded-sm cursor-pointer hover:bg-gold transition-colors"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Consulted">Consulted</option>
                          <option value="Fulfilled">Fulfilled</option>
                        </select>
                      </div>
                      <button
                        onClick={() => window.location.href = `mailto:${req.userEmail}?subject=Bespoke Consultation: ${req.productName}`}
                        className="text-[9px] font-bold uppercase tracking-widest text-gold border-b border-gold/20 hover:text-slate-900 hover:border-slate-900 transition-all font-serif italic"
                      >
                        Direct Artisanal Contact
                      </button>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="mt-8 pt-6 border-t border-slate-50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Client Directives</p>
                      <p className="text-xs font-serif italic text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-sm border-l-2 border-gold/20">"{req.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
              {bespokeRequests.length === 0 && (
                <div className="py-24 text-center bg-white border border-slate-100 rounded-sm">
                  <Scissors size={48} className="mx-auto text-slate-50 mb-4" />
                  <p className="font-serif italic text-slate-400">No bespoke tailoring requests currently in archive.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Prestige Coupons</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Luxury Incentives Archive</p>
              </div>
              <button
                onClick={async () => {
                  const code = prompt("Enter Coupon Code (e.g. FESTIVAL20)");
                  const val = prompt("Enter Value (e.g. 20)");
                  if (code && val) {
                    await firestoreService.addCoupon({ code, discountType: 'percentage', value: Number(val), isActive: true });
                    const updated = await firestoreService.fetchCoupons();
                    setCoupons(updated);
                    showToast(`New coupon archived: ${code}`);
                  }
                }}
                className="bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all shadow-xl"
              >
                <Plus size={16} /> New Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white p-6 border border-slate-100 rounded-sm shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-sm text-gold group-hover:bg-gold group-hover:text-white transition-all">
                      <Ticket size={24} />
                    </div>
                    <button
                      onClick={async () => {
                        await firestoreService.deleteCoupon(coupon.id);
                        const updated = await firestoreService.fetchCoupons();
                        setCoupons(updated);
                        showToast(`Coupon removed: ${coupon.code}`, 'info');
                      }}
                      className="text-slate-200 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xl font-serif italic text-slate-900">{coupon.code}</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                      {coupon.discountType === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${coupon.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {coupon.isActive ? 'Active Registry' : 'Inactive'}
                    </span>
                    <button
                      onClick={async () => {
                        await firestoreService.updateCoupon(coupon.id, { isActive: !coupon.isActive });
                        const updated = await firestoreService.fetchCoupons();
                        setCoupons(updated);
                        showToast(`${coupon.code} status toggled`);
                      }}
                      className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-slate-900 transition-all"
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="mb-10">
              <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Market Intelligence</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Global Analytics & Trends</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 border border-slate-100 rounded-sm shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-8">Revenue Distribution</h3>
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                  {[45, 78, 56, 92, 67, 88, 74].map((h, i) => (
                    <div key={i} className="flex-grow group relative">
                      <div
                        style={{ height: `${h}%` }}
                        className="bg-slate-100 group-hover:bg-gold transition-all rounded-t-sm"
                      ></div>
                      <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400">D{i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 border border-slate-100 rounded-sm shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-8">Top Masterpieces</h3>
                <div className="space-y-6">
                  {products.sort((a, b) => b.ratings - a.ratings).slice(0, 4).map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="text-xl font-serif italic text-gold/30">0{i + 1}</div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">{p.name}</p>
                        <div className="w-full bg-slate-50 h-1 mt-2 rounded-full overflow-hidden">
                          <div style={{ width: `${80 - (i * 15)}%` }} className="bg-gold h-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Festival Campaigns</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Global Boutique Banners</p>
              </div>
              <button
                onClick={async () => {
                  const title = prompt("Campaign Title (e.g. Grand Festival Sale)");
                  const text = prompt("Banner Text (e.g. Enjoy up to 40% off on all archives)");
                  if (title && text) {
                    await firestoreService.addCampaign({ title, subtitle: '', bannerText: text, active: false });
                    const updated = await firestoreService.fetchCampaigns();
                    setCampaigns(updated);
                    showToast(`New campaign archived: ${title}`);
                  }
                }}
                className="bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all shadow-xl"
              >
                <Plus size={16} /> Create Campaign
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {campaigns.map((camp) => (
                <div key={camp.id} className={`p-8 border rounded-sm transition-all flex justify-between items-center ${camp.active ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-white border-slate-100 text-slate-900'}`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-sm ${camp.active ? 'bg-gold text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {camp.active ? 'Live Banner' : 'Archived'}
                      </span>
                      <h4 className="text-xl font-serif italic">{camp.title}</h4>
                    </div>
                    <p className={`text-[10px] uppercase tracking-[0.2em] ${camp.active ? 'text-white/60' : 'text-slate-400'}`}>"{camp.bannerText}"</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={async () => {
                        const updated = campaigns.map(c => ({ ...c, active: c.id === camp.id ? !c.active : false }));
                        // Update in DB (simple way)
                        for (const c of updated) {
                          await firestoreService.updateCampaign(c.id, { active: c.active });
                        }
                        setCampaigns(updated);
                        showToast(`Campaign status updated`);
                      }}
                      className={`px-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${camp.active ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gold text-white hover:bg-slate-900'}`}
                    >
                      {camp.active ? 'Deactivate' : 'Go Live'}
                    </button>
                    <button
                      onClick={async () => {
                        await firestoreService.deleteCampaign(camp.id);
                        const updated = await firestoreService.fetchCampaigns();
                        setCampaigns(updated);
                        showToast(`Campaign removed`, 'info');
                      }}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-serif italic text-slate-900 leading-tight">Global Finance Settings</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Configuration Registry</p>
              </div>
            </div>

            <div className="bg-white p-8 border border-slate-100 rounded-sm shadow-sm max-w-2xl">
              <GlobalSettingsForm />
            </div>
          </div>
        )}
      </main>

      {(isAdding || isEditing) && (
        <ProductForm
          initialData={isEditing}
          onCancel={() => { setIsAdding(false); setIsEditing(null); }}
        />
      )}

      <OrderManagementModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onUpdate={async (orderId, updates) => {
          await firestoreService.updateOrder(orderId, updates);
          const updated = await firestoreService.fetchAllOrders();
          setAllOrders(updated);
          showToast(`Order #${orderId.slice(-6)} updated`);
        }}
      />
    </div>
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
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-black px-6 md:px-10 py-3 md:py-4 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all shadow-xl">
                    Explore Archive <ArrowRight size={14} />
                  </Link>
                  <Link to="/about" className="inline-flex items-center gap-3 border border-white/20 text-white px-6 md:px-10 py-3 md:py-4 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                    Our Heritage
                  </Link>
                </div>
                <p className="text-white/40 text-[8px] uppercase tracking-[0.3em] font-medium border-t border-white/5 pt-4">Pan-India Artisanal Luxury | Est. 2024</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[40%] grid grid-cols-2 gap-3 md:gap-4 h-full">
            {products.slice(0, 4).map((p, i) => (
              <Link key={i} to={`/product/${p.id}`} className="relative group overflow-hidden aspect-[3/4] rounded-sm shadow-lg">
                <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={`${p.name} - Luxury Indian Fashion`} />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all"></div>
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-white text-[7px] font-bold uppercase tracking-widest opacity-80">{p.category} {p.subCategory}</p>
                  <h3 className="text-white text-[10px] md:text-xs font-serif italic line-clamp-1">{p.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center mb-16 space-y-3">
            <span className="text-gold text-[9px] font-bold uppercase tracking-[0.6em] animate-pulse">Premium Indian Artistry</span>
            <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900">The New Season Archive</h2>
            <p className="text-xs text-slate-400 font-serif italic max-w-md text-center">Curating the finest luxury ethnic wear for the modern Indian woman.</p>
            <div className="h-px w-24 bg-gold/30 mt-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products } = useApp();

  const [sortBy, setSortBy] = useState('latest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const query = searchParams.get('q')?.toLowerCase() || '';

  const fabrics = useMemo(() => Array.from(new Set(products.map(p => p.subCategory))), [products]);
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => !category || p.category === category);

    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.subCategory.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (selectedFabrics.length > 0) {
      result = result.filter(p => selectedFabrics.includes(p.subCategory));
    }

    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.ratings - a.ratings;
      if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [products, category, query, priceRange, selectedFabrics, selectedSizes, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-serif italic text-left">{category || (query ? `Results for "${query}"` : 'The Full Archive')}</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">{filteredProducts.length} Pieces found</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex-1 border border-slate-100 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Settings size={14} /> Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-slate-100 py-3 px-4 text-[10px] font-bold uppercase tracking-widest outline-none font-serif italic"
          >
            <option value="latest">Newest Arrivals</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="rating">Featured Archives</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-10 text-left">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold border-b border-gold/10 pb-2">Price valuation</h4>
            <div className="space-y-4 pt-2">
              <input
                type="range"
                min="0"
                max="1000000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gold"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>₹0</span>
                <span>Up to ₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold border-b border-gold/10 pb-2">Fabric Archive</h4>
            <div className="space-y-2 pt-2">
              {fabrics.map(fab => (
                <label key={fab} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFabrics.includes(fab)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedFabrics([...selectedFabrics, fab]);
                      else setSelectedFabrics(selectedFabrics.filter(f => f !== fab));
                    }}
                    className="w-3 h-3 border-slate-200 accent-gold rounded-none"
                  />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-slate-800 transition-colors">{fab}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold border-b border-gold/10 pb-2">Archival Sizing</h4>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {allSizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    if (selectedSizes.includes(size)) setSelectedSizes(selectedSizes.filter(s => s !== size));
                    else setSelectedSizes([...selectedSizes, size]);
                  }}
                  className={`py-2 text-[8px] font-bold border transition-all ${selectedSizes.includes(size)
                    ? 'bg-black text-white border-black'
                    : 'border-slate-100 text-slate-400 hover:border-gold hover:text-gold'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setPriceRange([0, 1000000]);
              setSelectedFabrics([]);
              setSelectedSizes([]);
            }}
            className="text-[8px] font-bold uppercase tracking-widest text-rose-500 border-b border-rose-200 pb-1"
          >
            Reset All Curations
          </button>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="py-40 text-center bg-slate-50/50 rounded-sm">
              <div className="mb-6"><Scissors size={48} className="mx-auto text-slate-100" /></div>
              <p className="font-serif italic text-slate-400">No archival matches found for these curators.</p>
              <button onClick={() => {
                setPriceRange([0, 1000000]);
                setSelectedFabrics([]);
                setSelectedSizes([]);
                setSearchParams({});
              }} className="text-[10px] font-bold uppercase tracking-widest text-gold mt-6 border-b border-gold/30 pb-1">Reset Full archive filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-[85%] bg-white p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-serif italic text-slate-900">Archive Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-slate-400"><X size={24} /></button>
            </div>

            <div className="space-y-12 text-left">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Valuation Range</h4>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>₹0</span>
                  <span>Up to ₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Fabrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  {fabrics.map(fab => (
                    <button
                      key={fab}
                      onClick={() => {
                        if (selectedFabrics.includes(fab)) setSelectedFabrics(selectedFabrics.filter(f => f !== fab));
                        else setSelectedFabrics([...selectedFabrics, fab]);
                      }}
                      className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all truncate ${selectedFabrics.includes(fab) ? 'bg-black text-white border-black' : 'border-slate-100 text-slate-400'
                        }`}
                    >
                      {fab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Archival Sizing</h4>
                <div className="grid grid-cols-3 gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        if (selectedSizes.includes(size)) setSelectedSizes(selectedSizes.filter(s => s !== size));
                        else setSelectedSizes([...selectedSizes, size]);
                      }}
                      className={`py-3 text-[9px] font-bold border transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-slate-100 text-slate-400'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest shadow-xl">Apply Archive</button>
              <button
                onClick={() => {
                  setPriceRange([0, 1000000]);
                  setSelectedFabrics([]);
                  setSelectedSizes([]);
                }}
                className="flex-1 border border-slate-100 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OffersPage = () => {
  const { products } = useApp();
  const offerProducts = products.filter(p => p.isOffer || p.originalPrice > p.price);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
      <div className="flex flex-col items-center mb-16 space-y-3">
        <span className="text-rose-500 text-[9px] font-bold uppercase tracking-[0.6em] animate-pulse">Exclusive Archives</span>
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-800">Seasonal Offers</h1>
        <div className="h-px w-24 bg-rose-500/30 mt-2"></div>
      </div>

      {offerProducts.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-sm">
          <Sparkles size={48} className="mx-auto text-slate-100 mb-4" />
          <p className="font-serif italic text-slate-400">The seasonal archive is currently being curated.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {offerProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

const LegalPage = ({ title, content }: { title: string, content: React.ReactNode }) => (
  <div className="max-w-4xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
    <div className="mb-12 border-b border-slate-100 pb-8">
      <span className="text-gold text-[8px] font-bold uppercase tracking-[0.4em] mb-3 block">Corporate Archive</span>
      <h1 className="text-4xl md:text-5xl font-serif italic text-slate-900">{title}</h1>
    </div>
    <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-serif italic">
      {content}
    </div>
  </div>
);

const AboutPage = () => (
  <LegalPage
    title="Anandam Atelier Heritage"
    content={
      <div className="space-y-6">
        <p>Founded on the principles of artisanal excellence and contemporary luxury, Anandam Fashion is more than just a boutique; it is a repository of Indian heritage. Every thread, every stitch, and every silhouette in our archive tells a story of craftsmanship passed through generations.</p>
        <p>Based in the heart of Jaipur, we collaborate with master artisans across India to curate collections that celebrate the grace of luxury ethnic wear while embracing the modern Indian woman's dynamic spirit.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 not-prose">
          <div className="p-8 bg-gold/5 border border-gold/10 rounded-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-4">Our Vision</h4>
            <p className="text-xs font-medium text-slate-800 tracking-wide">To become India's most trusted archive for artisanal luxury, bridging the gap between traditional craftsmanship and global fashion standards.</p>
          </div>
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Our Commitment</h4>
            <p className="text-xs font-medium text-white/70 tracking-wide">100% Authentic fabrics, fair artisan compensation, and a pan-India logistics network ensuring luxury reaches every doorstep.</p>
          </div>
        </div>
        <div className="pt-10 border-t border-slate-100">
          <h3 className="text-xl text-slate-900 font-serif italic mb-6">Corporate Transparency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <div className="space-y-1">
              <p className="text-gold">Entity Name</p>
              <p className="text-slate-600">Anandam Atelier India Private Limited</p>
            </div>
            <div className="space-y-1">
              <p className="text-gold">Registration</p>
              <p className="text-slate-600">CIN: UXXXXXXXXXXXXXXX (Ministry of Corporate Affairs)</p>
            </div>
            <div className="space-y-1">
              <p className="text-gold">Tax Identity</p>
              <p className="text-slate-600">GSTIN: XXXXXXXXXXXXXXX</p>
            </div>
          </div>
          <p className="mt-8 text-xs italic text-slate-400 font-serif">We believe in true transparency as the cornerstone of Pan-India trust. Our corporate identity reflects our commitment to ethical luxury and statutory compliance.</p>
        </div>
      </div>
    }
  />
);

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-10">
          <div>
            <span className="text-gold text-[8px] font-bold uppercase tracking-[0.4em] mb-3 block">Global Concierge</span>
            <h1 className="text-4xl md:text-5xl font-serif italic text-slate-900">Contact The Atelier</h1>
            <p className="text-slate-500 font-serif italic mt-6 max-w-md">Our curators are available to assist you with bespoke requests, order tracking, or styling guidance.</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-slate-50 rounded-full text-gold"><MapPin size={20} /></div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Atelier HQ</h4>
                <p className="text-xs text-slate-500 mt-1">123 Fashion Street, Johari Bazaar, Jaipur, Rajasthan 302001</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-slate-50 rounded-full text-gold"><Globe size={20} /></div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Inquiry</h4>
                <p className="text-xs text-slate-500 mt-1">concierge@anandame.com | +91-XXXXXXXXXX</p>
              </div>
            </div>
          </div>

          <div className="h-64 bg-slate-100 rounded-sm overflow-hidden grayscale opacity-50 border border-slate-200">
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Interactive Map Integration
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-sm shadow-sm relative overflow-hidden">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
              <CheckCircle size={48} className="text-gold" />
              <h3 className="text-2xl font-serif italic text-slate-900">Message Archived</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Our curators will respond within 24 standard hours.</p>
              <button onClick={() => setSent(false)} className="text-[10px] text-gold font-bold uppercase tracking-widest border-b border-gold/30 pb-1 mt-6">Send another inquiry</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Identity</label>
                    <input type="text" required placeholder="Full Name" className="w-full border-b border-slate-100 py-3 outline-none focus:border-gold text-xs font-medium transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input type="email" required placeholder="name@example.com" className="w-full border-b border-slate-100 py-3 outline-none focus:border-gold text-xs font-medium transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Inquiry Type</label>
                  <select className="w-full border-b border-slate-100 py-3 outline-none focus:border-gold text-xs font-medium transition-all bg-transparent">
                    <option>General Concierge</option>
                    <option>Bespoke Customization</option>
                    <option>Order Inquiries</option>
                    <option>Partnership Proposals</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Message</label>
                  <textarea rows={4} required placeholder="How may we assist you?" className="w-full border-b border-slate-100 py-3 outline-none focus:border-gold text-xs font-medium transition-all resize-none"></textarea>
                </div>
              </div>
              <button className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl">Transmit Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy & Data Protection"
    content={
      <div className="space-y-6">
        <p>At Anandam Atelier, your privacy is paramount. This policy outlines how we collect, protect, and handle your personal data when you interact with our archive.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Data Acquisition</h3>
        <p>We collect essential information to facilitate your luxury acquisitions, including contact details, delivery coordinates, and browsing preferences. All data is handled with artisanal care and digital precision.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">AdSense & Cookies</h3>
        <p>We may use cookies to enhance your curated experience and participate in programs like Google AdSense to sustain our artisanal archive. You may manage cookie preferences through your global browser settings.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Legal Compliance</h3>
        <p>Your data is never traded with third-party conglomerates. It is used strictly for fulfillment, personalization, and legal artisanal requirements within the framework of Indian Data Protection laws.</p>
      </div>
    }
  />
);

const TermsPage = () => (
  <LegalPage
    title="Terms of Engagement"
    content={
      <div className="space-y-6">
        <p>By interacting with Anandam Fashion, you agree to these artisanal terms of engagement. Our archive is designed for personal, premium use across Pan-India.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Archive Usage</h3>
        <p>All content within this atelier—including text, graphics, and product silhouettes—is the intellectual property of Anandam Fashion. Unauthorized replication is strictly prohibited.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Pricing & Acquisitions</h3>
        <p>While we strive for artisanal precision, we reserve the right to correct any valuation errors. Order finalization constitutes a binding artisanal agreement.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Jurisdiction</h3>
        <p>Any disputes arising from your engagement with the atelier shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan, India.</p>
      </div>
    }
  />
);

const RefundPolicy = () => (
  <LegalPage
    title="Returns & Bespoke Policy"
    content={
      <div className="space-y-6">
        <p>Our commitment to excellence means we stand by every artisanal piece we archive. If your acquisition does not meet our rigorous standards, we offer a dedicated return process.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Standard Returns</h3>
        <p>Unworn, unaltered pieces with original artisanal tags may be returned within 14 standard days of delivery. Refunds are processed to the original payment method upon technical verification.</p>
        <h3 className="text-xl text-slate-900 border-l-2 border-gold pl-4 mt-10">Bespoke Pieces</h3>
        <p>Custom-measured or personalized artisanal pieces are crafted exclusively for your silhouette and are therefore ineligible for standard returns, unless a technical artisanal defect is identified.</p>
        <p className="pt-10 text-[10px] text-slate-400">For more details, contact our Global Concierge at concierge@anandame.com.</p>
      </div>
    }
  />
);

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, toggleWishlist, wishlist, addToRecentlyViewed, showToast, user, addReview } = useApp();
  const product = products.find(p => p.id === id);
  const [size, setSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isBespokeOpen, setIsBespokeOpen] = useState(false);
  const [bespokeUnit, setBespokeUnit] = useState<'Inches' | 'CM'>('Inches');
  const [showGuide, setShowGuide] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) addToRecentlyViewed(id);
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <div className="p-40 text-center font-serif italic text-slate-400">Archive entry not found.</div>;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product.images[activeImage]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
        {/* Image Collection */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 md:gap-6">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 md:w-20 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-16 h-20 md:w-auto md:h-24 overflow-hidden rounded-sm border transition-all ${activeImage === idx ? 'border-gold p-0.5' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${idx + 1}`} />
              </button>
            ))}
          </div>

          {/* Main Image with Zoom */}
          <div
            ref={containerRef}
            className="flex-grow aspect-[3/4] overflow-hidden rounded-sm shadow-2xl bg-slate-50 relative cursor-crosshair group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomStyle({ display: 'none' })}
          >
            <img
              src={product.images[activeImage]}
              className="w-full h-full object-cover transition-opacity duration-500"
              alt={product.name}
            />
            {/* Zoom Overlay (Desktop) */}
            <div
              className="absolute inset-0 pointer-events-none hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={zoomStyle}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 text-left space-y-8 md:space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{product.subCategory}</span>
              {product.numReviews > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Sparkles key={i} size={8} className={i < Math.floor(product.ratings) ? 'text-gold' : 'text-slate-200'} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">({product.numReviews} Client Testimonials)</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 leading-tight">{product.name}</h1>
            <p className="text-xs text-slate-500 font-serif italic leading-relaxed max-w-lg">{product.description}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
              {(product.originalPrice > product.price) && (
                <span className="text-sm text-slate-400 line-through italic">MSRP ₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {(product.originalPrice > product.price) && (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <span>Seasonal Saving: ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                <span className="bg-rose-100 px-2 py-1 rounded-sm">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Dimensions</p>
                <button className="text-[8px] font-bold uppercase tracking-widest text-gold border-b border-gold/30 pb-0.5">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-10 h-10 md:w-12 md:h-12 border flex items-center justify-center font-bold text-[10px] tracking-tighter transition-all ${size === s ? 'bg-black text-white border-black shadow-lg scale-105' : 'border-slate-100 text-slate-400 hover:border-gold hover:text-gold'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={() => size && addToCart(product, size)}
                className={`group relative overflow-hidden bg-black text-white py-4 md:py-6 text-[10px] font-bold uppercase tracking-[0.4em] transition-all shadow-xl ${!size ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gold active:scale-95'
                  }`}
              >
                <span className="relative z-10">{size ? 'Acquire for Archive' : 'Select Dimension'}</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`border py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${wishlist.includes(product.id) ? 'bg-rose-50 text-rose-500 border-rose-100' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                >
                  <Heart size={14} fill={wishlist.includes(product.id) ? '#f43f5e' : 'none'} />
                  {wishlist.includes(product.id) ? 'Archived' : 'Wishlist entry'}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out this ${product.name} from Anandam Fashion`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Archive link copied to clipboard');
                    }
                  }}
                  className="border border-slate-100 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Share2 size={14} /> Curate link
                </button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-full text-gold"><Truck size={16} /></div>
                <div className="text-left">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Complimentary</p>
                  <p className="text-[8px] text-slate-400 uppercase font-medium">Global Logistics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-full text-gold"><ShieldCheck size={16} /></div>
                <div className="text-left">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Authentic</p>
                  <p className="text-[8px] text-slate-400 uppercase font-medium">Archive Quality</p>
                </div>
              </div>
            </div>

            {product.isCustomizable && (
              <button
                onClick={() => setIsBespokeOpen(true)}
                className="w-full mt-6 py-4 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-gold hover:text-white transition-all rounded-sm"
              >
                <Scissors size={14} /> Bespoke Personalization
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-32 space-y-20">
        {/* Reviews Section */}
        <div className="border-t border-slate-100 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif italic text-slate-900 leading-tight">Client Testimonials</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Voices from the Archive</p>
            </div>
            <button
              onClick={() => setIsReviewOpen(true)}
              className="bg-slate-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl"
            >
              Write Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, idx) => (
                <div key={idx} className="bg-white p-8 border border-slate-50 rounded-sm shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">{review.userName}</p>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                  <p className="text-xs text-slate-500 italic font-serif leading-relaxed line-clamp-3">"{review.comment}"</p>
                  <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest">{review.date}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 font-serif italic">This masterpiece has no archived testimonials yet.</p>
              </div>
            )}
          </div>
        </div>

        <RecentlyViewed />
      </div>

      {/* Bespoke Modal */}
      {isBespokeOpen && (
        <div className="fixed inset-0 bg-black/80 z-[600] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-10 rounded-sm shadow-2xl animate-fadeIn relative scrollbar-hide">
            <button onClick={() => setIsBespokeOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400">
              <X size={20} />
            </button>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif italic text-slate-800">Bespoke Customization</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gold mt-2">Personalized Artisanal Excellence</p>
            </div>

            <form className="space-y-8" onSubmit={async (e) => {
              e.preventDefault();
              if (!user) { showToast("Authentication required for bespoke consultation", "info"); return; }

              const formData = new FormData(e.target as HTMLFormElement);
              const bespokeData = {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                productId: product.id,
                productName: product.name,
                measurements: {
                  bust: Number(formData.get('bust')) || 0,
                  waist: Number(formData.get('waist')) || 0,
                  hips: Number(formData.get('hips')) || 0,
                  length: Number(formData.get('length')) || 0,
                  shoulder: Number(formData.get('shoulder')) || 0,
                  sleeve: Number(formData.get('sleeve')) || 0,
                },
                unit: bespokeUnit,
                notes: ((e.target as any).querySelector('textarea') as HTMLTextAreaElement).value,
                status: 'Pending' as const
              };

              await firestoreService.addBespokeRequest(bespokeData);
              showToast("Bespoke request sent to archive curator concierge");
              setIsBespokeOpen(false);
            }}>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <Ruler size={16} className="text-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Preferred Dimension Unit</span>
                </div>
                <div className="flex bg-white rounded-sm border border-slate-200 p-0.5 shadow-sm">
                  {['Inches', 'CM'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setBespokeUnit(u as any)}
                      className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all rounded-sm ${bespokeUnit === u ? 'bg-gold text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Bust / Chest', name: 'bust', icon: <ChevronRight size={10} /> },
                  { label: 'Waist', name: 'waist', icon: <ChevronRight size={10} /> },
                  { label: 'Hips', name: 'hips', icon: <ChevronRight size={10} /> },
                  { label: 'Length', name: 'length', icon: <ChevronRight size={10} /> },
                  { label: 'Shoulder', name: 'shoulder', icon: <ChevronRight size={10} /> },
                  { label: 'Sleeve', name: 'sleeve', icon: <ChevronRight size={10} /> }
                ].map((field) => (
                  <div key={field.name} className="space-y-2 group">
                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-gold transition-colors flex items-center gap-1">
                      {field.icon} {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        className="w-full bg-slate-50 border-b-2 border-slate-100 p-3 text-xs font-bold outline-none focus:border-gold transition-all placeholder:text-slate-200"
                        name={field.name}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] font-bold text-slate-300 uppercase">{bespokeUnit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-[9px] font-bold uppercase tracking-widest text-gold flex items-center gap-2 hover:opacity-80 transition-all border-b border-gold/20 pb-1"
                >
                  <Info size={12} /> How to measure correctly?
                </button>

                {showGuide && (
                  <div className="bg-gold/5 border border-gold/10 p-5 rounded-sm animate-fadeIn space-y-3">
                    <p className="text-[9px] leading-relaxed text-slate-600 font-serif italic">
                      "To ensure a perfect fit for your archival garment, please measure while wearing thin clothing. Keep the tape firm but not tight."
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      <li className="flex items-center gap-2 text-slate-500"><div className="w-1 h-1 bg-gold rounded-full" /> Bust: Around fullest part of chest</li>
                      <li className="flex items-center gap-2 text-slate-500"><div className="w-1 h-1 bg-gold rounded-full" /> Waist: Narrowest part of trunk</li>
                      <li className="flex items-center gap-2 text-slate-500"><div className="w-1 h-1 bg-gold rounded-full" /> Hips: Widest part of hips</li>
                      <li className="flex items-center gap-2 text-slate-500"><div className="w-1 h-1 bg-gold rounded-full" /> Length: From shoulder to desired end</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Additional Artisanal Notes</label>
                <textarea
                  className="w-full bg-slate-50 p-4 min-h-[80px] outline-none border-b border-transparent focus:border-gold transition-all text-xs font-serif italic placeholder:text-slate-300"
                  placeholder="Mention color preferences, specific alterations, or urgency..."
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl group flex items-center justify-center gap-3">
                  <span>Finalize Bespoke Consultation</span>
                  <div className="w-4 h-[1px] bg-white group-hover:w-8 transition-all" />
                </button>
                <p className="text-[7px] text-center text-slate-400 mt-4 uppercase tracking-[0.2em] font-medium">An artisanal consultant will reach out within 24 standard earth hours.</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-black/80 z-[600] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-sm shadow-2xl animate-fadeIn relative">
            <button onClick={() => setIsReviewOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400">
              <X size={20} />
            </button>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-serif italic text-slate-800">Write Testimonial</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gold mt-2">Archive Client Feedback</p>
            </div>
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              if (!user) { showToast("Authentication required for testimonials", "info"); return; }
              const comment = (e.target as any).comment.value;
              const rating = Number((e.target as any).rating.value);

              await addReview(product.id, {
                id: Math.random().toString(36).substr(2, 9),
                productId: product.id,
                userName: user.name,
                rating,
                comment,
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              });

              setIsReviewOpen(false);
              showToast("Testimonial archived successfully");
            }}>
              <div className="flex justify-center mb-6">
                <select name="rating" className="bg-slate-50 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none border border-slate-100">
                  <option value="5">5 Stars - Immaculate</option>
                  <option value="4">4 Stars - Excellent</option>
                  <option value="3">3 Stars - Standard</option>
                  <option value="2">2 Stars - Improvement Needed</option>
                  <option value="1">1 Star - Not Artisanal</option>
                </select>
              </div>
              <div className="space-y-2">
                <textarea name="comment" className="w-full bg-slate-50 p-4 min-h-[100px] outline-none border-b border-transparent focus:border-gold transition-all text-xs font-serif italic" placeholder="Describe your artisanal experience..." required />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all shadow-xl">
                Archival Submission
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Provider ---

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    codEnabled: true,
    prepaidDiscount: 5,
    shippingCharge: 0,
    freeShippingThreshold: 5000,
    codFee: 150
  });

  const bgCurrency = (amount: number) => {
    if (currency === 'USD') return `$${(amount / 86).toFixed(2)}`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Initialize Data
  useEffect(() => {
    // Load Wishlist from localStorage
    const savedWishlist = localStorage.getItem('anandam_wishlist');
    const savedRecent = localStorage.getItem('anandam_recent');
    const savedCart = localStorage.getItem('anandam_cart');
    const savedCurrency = localStorage.getItem('anandam_currency');

    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { }
    }
    if (savedRecent) {
      try { setRecentlyViewed(JSON.parse(savedRecent)); } catch (e) { }
    }
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { }
    }
    if (savedCurrency) {
      setCurrency(savedCurrency as 'INR' | 'USD');
    }

    const initData = async () => {
      try {
        const results = await Promise.allSettled([
          firestoreService.fetchProducts(),
          firestoreService.fetchCoupons(),
          firestoreService.fetchCampaigns(),
          firestoreService.fetchPaymentSettings()
        ]);

        const fetchedProducts = results[0].status === 'fulfilled' ? results[0].value : [];
        const fetchedCoupons = results[1].status === 'fulfilled' ? results[1].value : [];
        const fetchedCampaigns = results[2].status === 'fulfilled' ? results[2].value : [];
        const fetchedPayment = results[3].status === 'fulfilled' ? results[3].value : null;

        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          // If product fetch failed or is empty, use initial
          if (results[0].status === 'rejected') {
            console.error("Product fetch failed:", results[0].reason);
          }
          setProducts(INITIAL_PRODUCTS);
        }

        setCoupons(fetchedCoupons);
        setCampaigns(fetchedCampaigns);
        if (fetchedPayment) setPaymentSettings(fetchedPayment);

      } catch (error: any) {
        console.error("Critical init failure:", error);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Listener for Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      try {
        if (firebaseUser) {
          // Re-fetch products strictly to ensure authenticated access (fixes "auto removed" if rules require auth)
          try {
            const secureProducts = await firestoreService.fetchProducts();
            if (secureProducts.length > 0) {
              setProducts(secureProducts);
            }
          } catch (e) {
            console.error("Auth-based product fetch failed", e);
          }

          const userData = await firestoreService.fetchUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
            const userOrders = await firestoreService.fetchOrdersByUser(firebaseUser.uid);
            setOrders(userOrders);
          } else {
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'user'
            };
            setUser(newUser);
          }
        } else {
          setUser(null);
          setOrders([]);
        }
      } catch (error) {
        console.error("Auth sync error:", error);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product, selectedSize: string, customization?: { measurements: CustomMeasurements, notes: string }) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize);
      let newCart;
      if (existing) {
        newCart = prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        newCart = [{ ...product, selectedSize, quantity: 1, customization }, ...prev];
      }
      localStorage.setItem('anandam_cart', JSON.stringify(newCart));
      return newCart;
    });
    showToast(`${product.name} added to archive`);
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => {
      const newCart = prev.map(i => i.id === id && i.selectedSize === size ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      localStorage.setItem('anandam_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeItem = (id: string, size: string) => {
    setCart(prev => {
      const newCart = prev.filter(i => !(i.id === id && i.selectedSize === size));
      localStorage.setItem('anandam_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('anandam_cart');
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('anandam_wishlist', JSON.stringify(next));
      showToast(exists ? 'Removed from private archive' : 'Added to private archive', 'info');
      return next;
    });
  };

  const addOrder = async (order: Order) => {
    if (user) {
      try {
        await firestoreService.addOrder({ ...order, userId: user.id });
        const userOrders = await firestoreService.fetchOrdersByUser(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error("Failed to add order:", error);
      }
    } else {
      setOrders(prev => [order, ...prev]);
    }
  };

  const addReview = async (pid: string, r: Review) => {
    try {
      const product = products.find(p => p.id === pid);
      if (product) {
        const updatedReviews = [r, ...(product.reviews || [])];
        await firestoreService.updateProduct(pid, {
          reviews: updatedReviews,
          numReviews: updatedReviews.length,
          ratings: (updatedReviews.reduce((acc, rev) => acc + rev.rating, 0) / updatedReviews.length)
        });
        const fetchedProducts = await firestoreService.fetchProducts();
        setProducts(fetchedProducts);
      }
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  };

  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(i => i !== id);
      const next = [id, ...filtered].slice(0, 5);
      localStorage.setItem('anandam_recent', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      products, setProducts, cart, addToCart, removeFromCart, removeItem, clearCart,
      user, setUser, orders, addOrder, wishlist, toggleWishlist,
      coupons, setCoupons, giftCards, setGiftCards, addReview, showToast, authLoading,
      campaigns, setCampaigns, recentlyViewed, addToRecentlyViewed,
      currency, setCurrency, bgCurrency, paymentSettings
    }}>{children}
      {authLoading && (
        <div className="fixed inset-0 bg-[#FCFBF7] z-[500] flex flex-col items-center justify-center animate-fadeIn">
          <div className="relative mb-12">
            <div className="w-24 h-24 border border-gold/20 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={LOGO_URL} alt="Loading" className="h-12 w-auto animate-pulse opacity-80" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-xl font-serif italic text-slate-800 tracking-wide">Anandam Fashion</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-gold rounded-full animate-bounce delay-0"></div>
              <div className="w-1 h-1 bg-gold rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-gold rounded-full animate-bounce delay-200"></div>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-gold/60 mt-4">Curating Excellence</p>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-fadeIn">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-sm border border-gold/20 shadow-2xl flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{toast.message}</span>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

// --- App Root ---

const GlobalBanner = () => {
  const { campaigns } = useApp();
  const activeCampaign = campaigns.find(c => c.active);

  if (!activeCampaign) return null;

  return (
    <div className="bg-slate-900 border-b border-gold/10 text-gold py-3 px-4 text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gold/5 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s]"></div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="animate-pulse text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] drop-shadow-sm">{activeCampaign.title}</span>
          <Sparkles size={12} className="animate-pulse text-gold" />
        </div>
        <span className="hidden md:block w-px h-3 bg-gold/20"></span>
        <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/90">{activeCampaign.bannerText}</p>
        <Link to={activeCampaign.link || "/shop"} className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] bg-gold/10 hover:bg-gold hover:text-white px-3 py-1 border border-gold/20 transition-all rounded-sm">
          Explore Archive
        </Link>
      </div>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <Router>
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col">
        <GlobalBanner />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund" element={<RefundPolicy />} />
          </Routes>
        </main>

        <footer className="bg-[#111111] text-white pt-12 md:pt-16 pb-10 md:pb-12 mt-20 border-t border-gold/10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 text-left">
              <div className="space-y-6">
                <Link to="/" className="inline-block h-16 w-40 overflow-hidden rounded-sm mb-2">
                  <img src={LOGO_URL} alt="Anandam Logo" className="h-full w-full object-contain object-left" />
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
                    {['Women', 'Girls', 'Children'].map((item) => (
                      <li key={item}>
                        <Link to={`/shop/${item}`} className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4 text-left">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/80">Concierge</h4>
                  <ul className="space-y-3">
                    {[
                      { name: 'Heritage', path: '/about' },
                      { name: 'Contacts', path: '/contact' },
                      { name: 'Privacy', path: '/privacy' },
                      { name: 'Terms', path: '/terms' },
                      { name: 'Returns', path: '/refund' }
                    ].map((item) => (
                      <li key={item.name}>
                        <Link to={item.path} className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">
                          {item.name}
                        </Link>
                      </li>
                    ))}
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
                  website designed by <span className="text-gold/30">saveragraphics</span> a <span className="text-white/20 italic font-serif lowercase tracking-normal px-1">sindhuragroup</span> company
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  </AppProvider>
);

export default App;
