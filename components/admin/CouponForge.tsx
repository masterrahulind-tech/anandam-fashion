
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../App';
import { Ticket, Trash2, Plus, X } from 'lucide-react';
import { createCoupon, deleteCoupon } from '../../services/firestoreService';
import { Coupon } from '../../types';

const CouponForge = () => {
    const { coupons, setCoupons } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Coupon, 'id'>>({
        code: '',
        discountAmount: 0,
        discountType: 'percentage',
        minPurchase: 0
    });

    // Sync URL state
    useEffect(() => {
        const action = searchParams.get('action');
        setIsFormOpen(action === 'create');
    }, [searchParams]);

    const handleOpenCreate = () => {
        setSearchParams({ action: 'create' });
    };

    const handleCloseForm = () => {
        setSearchParams({});
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this coupon?')) {
            try {
                await deleteCoupon(id);
                setCoupons(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                console.error(err);
                alert("Failed to delete coupon");
            }
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const id = await createCoupon(formData);
            setCoupons(prev => [...prev, { ...formData, id }]);
            handleCloseForm();
            setFormData({ code: '', discountAmount: 0, discountType: 'percentage', minPurchase: 0 });
        } catch (err) {
            console.error(err);
            alert("Failed to create coupon");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif italic text-slate-900">Coupon Forge</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Manage Promo Codes & Discounts</p>
                </div>
                <button onClick={handleOpenCreate} className="bg-black text-white px-6 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all">
                    <Plus size={14} /> Create Coupon
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white border border-slate-100 p-6 rounded-sm shadow-sm relative group hover:border-gold transition-colors">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(coupon.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-slate-50 text-slate-900 rounded-full">
                                <Ticket size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg tracking-widest uppercase">{coupon.code}</h3>
                                <p className="text-[9px] text-slate-400 uppercase">
                                    {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% Off` : `₹${coupon.discountAmount} Flat Off`}
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Min Spend: ₹{coupon.minPurchase}</span>
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                        </div>
                    </div>
                ))}
                {coupons.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-sm">
                        <p className="font-serif italic text-slate-400">No active coupons found.</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <button onClick={handleCloseForm} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X size={20} /></button>
                        <h3 className="text-2xl font-serif italic mb-6">Forge New Coupon</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Code</label>
                                <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none font-bold tracking-widest uppercase" placeholder="WELCOME20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Type</label>
                                    <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none text-sm">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Value</label>
                                    <input type="number" required value={formData.discountAmount} onChange={e => setFormData({ ...formData, discountAmount: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Min. Purchase (₹)</label>
                                <input type="number" required value={formData.minPurchase} onChange={e => setFormData({ ...formData, minPurchase: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none text-sm" />
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-4 mt-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all">Create Coupon</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponForge;
