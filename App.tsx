
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, User as UserIcon, Heart, Search, Menu, X, ChevronRight, 
  Star, Sparkles, Plus, Trash2, ArrowRight, TrendingUp, Clock, Layers,
  Ruler, Target, ClipboardList, Facebook, Twitter, Settings, LogOut, LayoutDashboard,
  Ticket, Gift, Calendar, DollarSign, Tag, Percent, ThumbsUp, CheckCircle, Scissors,
  MapPin, Package, CreditCard, ShieldCheck, Eye, EyeOff, Instagram, Youtube, Globe
} from 'lucide-react';
import { Product, CartItem, User, Order, Category, Review, Coupon, GiftCard, CustomMeasurements } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { getFashionAdvice } from './services/geminiService';
import { client, databases, account } from './services/appwriteService';
import { fetchAnandamFashionDocuments } from './services/appwriteService';
import { fetchProducts, addProduct, updateProduct as updateProductFS, deleteProduct as deleteProductFS, fetchOrdersByUser as fetchOrdersByUserFS, addOrder as addOrderFS } from './services/firestoreService';
import { createOrder } from './services/appwriteService';
import { fetchOrdersByUser } from './services/appwriteService';
import { createProduct, updateProduct, deleteProduct as deleteProductDB } from './services/appwriteService';
import { registerUser, loginUser, getCurrentUser } from './services/appwriteService';
import { Product } from './types';

// --- Constants ---
// Use local logo.png at project root via import.meta.url
const LOGO_URL = new URL('./logo.png', import.meta.url).href;

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
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  giftCards: GiftCard[];
  setGiftCards: React.Dispatch<React.SetStateAction<GiftCard[]>>;
  appliedCoupon?: Coupon | null;
  setAppliedCoupon?: React.Dispatch<React.SetStateAction<Coupon | null>>;
  addReview: (productId: string, review: Review) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

// --- Products State: Use Firestore ---
const [products, setProducts] = useState<Product[]>([]);
const [productsLoading, setProductsLoading] = useState<boolean>(true);
const [productsError, setProductsError] = useState<string | null>(null);

