
import React from 'react';
import { useApp } from '../../App';
import { TrendingUp, Package, Users, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { products, orders } = useApp();

    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const lowStockProducts = products.filter(p => p.stock < 5);
    const pendingOrders = orders.filter(o => o.status === 'Processing');

    const stats = [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, change: '+12% this month' },
        { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={20} />, change: `${pendingOrders.length} pending` },
        { label: 'Archive Value', value: products.length, icon: <Package size={20} />, change: `${lowStockProducts.length} low stock` },
        { label: 'Active Clients', value: '1,204', icon: <Users size={20} />, change: '+8% this month' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">Atelier Overview</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Performance & Alerts</p>
            </header>

            <section aria-label="Key Metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <article key={i} className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-full text-slate-900">{stat.icon}</div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${stat.change.includes('low') || stat.change.includes('pending') ? 'text-rose-500' : 'text-green-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-serif italic text-slate-900">{stat.value}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                    </article>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders Preview */}
                <section aria-label="Recent Commissions" className="bg-white border border-slate-100 rounded-sm p-6 shadow-sm">
                    <header className="flex justify-between items-center mb-6">
                        <h3 className="font-serif italic text-xl">Recent Commissions</h3>
                        <Link to="/admin/orders" className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-black">View All</Link>
                    </header>
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{order.userName}</p>
                                    <p className="text-[10px] text-slate-400">Order #{order.id.slice(0, 8)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-serif italic text-sm">₹{order.total.toLocaleString()}</p>
                                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                        }`}>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Low Stock Alerts */}
                <section aria-label="Registry Alerts" className="bg-white border border-slate-100 rounded-sm p-6 shadow-sm">
                    <header className="flex justify-between items-center mb-6">
                        <h3 className="font-serif italic text-xl flex items-center gap-2">
                            <AlertCircle size={18} className="text-rose-500" />
                            Registry Alerts
                        </h3>
                        <Link to="/admin/inventory" className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-black">Manage Stock</Link>
                    </header>
                    <div className="space-y-4">
                        {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                                <img src={p.images[0]} className="w-10 h-12 object-cover rounded-sm" alt="" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{p.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-rose-600 font-bold text-sm">{p.stock} left</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-sm font-serif italic text-center py-10">Archive inventory is healthy.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
