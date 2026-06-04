import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../App';

const CartPage = () => {
    const { cart, addToCart, removeFromCart, removeItem, products } = useApp();
    const navigate = useNavigate();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Shipping is now calculated at checkout based on address
    const total = subtotal;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="text-center space-y-8 max-w-md">
                    <div className="w-24 h-24 mx-auto bg-slate-50 rounded-full flex items-center justify-center">
                        <ShoppingBag size={48} className="text-slate-200" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-serif italic text-slate-800">Your Cart is Empty</h2>
                        <p className="text-sm text-slate-400 font-serif italic">Begin your luxury acquisition journey</p>
                    </div>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-lg"
                    >
                        Explore Collection <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#FCFBF7]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-6">
                        <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                            <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">Shopping Cart</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                            </p>
                        </div>

                        <div className="space-y-4">
                            {cart.map((item) => {
                                const product = products.find(p => p.id === item.id);
                                if (!product) return null;

                                return (
                                    <div
                                        key={`${item.id}-${item.selectedSize}`}
                                        className="bg-white border border-slate-100 rounded-sm p-4 md:p-6 hover:shadow-md transition-all"
                                    >
                                        <div className="flex gap-4 md:gap-6">
                                            {/* Product Image */}
                                            <Link
                                                to={`/product/${item.id}`}
                                                className="w-24 h-32 md:w-32 md:h-40 flex-shrink-0 overflow-hidden rounded-sm bg-slate-50"
                                            >
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                />
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="space-y-2">
                                                    <Link to={`/product/${item.id}`}>
                                                        <h3 className="text-sm md:text-base font-serif italic text-slate-900 hover:text-gold transition-colors">
                                                            {item.name}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{item.subCategory}</p>
                                                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                                        <span>Size: <span className="font-bold text-slate-900">{item.selectedSize}</span></span>
                                                        {item.selectedColor && <span>Color: <span className="font-bold text-slate-900">{item.selectedColor}</span></span>}
                                                        {item.isCustomized && (
                                                            <span className="px-2 py-1 bg-gold/10 text-gold text-[8px] font-bold uppercase tracking-wider rounded">
                                                                Bespoke
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price & Quantity Controls */}
                                                <div className="flex items-end justify-between mt-4">
                                                    <div className="space-y-2">
                                                        <p className="text-lg md:text-xl font-bold text-slate-900">
                                                            ₹{(item.price * item.quantity).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">₹{item.price.toLocaleString()} each</p>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center border border-slate-200 rounded-sm">
                                                            <button
                                                                onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                                                className="p-2 hover:bg-slate-50 transition-colors"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus size={14} className={item.quantity <= 1 ? 'text-slate-200' : 'text-slate-600'} />
                                                            </button>
                                                            <span className="px-4 text-sm font-bold text-slate-900 min-w-[40px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => addToCart(product, item.selectedSize, item.selectedColor)}
                                                                className="p-2 hover:bg-slate-50 transition-colors"
                                                                disabled={item.quantity >= item.stock}
                                                            >
                                                                <Plus size={14} className={item.quantity >= item.stock ? 'text-slate-200' : 'text-slate-600'} />
                                                            </button>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Continue Shopping */}
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-[400px] flex-shrink-0">
                        <div className="bg-white border border-slate-100 rounded-sm p-6 md:p-8 sticky top-32 space-y-6">
                            <h2 className="text-xl font-serif italic text-slate-900 border-b border-slate-50 pb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="font-bold text-slate-400 italic text-[10px]">
                                        Calculated at Checkout
                                    </span>
                                </div>
                                <p className="text-[9px] text-slate-400 italic">
                                    Dynamic shipping rates (₹60 - ₹120) based on distance
                                </p>
                                <div className="border-t border-slate-100 pt-4 flex justify-between">
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-900">Total</span>
                                    <span className="text-2xl font-bold text-slate-900">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-lg flex items-center justify-center gap-3"
                            >
                                Proceed to Checkout <ArrowRight size={14} />
                            </button>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">We Accept</p>
                                <div className="flex items-center gap-4 text-slate-300">
                                    <div className="text-[8px] font-bold uppercase tracking-wider">COD</div>
                                    <div className="text-[8px] font-bold uppercase tracking-wider">Cards</div>
                                    <div className="text-[8px] font-bold uppercase tracking-wider">UPI</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