useEffect(() => {
  setProductsLoading(true);
  fetchProducts()
    .then(data => {
      setProducts(data);
      setProductsLoading(false);
    })
    .catch(err => {
      setProductsError('Failed to fetch products from Firestore');
      setProductsLoading(false);
      console.error('Firestore DB Error:', err);
    });
}, []);
// --- Render fetched products from Appwrite ---
// Place this where you want to show the fetched products (for demo, top of main return)
// You can style or move as needed
// Example usage:
// <div>
//   <h2>Products from Database</h2>
//   {dbLoading && <p>Loading products...</p>}
//   {dbError && <p style={{color:'red'}}>{dbError}</p>}
//   <ul>
//     {dbProducts.map((prod) => (
//       <li key={prod.$id}>
//         <strong>{prod.productName}</strong> - {prod.productDescription} - ${prod.price}
//       </li>
//     ))}
//   </ul>
// </div>

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
  const { cart, user, wishlist } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
      <nav className={`fixed w-full z-[60] transition-all duration-500 ${
        isScrolled ? 'bg-white shadow-md py-1' : 'bg-transparent py-3 md:py-5'
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
                 <div className={`relative transition-all duration-500 ${isScrolled ? 'h-12 md:h-14' : 'h-16 md:h-20'}`}>
                   <img 
                    src={LOGO_URL} 
                    alt="Anandam Logo" 
                    className="logo-img h-full w-auto object-contain" 
                   />
                 </div>
              </Link>

              <div className="hidden lg:flex items-center ml-10 space-x-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase transition-all hover:text-gold ${
                      link.highlight ? 'text-rose-500' : (isScrolled ? 'text-slate-600' : 'text-white')
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-4">
              <div className="hidden md:flex items-center relative">
                <Search size={16} className={`absolute left-3 ${isScrolled ? 'text-slate-400' : 'text-white/70'}`} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={`pl-9 pr-4 py-1.5 text-[10px] rounded-full border-none outline-none w-32 focus:w-48 transition-all ${
                    isScrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white placeholder:text-white/50 backdrop-blur-md'
                  }`}
                />
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
                <Link to="/login" className={`hidden sm:block text-[9px] font-bold tracking-[0.2em] px-4 py-2 rounded-sm uppercase transition-all ${
                  isScrolled ? 'bg-slate-900 text-white hover:bg-gold' : 'bg-white text-slate-900 hover:bg-gold hover:text-white'
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
      <aside className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[80] shadow-2xl transition-transform duration-500 lg:hidden ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
          <div className="h-14 md:h-16">
            <img src={LOGO_URL} alt="Anandam Logo" className="logo-img h-full w-auto object-contain" />
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
    <div className="group relative bg-white overflow-hidden transition-all duration-500 rounded-sm shadow-sm hover:shadow-lg border border-slate-100 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
        />
        {product.isOffer && (
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
            {product.isOffer && (
              <span className="text-[10px] text-slate-300 line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Authentication Pages ---

const LoginPage = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login
        await loginUser(formData.email, formData.password);
      } else {
        // Register
        await registerUser(formData.email, formData.password, formData.name);
        await loginUser(formData.email, formData.password);
      }
      // Get user info
      const userInfo = await getCurrentUser();
      setUser({
        id: userInfo.$id,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone || '',
        role: userInfo.email === 'admin@anandam.com' ? 'admin' : 'user',
      });
      setLoading(false);
      navigate(userInfo.email === 'admin@anandam.com' ? '/admin' : '/profile');
    } catch (err: any) {
      setLoading(false);
      alert('Authentication failed: ' + (err?.message || 'Unknown error'));
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

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
              <input 
                type="text" required 
                className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Email Identity</label>
            <input 
              type="email" required 
              className="w-full p-3 bg-slate-50 text-sm font-serif italic outline-none border-b border-transparent focus:border-gold transition-all"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Archive Key (Password)</label>
            <input 
              type="password" required 
              className="w-full p-3 bg-slate-50 text-sm outline-none border-b border-transparent focus:border-gold transition-all"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] shadow-lg hover:bg-gold transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Account'}
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
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              const adminUser: User = { id: Date.now().toString(), name: 'Admin', email: 'admin@anandam.com', phone: '', role: 'admin' };
              setUser(adminUser);
              navigate('/admin');
            }}
            className="w-full mt-3 bg-slate-900 text-white py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-gold transition-all"
          >
            Sign in as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// --- User Profile & Orders ---

const ProfilePage = () => {
  const { user, setUser, orders } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="space-y-10">
          <div className="flex items-center gap-4 pb-8 border-b border-slate-100">
            <div className="w-16 h-16 bg-[#1a0507] rounded-full flex items-center justify-center text-gold text-2xl font-serif italic shadow-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-serif italic">{user.name}</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gold">Silver Member</p>
            </div>
          </div>
          <nav className="flex flex-col gap-4">
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-slate-50 p-4 rounded-sm"><Package size={16} /> Order History</button>
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 p-4 hover:text-slate-900"><MapPin size={16} /> Saved Addresses</button>
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 p-4 hover:text-slate-900"><UserIcon size={16} /> Profile Details</button>
            <button onClick={() => setUser(null)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-rose-500 p-4 mt-6 border-t border-slate-50"><LogOut size={16} /> Sign Out</button>
          </nav>
        </aside>

        <main className="lg:col-span-3 space-y-12">
           <div className="flex justify-between items-end border-b border-slate-100 pb-6">
              <h3 className="text-3xl md:text-4xl font-serif italic">Acquisition Archives</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{orders.length} Records Found</p>
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
                 <div key={order.id} className="bg-white border border-slate-100 p-6 md:p-8 rounded-sm shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 border-b border-slate-50 pb-6">
                       <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-1">Ref: #{order.id}</p>
                          <h4 className="text-base font-serif italic">Placed on {order.date}</h4>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className={`px-4 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-gold/10 text-gold'
                          }`}>
                            {order.status}
                          </span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       {order.items.map((item, i) => (
                         <div key={i} className="flex gap-4 items-center">
                            <img src={item.images[0]} className="w-12 h-16 object-cover rounded-sm shadow-sm" alt="" />
                            <div className="flex-1">
                               <h5 className="text-[11px] font-bold uppercase tracking-widest">{item.name}</h5>
                               <p className="text-[10px] italic font-serif text-slate-400">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                            </div>
                            <p className="text-xs font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

// --- Admin Section ---

const AdminDashboard = () => {
  const { products, setProducts, orders, setOrders, users, setUsers, user, coupons, setCoupons } = useApp();
  const navigate = useNavigate();

  const [view, setView] = useState<'products'|'orders'|'users'|'offers'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({});

  // Product search/filter/sort & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortKey, setSortKey] = useState<'name'|'price'|''>('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm({ id: '', name: '', category: 'Women', subCategory: '', price: 0, originalPrice: 0, images: [''], stock: 0, isOffer: false });
  }, [editing]);

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      readers.push(new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result));
        fr.onerror = () => rej(new Error('File read error'));
        fr.readAsDataURL(file);
      }));
    }
    Promise.all(readers).then((dataUrls) => {
      setForm((prev: any) => ({ ...prev, images: Array.isArray(prev.images) ? [...dataUrls, ...prev.images.filter(Boolean)] : dataUrls }));
    }).catch(() => alert('Failed to read one or more images'));
  };

  if (!user) return null;

  const openNew = () => { setEditing(null); setIsModalOpen(true); };


  const saveProduct = async () => {
    const p: any = {
      name: form.name || 'Untitled',
      category: form.category || 'Women',
      subCategory: form.subCategory || '',
      price: Number(form.price) || 0,
      originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
      images: form.images && form.images.length ? form.images : [''],
      stock: Number(form.stock) || 0,
      isOffer: !!form.isOffer,
      idSlug: '',
      description: form.description || '',
      reviews: []
    };
    try {
      if (editing && editing.id) {
        await updateProductFS(editing.id, p);
      } else {
        await addProduct(p);
      }
      // Refresh products from Firestore
      const data = await fetchProducts();
      setProducts(data);
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const startEdit = (p: Product) => { setEditing(p); setIsModalOpen(true); };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProductFS(id);
      // Refresh products from Firestore
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const updateStock = (id: string, value: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: value } : p));
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Users management
  const promoteUser = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
  const demoteUser = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'user' } : u));
  const deleteUser = (id: string) => { if (!confirm('Delete user?')) return; setUsers(prev => prev.filter(u => u.id !== id)); };

  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.subCategory.toLowerCase().includes(searchTerm.toLowerCase()));
    if (categoryFilter) list = list.filter(p => p.category === categoryFilter);
    if (sortKey === 'name') list.sort((a,b)=> a.name.localeCompare(b.name));
    if (sortKey === 'price') list.sort((a,b)=> a.price - b.price);
    return list;
  }, [products, searchTerm, categoryFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginated = filteredProducts.slice((page-1)*pageSize, page*pageSize);

  // Users search
  const [userSearch, setUserSearch] = useState('');
  const visibleUsers = users.filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  // Automations
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(false);
  const [reportIntervalMinutes, setReportIntervalMinutes] = useState<number>(1440); // default daily
  const [autoShipAfterDays, setAutoShipAfterDays] = useState<number>(3);
  const [showAutomationPanel, setShowAutomationPanel] = useState(false);
  const [lowStockList, setLowStockList] = useState<Product[]>([]);
  const [restockLookbackDays, setRestockLookbackDays] = useState<number>(30);
  const [restockLeadTimeDays, setRestockLeadTimeDays] = useState<number>(30);
  const [restockSuggestions, setRestockSuggestions] = useState<Array<{product: Product, avgDaily: number, suggested: number}>>([]);

  const checkLowStock = () => {
    const low = products.filter(p => (p.stock || 0) <= lowStockThreshold);
    setLowStockList(low);
    return low;
  };

  const exportSalesCSV = (rows: string[][]) => {
    exportCSV('sales-report.csv', rows);
  };

  const generateSalesReport = (days = 7) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const rows = [["orderId","date","user","total","status","items_count"]];
    const recent = orders.filter(o => new Date(o.date).getTime() >= cutoff);
    recent.forEach(o => rows.push([o.id, o.date, o.userName, o.total, o.status, String(o.items.length)]));
    exportSalesCSV(rows);
    return recent.length;
  };

  const runAutoShip = () => {
    const cutoff = Date.now() - autoShipAfterDays * 24 * 60 * 60 * 1000;
    setOrders(prev => prev.map(o => {
      if ((o.status === 'Processing' || o.status === 'Pending') && new Date(o.date).getTime() <= cutoff) {
        return { ...o, status: 'Shipped' };
      }
      return o;
    }));
  };

  const computeRestockSuggestions = (lookbackDays = 30, leadTimeDays = 30) => {
    const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
    const salesMap: Record<string, number> = {};
    orders.forEach(o => {
      if (new Date(o.date).getTime() >= cutoff) {
        o.items.forEach(it => { salesMap[it.id] = (salesMap[it.id] || 0) + (it.quantity || 0); });
      }
    });
    const suggestions = products.map(p => {
      const sold = salesMap[p.id] || 0;
      const avgDaily = sold / Math.max(1, lookbackDays);
      const needed = Math.max(0, Math.ceil(avgDaily * leadTimeDays - (p.stock || 0)));
      return { product: p, avgDaily, suggested: needed };
    }).filter(s => s.suggested > 0).sort((a,b) => b.suggested - a.suggested);
    setRestockSuggestions(suggestions);
    return suggestions;
  };

  const applyRestockSuggestion = (productId: string, amount: number) => {
    if (amount <= 0) return;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: (p.stock || 0) + amount } : p));
    setRestockSuggestions(prev => prev.filter(r => r.product.id !== productId));
  };

  // Client-side scheduler while admin open
  useEffect(() => {
    if (!automationEnabled) return undefined;
    // run checks immediately
    checkLowStock();
    generateSalesReport(7); // default weekly snapshot on enable
    runAutoShip();
    const id = setInterval(() => {
      checkLowStock();
      generateSalesReport(7);
      runAutoShip();
    }, Math.max(1, reportIntervalMinutes) * 60 * 1000);
    return () => clearInterval(id);
  }, [automationEnabled, reportIntervalMinutes, lowStockThreshold, autoShipAfterDays, products, orders]);

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // CSV Export / Import helpers
  const exportCSV = (filename: string, rows: string[][]) => {
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportProductsCSV = () => {
    const rows = [["id","name","category","subCategory","price","originalPrice","stock","images"]];
    products.forEach(p => rows.push([p.id,p.name,p.category,p.subCategory,p.price,p.originalPrice,p.stock,(p.images||[]).join('|')]));
    exportCSV('products.csv', rows);
  };

  const exportUsersCSV = () => {
    const rows = [["id","name","email","role","phone"]];
    users.forEach(u => rows.push([u.id,u.name,u.email,u.role,u.phone||'']));
    exportCSV('users.csv', rows);
  };

  const handleImportProducts = (file: File | null) => {
    if (!file) return; const fr = new FileReader();
    fr.onload = () => {
      const txt = String(fr.result || '');
      const lines = txt.split(/\r?\n/).filter(Boolean);
      const parsed = lines.slice(1).map(l => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').replace(/""/g,'"')));
      const newProducts: Product[] = parsed.map(cols => ({
        id: cols[0] || Date.now().toString(),
        name: cols[1] || 'Imported',
        category: (cols[2] as Category) || 'Women',
        subCategory: cols[3] || '',
        price: Number(cols[4])||0,
        originalPrice: Number(cols[5])||Number(cols[4])||0,
        stock: Number(cols[6])||0,
        images: (cols[7]||'').split('|').filter(Boolean),
        sizes: ['S','M','L'],
        ratings: 0,
        numReviews: 0,
        isOffer: false,
        isCustomizable: false,
        createdAt: new Date().toISOString(),
        description: '',
        reviews: []
      } as Product));
      setProducts(prev => [...newProducts, ...prev]);
      alert(`Imported ${newProducts.length} products`);
    };
    fr.readAsText(file);
  };

  const handleImportUsers = (file: File | null) => {
    if (!file) return; const fr = new FileReader();
    fr.onload = () => {
      const txt = String(fr.result || '');
      const lines = txt.split(/\r?\n/).filter(Boolean);
      const parsed = lines.slice(1).map(l => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').replace(/""/g,'"')));
      const newUsers: User[] = parsed.map(cols => ({ id: cols[0]||Date.now().toString(), name: cols[1]||'Imported', email: cols[2]||'', role: (cols[3] as any)||'user', phone: cols[4]||'' }));
      setUsers(prev => [...newUsers, ...prev]);
      alert(`Imported ${newUsers.length} users`);
    };
    fr.readAsText(file);
  };

  const refundOrder = (orderId: string) => {
    if (!confirm('Confirm refund and mark as Returned?')) return;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Returned' as any } : o));
    alert('Order marked as Returned (refund simulated)');
    setSelectedOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen text-left">
      <div className="flex items-center justify-between mb-8">
         <div>
           <h1 className="text-4xl md:text-5xl font-serif italic leading-tight">Atelier Management</h1>
           <p className="text-[10px] font-bold uppercase tracking-widest text-gold mt-2">Inventory & Collection Controls</p>
         </div>
         <div className="flex items-center gap-3">
             <div className="bg-white rounded-sm shadow-sm">
             <button onClick={() => setView('products')} className={`px-4 py-2 ${view==='products'? 'bg-black text-white' : ''}`}>Products</button>
             <button onClick={() => setView('orders')} className={`px-4 py-2 ${view==='orders'? 'bg-black text-white' : ''}`}>Orders</button>
             <button onClick={() => setView('users')} className={`px-4 py-2 ${view==='users'? 'bg-black text-white' : ''}`}>Users</button>
             <button onClick={() => setView('offers')} className={`px-4 py-2 ${view==='offers'? 'bg-black text-white' : ''}`}>Offers</button>
           </div>
           <button onClick={openNew} className="bg-black text-white px-6 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all"><Plus size={14}/> New Piece</button>

           {/* Automations quick panel */}
           <div className="relative ml-4">
             <button onClick={() => setShowAutomationPanel(s => !s)} className="px-3 py-2 border rounded flex items-center gap-2">
               Automations
               {lowStockList.length > 0 && <span className="ml-2 inline-block bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded">{lowStockList.length}</span>}
             </button>
             {showAutomationPanel && (
               <div className="absolute right-0 mt-2 w-[340px] bg-white border rounded shadow-lg p-4 z-40">
                 <div className="mb-3">
                   <label className="block text-xs font-bold">Low-stock threshold</label>
                   <div className="flex items-center gap-2 mt-2">
                     <input type="number" value={lowStockThreshold} onChange={e=>setLowStockThreshold(Number(e.target.value))} className="p-2 border w-20" />
                     <button onClick={() => { const low = checkLowStock(); alert(`${low.length} low-stock items found`); }} className="px-3 py-1 border rounded">Check Now</button>
                   </div>
                   {lowStockList.length > 0 && (
                     <div className="mt-3 max-h-40 overflow-auto border rounded p-2 bg-slate-50">
                       {lowStockList.map(p => (
                         <div key={p.id} className="flex items-center justify-between text-sm py-1">
                           <div className="flex items-center gap-2"><img src={p.images?.[0]||LOGO_URL} className="w-8 h-10 object-contain" alt="" />{p.name}</div>
                           <div className="text-rose-600">{p.stock}</div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="mb-3">
                   <label className="block text-xs font-bold">Sales report (CSV)</label>
                   <div className="flex items-center gap-2 mt-2">
                     <input type="number" value={reportIntervalMinutes} onChange={e=>setReportIntervalMinutes(Number(e.target.value))} className="p-2 border w-24" />
                     <span className="text-xs text-slate-500">minutes interval</span>
                   </div>
                   <div className="mt-2 flex gap-2">
                     <button onClick={() => { const c = generateSalesReport(7); alert(`Generated sales report for last 7 days: ${c} orders`); }} className="px-3 py-1 border rounded">Run Now</button>
                     <button onClick={() => { setAutomationEnabled(a => !a); alert(`Automations ${automationEnabled ? 'disabled' : 'enabled'}`); }} className="px-3 py-1 border rounded">Toggle Scheduler</button>
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold">Auto-ship after (days)</label>
                   <div className="flex items-center gap-2 mt-2">
                     <input type="number" value={autoShipAfterDays} onChange={e=>setAutoShipAfterDays(Number(e.target.value))} className="p-2 border w-24" />
                     <button onClick={() => { runAutoShip(); alert('Auto-ship executed'); }} className="px-3 py-1 border rounded">Run Now</button>
                   </div>
                 </div>
               </div>
             )}
           </div>
         </div>
      </div>

      {view === 'products' && (
        <div className="bg-white border border-slate-100 rounded-sm overflow-x-auto shadow-sm p-4">
          <div className="flex items-center gap-3 mb-4">
            <input placeholder="Search products" className="p-2 border rounded w-64" value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setPage(1);}} />
            <select value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value); setPage(1);}} className="p-2 border rounded">
              <option value="">All Categories</option>
              <option value="Women">Women</option>
              <option value="Girls">Girls</option>
              <option value="Children">Children</option>
            </select>
            <select value={sortKey} onChange={e=>setSortKey(e.target.value as any)} className="p-2 border rounded">
              <option value="">Sort</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={exportProductsCSV} className="px-3 py-1 border rounded">Export CSV</button>
              <label className="px-3 py-1 border rounded cursor-pointer">Import CSV<input type="file" accept=".csv" onChange={(e)=>handleImportProducts(e.target.files?.[0]||null)} className="hidden"/></label>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-300 border-b bg-slate-50/50">
                <th className="p-4">Preview</th>
                <th className="p-4">Archive Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Valuation</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map(p => (
                <tr key={p.id} className="text-xs hover:bg-slate-50 transition-colors">
                  <td className="p-4"><img src={p.images?.[0]||LOGO_URL} alt={p.name} className="h-12 w-auto object-contain" /></td>
                  <td className="p-4 font-serif italic text-base text-slate-800">{p.name}</td>
                  <td className="p-4 uppercase tracking-widest text-[10px] text-slate-400 font-bold">{p.category}</td>
                  <td className="p-4 font-bold">₹{p.price.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input type="number" className="w-20 p-1 border rounded-sm" defaultValue={p.stock} onBlur={(e) => updateStock(p.id, Number(e.currentTarget.value))} />
                      <span className="text-[11px] text-slate-400">units</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(p)} className="text-slate-700 hover:text-gold p-2 mr-2">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-rose-600 p-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">Showing {Math.min(filteredProducts.length, (page)*pageSize)} of {filteredProducts.length}</div>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Prev</button>
              <span className="px-3">{page} / {totalPages}</span>
              <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>
      )}

      {view === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-sm overflow-x-auto shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-300 border-b bg-slate-50/50">
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(o => (
                  <tr key={o.id} className="text-xs hover:bg-slate-50 transition-colors" onClick={() => setSelectedOrder(o)} style={{cursor:'pointer'}}>
                    <td className="p-4 font-bold">{o.id}</td>
                    <td className="p-4">{o.userName}</td>
                    <td className="p-4">{o.items.length}</td>
                    <td className="p-4">₹{o.total.toLocaleString()}</td>
                    <td className="p-4">
                      <select defaultValue={o.status} onChange={(e) => updateOrderStatus(o.id, e.currentTarget.value)} className="p-2 border rounded-sm" onClick={e=>e.stopPropagation()}>
                        {['Pending','Processing','Shipped','Delivered','Cancelled','Returned'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={(e)=>{e.stopPropagation(); navigator.clipboard?.writeText(o.trackingNumber || '')}} className="text-slate-700 hover:text-gold p-2">Copy Tracking</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'offers' && (
        <div className="bg-white border border-slate-100 rounded-sm overflow-x-auto shadow-sm p-4">
          <div className="flex items-center gap-3 mb-4">
            <input placeholder="Search coupons" className="p-2 border rounded w-64" value={''} onChange={()=>{}} />
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => {
                const code = prompt('Coupon code (e.g. SAVE20)');
                if (!code) return;
                const type = prompt('Type: percentage or fixed', 'percentage') as any;
                const valueStr = prompt('Value (number)', '10');
                const min = prompt('Min purchase (optional)', '0');
                const expiry = prompt('Expiry (YYYY-MM-DD) optional', '');
                const c: Coupon = { id: Date.now().toString(), code: code.toUpperCase(), discountType: (type==='fixed'?'fixed':'percentage'), value: Number(valueStr||0), minPurchase: Number(min)||0, expiryDate: expiry||undefined };
                setCoupons(prev => [c, ...prev]);
                alert('Coupon created');
              }} className="px-3 py-1 border rounded">New Coupon</button>
              <button onClick={() => {
                if (!coupons || coupons.length===0) return alert('No coupons');
                const csv = ['id,code,discountType,value,minPurchase,expiryDate', ...coupons.map(c=>`${c.id},${c.code},${c.discountType},${c.value},${c.minPurchase||''},${c.expiryDate||''}`)].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'coupons.csv'; a.click(); URL.revokeObjectURL(url);
              }} className="px-3 py-1 border rounded">Export CSV</button>
              <label className="px-3 py-1 border rounded cursor-pointer">Import CSV<input type="file" accept=".csv" onChange={(e)=>{
                const f = e.target.files?.[0]; if (!f) return; const fr = new FileReader(); fr.onload = ()=>{
                  const txt = String(fr.result||''); const lines = txt.split(/\r?\n/).filter(Boolean); const parsed = lines.slice(1).map(l=>l.split(',')); const newC = parsed.map(cols=>({ id: cols[0]||Date.now().toString(), code: (cols[1]||'').toUpperCase(), discountType: (cols[2]||'percentage') as any, value: Number(cols[3]||0), minPurchase: Number(cols[4]||0), expiryDate: cols[5]||undefined } as Coupon));
                  setCoupons(prev=>[...newC, ...prev]); alert(`Imported ${newC.length} coupons`);
                }; fr.readAsText(f);
              }} className="hidden"/></label>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-300 border-b bg-slate-50/50">
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Purchase</th>
                <th className="p-4">Expiry</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map(c => (
                <tr key={c.id} className="text-xs hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-serif italic text-base text-slate-800">{c.code}</td>
                  <td className="p-4 uppercase text-[10px] text-slate-400">{c.discountType}</td>
                  <td className="p-4">{c.discountType==='percentage'? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="p-4">{c.minPurchase ? `₹${c.minPurchase}` : '-'}</td>
                  <td className="p-4">{c.expiryDate || '-'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => { if (!confirm('Delete coupon?')) return; setCoupons(prev=>prev.filter(x=>x.id!==c.id)); }} className="text-rose-600 p-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'users' && (
        <div className="bg-white border border-slate-100 rounded-sm overflow-x-auto shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <input placeholder="Search users" className="p-2 border rounded w-64" value={userSearch} onChange={e=>setUserSearch(e.target.value)} />
            <div className="text-sm text-slate-500">Total users: {users.length}</div>
            <div className="ml-4 flex items-center gap-2">
              <button onClick={exportUsersCSV} className="px-3 py-1 border rounded">Export CSV</button>
              <label className="px-3 py-1 border rounded cursor-pointer">Import CSV<input type="file" accept=".csv" onChange={(e)=>handleImportUsers(e.target.files?.[0]||null)} className="hidden"/></label>
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-300 border-b bg-slate-50/50">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibleUsers.map(u => (
                <tr key={u.id} className="text-xs hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-serif italic text-base text-slate-800">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 uppercase tracking-widest text-[10px] text-slate-400 font-bold">{u.role}</td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' ? (
                      <button onClick={() => promoteUser(u.id)} className="text-slate-700 hover:text-gold p-2 mr-2">Promote</button>
                    ) : (
                      <button onClick={() => demoteUser(u.id)} className="text-slate-700 hover:text-rose-500 p-2 mr-2">Demote</button>
                    )}
                    <button onClick={() => deleteUser(u.id)} className="text-rose-600 p-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for add/edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-sm w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Piece' : 'New Piece'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Name" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className="p-2 border" />
              <input placeholder="Category" value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})} className="p-2 border" />
              <input placeholder="Subcategory" value={form.subCategory||''} onChange={e=>setForm({...form,subCategory:e.target.value})} className="p-2 border" />
              <input placeholder="Price" type="number" value={form.price||0} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="p-2 border" />
              <input placeholder="Original Price" type="number" value={form.originalPrice||0} onChange={e=>setForm({...form,originalPrice:Number(e.target.value)})} className="p-2 border" />
              <input placeholder="Stock" type="number" value={form.stock||0} onChange={e=>setForm({...form,stock:Number(e.target.value)})} className="p-2 border" />
              <input placeholder="Image URL (comma separated)" value={(form.images||['']).join(',')} onChange={e=>setForm({...form,images:e.target.value.split(',')})} className="p-2 border col-span-2" />
              <div className="col-span-2">
                <label className="text-[12px] font-medium mb-2 block">Or upload images from device</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleImageFiles(e.target.files)} className="p-1" />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {(form.images || []).filter(Boolean).map((src: string, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 border rounded-sm overflow-hidden">
                      <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm((prev:any)=> ({...prev, images: prev.images.filter((_:any,i:number)=> i!==idx)}))} className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded">x</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.isOffer} onChange={e=>setForm({...form,isOffer:e.currentTarget.checked})} /> <span className="text-sm">Mark as Offer (shows % off badge)</span></label>
              </div>
              <textarea placeholder="Description" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} className="p-2 border col-span-2" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border">Cancel</button>
              <button onClick={saveProduct} className="px-4 py-2 bg-black text-white">Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-sm w-full max-w-3xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold">Order {selectedOrder.id}</h3>
                <p className="text-sm text-slate-500">{selectedOrder.userName} • {selectedOrder.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Total ₹{selectedOrder.total.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Status: {selectedOrder.status}</p>
              </div>
            </div>
            <div className="space-y-4">
              {selectedOrder.items.map((it, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-3">
                  <img src={it.images[0]} className="w-16 h-20 object-cover rounded-sm" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold">{it.name}</h4>
                    <p className="text-sm text-slate-500">Size: {it.selectedSize} • Qty: {it.quantity}</p>
                  </div>
                  <div className="text-right font-bold">₹{(it.price * it.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border">Close</button>
              <button onClick={() => refundOrder(selectedOrder.id)} className="px-4 py-2 bg-rose-600 text-white">Refund</button>
            </div>
          </div>
        </div>
      )}
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
                <div className="pt-2">
                   <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-black px-6 md:px-10 py-3 md:py-4 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-white transition-all shadow-xl">
                    Explore <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[40%] grid grid-cols-2 gap-3 md:gap-4 h-full">
             {products.slice(0,4).map((p, i) => (
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
  const filtered = products.filter(p => !category || p.category === category);
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <h1 className="text-3xl md:text-5xl font-serif italic text-left mb-10">{category || 'All Collections'}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useApp();
  const product = products.find(p => p.id === id);
  const [size, setSize] = useState('');
  
  if (!product) return <div className="p-40 text-center font-serif italic">Archive entry not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
        <div className="w-full lg:w-1/2">
           <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-2xl">
             <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
           </div>
        </div>
        <div className="w-full lg:w-1/2 text-left space-y-8 md:space-y-10">
           <div className="space-y-3">
             <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">{product.subCategory}</span>
               {product.numReviews > 0 && <span className="text-[10px] font-bold text-slate-300">({product.numReviews} Client Testimonials)</span>}
             </div>
             <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 leading-tight">{product.name}</h1>
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

           <div className="pt-4">
              <button 
                onClick={() => size && addToCart(product, size)} 
                className={`w-full bg-black text-white py-4 md:py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl ${!size ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
              >
                Acquire for Archive
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const OffersPage = () => {
  const { products, coupons, cart, appliedCoupon, setAppliedCoupon } = useApp();
  const offerProducts = products.filter(p => p.isOffer);
  const [code, setCode] = useState('');
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const apply = () => {
    const c = coupons.find(cc => cc.code.toUpperCase() === code.toUpperCase());
    if (!c) { alert('Coupon not found'); return; }
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) { alert('Coupon expired'); return; }
    if (c.minPurchase && subtotal < (c.minPurchase||0)) { alert('Cart does not meet minimum purchase'); return; }
    setAppliedCoupon && setAppliedCoupon(c);
    alert(`Coupon ${c.code} applied`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <h1 className="text-4xl font-serif italic mb-6">Offers & Coupons</h1>
      <div className="mb-6 flex items-center gap-3">
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter coupon code" className="p-2 border w-56" />
        <button onClick={apply} className="px-3 py-2 bg-black text-white">Apply</button>
        <button onClick={()=>{ setAppliedCoupon && setAppliedCoupon(null); alert('Coupon cleared'); }} className="px-3 py-2 border">Clear</button>
        <div className="ml-auto text-sm">Cart subtotal: ₹{subtotal.toLocaleString()}</div>
      </div>

      {appliedCoupon && (
        <div className="mb-6 p-4 border rounded bg-green-50">
          <strong>{appliedCoupon.code}</strong> applied — {appliedCoupon.discountType==='percentage' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value}`} {appliedCoupon.minPurchase ? `(min ₹${appliedCoupon.minPurchase})` : ''}
        </div>
      )}

      <h2 className="text-2xl mb-4">Offer pieces</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {offerProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
};

// --- App Provider ---

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch orders for logged-in user (Firestore)
  useEffect(() => {
    async function fetchOrders() {
      if (user && user.id) {
        try {
          const data = await fetchOrdersByUserFS(user.id);
          setOrders(data);
        } catch (err) {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    }
    fetchOrders();
  }, [user]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Collector 01', email: 'collector1@example.com', role: 'user', phone: '9999999999' },
    { id: '2', name: 'Collector 02', email: 'collector2@example.com', role: 'user', phone: '8888888888' }
  ]);

  const addToCart = (product: Product, selectedSize: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize);
      if (existing) return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [{ ...product, selectedSize, quantity: 1 }, ...prev];
    });
  };

  const removeFromCart = (id: string, size: string) => setCart(prev => prev.map(i => i.id === id && i.selectedSize === size ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  const removeItem = (id: string, size: string) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedSize === size)));
  const clearCart = () => setCart([]);
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addOrder = async (order: Order) => {
    try {
      await addOrderFS(order);
      setOrders(prev => [order, ...prev]);
      clearCart();
    } catch (err) {
      alert('Failed to place order');
    }
  };
  const addReview = (pid: string, r: Review) => setProducts(p => p.map(it => it.id === pid ? {...it, reviews: [r, ...it.reviews]} : it));

  return (
    <AppContext.Provider value={{ 
      products, setProducts, cart, addToCart, removeFromCart, removeItem, clearCart, 
      user, setUser, orders, addOrder, setOrders, users, setUsers, wishlist, toggleWishlist,
      coupons, setCoupons, giftCards, setGiftCards, appliedCoupon, setAppliedCoupon, addReview
    }}>{children}</AppContext.Provider>
  );
};

// --- App Root ---

const App = () => (
  <AppProvider>
    <Router>
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cart" element={<div className="py-40 text-center font-serif italic text-slate-300">Cart Archive Under Maintenance.</div>} />
          </Routes>
        </main>
        
        <footer className="bg-[#111111] text-white pt-12 md:pt-16 pb-10 md:pb-12 mt-20 border-t border-gold/10">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 text-left">
                  <div className="space-y-6">
                    <Link to="/" className="inline-block h-16 md:h-20 mb-2">
                      <img src={LOGO_URL} alt="Anandam Logo" className="logo-img h-full w-auto object-contain" />
                    </Link>
                     <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Anandam Atelier</h4>
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
                          {['Shipping', 'Returns', 'Bespoke'].map((item) => (
                             <li key={item}>
                                <a href="#" className="text-[9px] font-medium uppercase text-white/30 tracking-[0.2em] hover:text-white transition-all">
                                   {item}
                                </a>
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
                        &copy; {new Date().getFullYear()} Anandam Atelier Global.
                     </p>
                    <p className="text-[8px] font-medium uppercase tracking-[0.4em] text-white/10">
                      {/* HIGHLIGHT START: website designed by saveragraphics a sindhuragroup company */}
                      website designed by <span className="text-gold/30">saveragraphics</span> a <span className="text-white/20 italic font-serif lowercase tracking-normal px-1">sindhuragroup</span> company
                      {/* HIGHLIGHT END */}
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
