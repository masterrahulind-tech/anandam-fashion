import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { useApp } from '../../App';

const OrderConfirmationPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { orders } = useApp();
    const navigate = useNavigate();
    const [showConfetti, setShowConfetti] = useState(true);

    const order = orders.find(o => o.id === orderId);
    const isFailed = order?.paymentStatus === 'Failed';

    useEffect(() => {
        if (!order) {
            navigate('/profile');
        }
        // Hide confetti after animation
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, [order, navigate]);

    if (!order) return null;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#FCFBF7] relative overflow-hidden">
            {/* Confetti Effect */}
            {showConfetti && !isFailed && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-gold opacity-70 animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}px`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Status Message */}
                <div className="text-center space-y-6 mb-12">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${isFailed ? 'bg-red-50' : 'bg-green-50'}`}>
                        {isFailed ? (
                            <div className="text-red-500 font-serif italic text-4xl">!</div>
                        ) : (
                            <CheckCircle size={48} className="text-green-500" />
                        )}
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900">
                            {isFailed ? 'Payment Failed' : 'Order Confirmed!'}
                        </h1>
                        <p className="text-sm text-slate-500 font-serif italic">
                            {isFailed 
                                ? 'Your order is pending. Please try completing the payment again from your profile.'
                                : 'Thank you for your luxury acquisition'
                            }
                        </p>
                    </div>
                    <div className="inline-block bg-white border border-slate-100 rounded-sm px-6 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Order ID</p>
                        <p className="text-2xl font-bold text-slate-900">{order.id}</p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white border border-slate-100 rounded-sm p-6 md:p-8 space-y-8">
                    {/* Delivery Information */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-serif italic text-slate-900 border-b border-slate-50 pb-3">
                            Delivery Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivering To</p>
                                <p className="text-sm font-bold text-slate-900">{order.userName}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {typeof order.address === 'string'
                                        ? order.address
                                        : `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zipCode}`
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Estimated Delivery</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {estimatedDelivery.toLocaleDateString('en-IN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">7-10 business days</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-serif italic text-slate-900 border-b border-slate-50 pb-3">
                            Order Items
                        </h2>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-3 bg-slate-50 rounded-sm">
                                    <img src={item.images[0]} className="w-16 h-20 object-cover rounded-sm" alt={item.name} />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-serif italic text-slate-900">{item.name}</h4>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Size: {item.selectedSize}{item.selectedColor ? ` | Color: ${item.selectedColor}` : ''} | Qty: {item.quantity}
                                        </p>
                                        {item.isCustomized && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-gold/10 text-gold text-[8px] font-bold uppercase tracking-wider rounded">
                                                Bespoke
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-serif italic text-slate-900 border-b border-slate-50 pb-3">
                            Payment Summary
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-bold text-slate-900">₹{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Shipping</span>
                                <span className="font-bold text-slate-900">
                                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString()}`}
                                </span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Discount</span>
                                    <span className="font-bold text-green-600">-₹{order.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-100 pt-3 flex justify-between">
                                <span className="text-base font-bold uppercase tracking-widest text-slate-900">Total Paid</span>
                                <span className="text-2xl font-bold text-slate-900">₹{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-bold uppercase tracking-wider">
                                    {order.paymentMethod}
                                </span>
                                <span>•</span>
                                <span className={order.paymentStatus === 'Paid' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Information */}
                    <div className="bg-gold/5 border border-gold/20 rounded-sm p-4">
                        <div className="flex items-start gap-3">
                            <Package size={20} className="text-gold mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 mb-1">Tracking Number</p>
                                <p className="text-sm text-slate-600 font-mono">{order.trackingNumber}</p>
                                <p className="text-[10px] text-slate-500 mt-2">
                                    You will receive tracking updates via email
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                    <Link
                        to="/profile"
                        className="inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-lg"
                    >
                        <Package size={14} />
                        View My Orders
                    </Link>
                    <Link
                        to="/shop"
                        className="inline-flex items-center justify-center gap-3 border-2 border-slate-200 text-slate-700 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:border-gold hover:text-gold transition-all"
                    >
                        Continue Shopping <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
        </div>
    );
};

export default OrderConfirmationPage;
