
import React, { useState } from 'react';
import { useApp } from '../../App';
import { signOut } from '../../services/authService';
import { fetchLocationFromPincode } from '../../utils/addressUtils';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Package, MapPin, CreditCard, Heart, Gift, MessageSquare,
    LogOut, User as UserIcon, ChevronRight, Search, Phone, RefreshCw,
    ShieldCheck, AlertCircle, Clock, Truck, CheckCircle
} from 'lucide-react';
import { Address, Order, Product } from '../../types';
import { updateUserDocument, updateOrderStatus } from '../../services/firestoreService';

// --- Sub-Components ---

const DashboardSidebar = ({
    activeTab,
    setActiveTab,
    user,
    onLogout
}: {
    activeTab: string,
    setActiveTab: (t: string) => void,
    user: any,
    onLogout: () => void
}) => {
    const MENU_ITEMS = [
        {
            heading: 'My Orders',
            items: [
                { id: 'orders', label: 'All Orders', icon: <Package size={16} /> },
                { id: 'returns', label: 'Returns & Refunds', icon: <RefreshCw size={16} /> }
            ]
        },
        {
            heading: 'Account Settings',
            items: [
                { id: 'profile', label: 'Profile Information', icon: <UserIcon size={16} /> },
                { id: 'addresses', label: 'Manage Addresses', icon: <MapPin size={16} /> },
                { id: 'payments', label: 'Saved Cards & Wallets', icon: <CreditCard size={16} /> }
            ]
        },
        {
            heading: 'My Stuff',
            items: [
                { id: 'wishlist', label: 'My Wishlist', icon: <Heart size={16} /> },
                { id: 'coupons', label: 'My Coupons', icon: <Gift size={16} /> },
                { id: 'reviews', label: 'My Reviews', icon: <MessageSquare size={16} /> }
            ]
        },
        {
            heading: 'Support',
            items: [
                { id: 'help', label: '24x7 Customer Care', icon: <Phone size={16} /> }
            ]
        }
    ];

    return (
        <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-4">
            {/* User Card */}
            <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-gold text-xl font-serif italic">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Hello,</p>
                    <h3 className="font-serif italic text-lg">{user?.name}</h3>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white shadow-sm border border-slate-100 rounded-sm overflow-hidden">
                {MENU_ITEMS.map((section, idx) => (
                    <div key={idx} className="border-b border-slate-50 last:border-0">
                        {section.heading && (
                            <div className="px-6 py-3 bg-slate-50/50">
                                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{section.heading}</h4>
                            </div>
                        )}
                        <div>
                            {section.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-6 py-4 transition-all hover:bg-slate-50 ${activeTab === item.id
                                        ? 'bg-slate-50 text-gold font-bold'
                                        : 'text-slate-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={activeTab === item.id ? 'text-gold' : 'text-slate-300'}>{item.icon}</span>
                                        <span className="text-xs font-medium uppercase tracking-wide">{item.label}</span>
                                    </div>
                                    {activeTab === item.id && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-6 py-5 text-rose-500 hover:bg-rose-50 transition-all border-t border-slate-100"
                >
                    <LogOut size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">Logout</span>
                </button>
            </nav>
        </aside>
    );
};

// --- View Components ---

const OrdersView = ({ orders, setOrders }: { orders: Order[], setOrders: any }) => {
    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            await updateOrderStatus(orderId, 'Cancelled');
            setOrders((prev: Order[]) => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as const } : o));
            alert('Order cancelled successfully');
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Failed to cancel order. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-sm shadow-sm border border-slate-100">
                <Search size={16} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search your orders here..."
                    className="flex-1 outline-none text-sm font-serif italic"
                />
                <button className="bg-black text-white px-6 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-colors">Search</button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-sm border border-slate-100">
                    <Package size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="font-serif italic text-slate-400">No active orders found.</p>
                    <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest text-gold mt-4 inline-block hover:text-black">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white border border-slate-100 rounded-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-50/50 border-b border-slate-100 gap-4">
                                <div className="flex gap-4">
                                    <div className="bg-slate-200 text-slate-500 rounded-full w-10 h-10 flex items-center justify-center">
                                        <Box size={20} />
                                    </div>
                                    <div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-1">Order #{order.id}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="font-serif italic text-sm">₹{order.total.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-400">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                    {order.status === 'Processing' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1 rounded-sm transition-all"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                            {order.trackingNumber && (
                                <div className="px-4 py-2 bg-blue-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-blue-700">
                                        <Truck size={12} />
                                        <span>Tracking: {order.courierName} - {order.trackingNumber}</span>
                                    </div>
                                    <button className="text-[9px] font-bold uppercase text-blue-600 hover:underline">Track via Carrier</button>
                                </div>
                            )}
                            <div className="p-4 space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <img src={item.images[0]} alt="" className="w-16 h-20 object-cover rounded-sm border border-slate-100" />
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">{item.name}</h4>
                                            <p className="text-[10px] text-slate-500">Size: {item.selectedSize}{item.selectedColor ? ` | Color: ${item.selectedColor}` : ''}</p>
                                            {item.isCustomized && <p className="text-[9px] text-gold italic">Bespoke Customization</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-black text-right">Rate & Review</button>

                                            <div className="flex gap-2 text-[9px] text-slate-400 justify-end">
                                                <span className="cursor-pointer hover:text-slate-900">Need Help?</span>
                                                <span>|</span>
                                                <span className="cursor-pointer hover:text-slate-900">Invoice</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AddressBookView = ({ user, setUser }: { user: any, setUser: any }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Address>>({});

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const newAddress = { id: Date.now().toString(), ...formData } as Address;
        const updatedAddresses = [...(user.addresses || []), newAddress];
        await updateUserDocument(user.id, { addresses: updatedAddresses });
        setUser({ ...user, addresses: updatedAddresses });
        setIsAdding(false);
        setFormData({});
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this address?')) {
            const updatedAddresses = user.addresses.filter((a: Address) => a.id !== id);
            await updateUserDocument(user.id, { addresses: updatedAddresses });
            setUser({ ...user, addresses: updatedAddresses });
        }
    };

    const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 6);
        setFormData(prev => ({ ...prev, zipCode: val }));
        
        if (val.length === 6) {
            const location = await fetchLocationFromPincode(val);
            if (location) {
                setFormData(prev => ({ ...prev, city: location.city, state: location.state }));
            }
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif italic text-2xl">Manage Addresses</h2>
                <button onClick={() => setIsAdding(true)} className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-black border border-gold px-4 py-2 hover:bg-gold hover:text-white transition-all">
                    + Add New Address
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSave} className="mb-8 bg-slate-50 p-6 rounded-sm space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required placeholder="Name" className="p-3 border text-sm" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        <input required placeholder="Phone 10-digit number" className="p-3 border text-sm" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })} maxLength={10} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="Pincode" className="p-3 border text-sm" value={formData.zipCode || ''} onChange={handleZipChange} maxLength={6} />
                        <input required placeholder="City/District/Town" className="p-3 border text-sm" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <textarea required placeholder="Address (Area and Street)" className="w-full p-3 border text-sm" rows={3} value={formData.street || ''} onChange={e => setFormData({ ...formData, street: e.target.value })} />

                    <div className="flex gap-4">
                        <input placeholder="State" className="p-3 border text-sm flex-1" value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        <select
                            value={formData.type || 'Home'}
                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            className="p-3 border text-sm flex-1 bg-slate-50"
                        >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest">Save</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4">Cancel</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {user.addresses?.map((addr: Address) => (
                    <div key={addr.id} className="border border-slate-200 p-4 rounded-sm flex justify-between items-start">
                        <div>
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm mb-2 inline-block">{addr.type}</span>
                            <p className="text-sm font-bold text-slate-800">{addr.name || user.name} <span className="text-slate-500 font-normal ml-2">{addr.phone || user.phone}</span></p>
                            <p className="text-sm text-slate-600 mt-1">
                                {addr.street}, {addr.city}, {addr.state} - <span className="font-bold">{addr.zipCode}</span>
                            </p>
                        </div>
                        <div className="relative group">
                            <button className="text-slate-400 hover:text-black"><MessageSquare size={16} /></button>
                            {/* Dropdown mock */}
                            <div className="absolute right-0 top-full bg-white shadow-lg border hidden group-hover:block z-10 w-32">
                                <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs">Edit</button>
                                <button onClick={() => handleDelete(addr.id)} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-500 text-xs">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WishlistView = ({ wishlist, products }: { wishlist: string[], products: Product[] }) => {
    const items = products.filter(p => wishlist.includes(p.id));

    return (
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
            <h2 className="font-serif italic text-2xl mb-6">My Wishlist ({items.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(p => (
                    <div key={p.id} className="border border-slate-100 p-4 rounded-sm hover:shadow-lg transition-all relative group">
                        <Link to={`/product/${p.id}`} className="block aspect-[3/4] overflow-hidden mb-4 bg-slate-50">
                            <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        </Link>
                        <h3 className="font-serif italic text-sm line-clamp-1">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-sm">₹{p.price.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 line-through">₹{p.originalPrice}</span>
                            <span className="text-[9px] font-bold text-rose-500">{Math.round((1 - p.price / p.originalPrice) * 100)}% off</span>
                        </div>
                        <button className="w-full mt-4 border border-blue-600 text-blue-600 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Move to Bag</button>
                        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-slate-300 hover:text-rose-500"><LogOut size={14} className="rotate-180" /></button>
                    </div>
                ))}
            </div>
            {items.length === 0 && <p className="text-slate-400 py-10 text-center font-serif italic">Your wishlist is empty.</p>}
        </div>
    );
};

const SupportView = () => (
    <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <ShieldCheck size={48} className="mx-auto text-gold mb-4" />
            <h2 className="font-serif italic text-2xl">24x7 Customer Support</h2>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-wide">We are here to help you</p>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 flex items-start gap-4">
                <Package className="text-slate-400 mt-1" size={20} />
                <div>
                    <h3 className="font-bold text-sm text-slate-900">Where is my order?</h3>
                    <p className="text-xs text-slate-500 mt-1">You can track your order status in the 'My Orders' section. Delivery usually takes 5-7 business days.</p>
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 flex items-start gap-4">
                <RefreshCw className="text-slate-400 mt-1" size={20} />
                <div>
                    <h3 className="font-bold text-sm text-slate-900">Returns & Refunds</h3>
                    <p className="text-xs text-slate-500 mt-1">Returns are accepted within 7 days of delivery. Refunds are processed within 48 hours of pickup.</p>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Contact Us Directly</h3>
            <button className="w-full py-3 border border-slate-200 text-slate-600 flex items-center justify-center gap-2 hover:border-black hover:text-black transition-all">
                <Phone size={16} /> Request Callback
            </button>
        </div>
    </div>
);

const PaymentsView = () => (
    <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
        <h2 className="font-serif italic text-2xl mb-6">Saved Payments</h2>
        <div className="space-y-4">
            <div className="border border-slate-200 p-4 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center text-[9px] font-bold text-slate-500">VISA</div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">HDFC Bank Credit Card</p>
                        <p className="text-xs text-slate-400">**** **** **** 4021</p>
                    </div>
                </div>
                <button className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:underline">Remove</button>
            </div>
            <div className="border border-slate-200 p-4 rounded-sm flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center text-[9px] font-bold text-slate-500">UPI</div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Google Pay</p>
                        <p className="text-xs text-slate-400">user@oksbi</p>
                    </div>
                </div>
                <button className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:underline">Remove</button>
            </div>
        </div>
        <button className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gold hover:text-black text-left flex items-center gap-2">
            <PlusIcon /> Add New Card/UPI
        </button>
    </div>
);

const ReturnsView = ({ orders }: { orders: Order[] }) => {
    // Mock returnable orders
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');

    return (
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-slate-100">
            <h2 className="font-serif italic text-2xl mb-6">Returns & Refunds</h2>

            {deliveredOrders.length > 0 ? (
                <div className="space-y-4">
                    {deliveredOrders.map(order => (
                        <div key={order.id} className="border border-slate-100 p-4 rounded-sm flex justify-between items-center">
                            <div className="flex gap-4">
                                <img src={order.items[0].images[0]} className="w-12 h-16 object-cover rounded-sm" alt="" />
                                <div>
                                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">Delivered on {new Date(order.date).toLocaleDateString()}</span>
                                    <p className="font-medium text-sm mt-1">{order.items[0].name} {order.items.length > 1 && `+ ${order.items.length - 1} others`}</p>
                                    <p className="text-xs text-slate-400">Order #{order.id}</p>
                                </div>
                            </div>
                            <button className="border border-slate-200 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">Return Item</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2" />
                    <p className="font-serif italic text-sm">No items eligible for return.</p>
                </div>
            )}
        </div>
    )
};

const PlusIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
)

// --- Main Component ---

const UserDashboard = () => {
    const { user, setUser, orders, setOrders, wishlist, products } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FCFBF7] pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                <DashboardSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    user={user}
                    onLogout={handleLogout}
                />

                <main className="flex-1 min-w-0">
                    {activeTab === 'orders' && <OrdersView orders={orders} setOrders={setOrders} />}
                    {activeTab === 'returns' && <ReturnsView orders={orders} />}

                    {activeTab === 'profile' && (
                        <div className="bg-white p-8 border border-slate-100">
                            <h2 className="font-serif italic text-2xl mb-6">Personal Information</h2>
                            <form className="space-y-6 max-w-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">First Name</label>
                                        <input disabled value={user.name.split(' ')[0]} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Last Name</label>
                                        <input disabled value={user.name.split(' ')[1] || ''} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                                    <input disabled value={user.email} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none text-slate-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                                    <input disabled value={user.phone || '+91 -'} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none" />
                                </div>
                                <button disabled className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gold opacity-50 cursor-not-allowed">Edit Profile (Coming Soon)</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'addresses' && <AddressBookView user={user} setUser={setUser} />}
                    {activeTab === 'payments' && <PaymentsView />}

                    {activeTab === 'wishlist' && <WishlistView wishlist={wishlist} products={products} />}
                    {activeTab === 'coupons' && <div className="p-20 text-center font-serif italic text-slate-400 bg-white border border-slate-100">No active rewards available.</div>}
                    {activeTab === 'reviews' && <div className="p-20 text-center font-serif italic text-slate-400 bg-white border border-slate-100">You haven't written any reviews yet.</div>}

                    {activeTab === 'help' && <SupportView />}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;
