
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, Scissors,
    Ticket, Settings, LogOut, Menu, X, ArrowLeft, ExternalLink
} from 'lucide-react';
import { useApp } from '../../App';
import { signOut } from '../../services/authService';

interface AdminLayoutProps {
    children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, loading } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Inventory', path: '/admin/inventory', icon: <Package size={20} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Bespoke Registry', path: '/admin/bespoke', icon: <Scissors size={20} /> },
        { name: 'Coupons', path: '/admin/coupons', icon: <Ticket size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    // Universal Back Logic
    const handleBack = () => {
        // If we have history within the app, go back
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // Default fallback if no history
            navigate('/admin');
        }
    };

    // Robust Auth Guard
    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            console.log('Unauthorized access to admin section, redirecting...');
            navigate('/login', { replace: true });
        }
    }, [user, loading, navigate]);

    // Show nothing while evaluating auth, but AppProvider already shows a spinner
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <Link to="/admin" className="text-xl font-serif italic text-white flex items-center gap-2">
                        <span>Anandam</span>
                        <span className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] font-bold">Admin</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${location.pathname === item.path ? 'bg-gold text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50/10 transition-all mt-8"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Global Admin Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
                            <Menu size={24} />
                        </button>
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-gold transition-colors"
                        >
                            <ExternalLink size={14} /> View Store
                        </Link>
                        <div className="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center text-gold text-xs font-serif italic">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
