import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, Banknote, Plus, Check, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../../App';
import { Address, Order } from '../../types';
import { createOrder, updateOrderPaymentStatus } from '../../services/firestoreService';
import { calculateShipping } from '../../utils/shippingUtils';

import { fetchLocationFromPincode } from '../../utils/addressUtils';

const CheckoutPage = () => {
    const { cart, user, setUser, clearCart, addOrder } = useApp();
    const navigate = useNavigate();

    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Prepaid' | 'Card'>('COD');
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<Address>>({
        type: 'Home',
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (cart.length === 0) {
            navigate('/cart');
            return;
        }
        // Set default address if available
        if (user.addresses && user.addresses.length > 0) {
            const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setSelectedAddress(defaultAddr);
        }
    }, [user, cart, navigate]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : calculateShipping(selectedAddress?.zipCode);
    const discount = 0; // Can be enhanced with coupon logic
    const total = subtotal + shipping - discount;

    const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 6);
        setNewAddress(prev => ({ ...prev, zipCode: val }));
        
        if (val.length === 6) {
            const location = await fetchLocationFromPincode(val);
            if (location) {
                setNewAddress(prev => ({ ...prev, city: location.city, state: location.state }));
            }
        }
    };

    const handleAddAddress = () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
            alert('Please fill all address fields including name and phone');
            return;
        }

        const address: Address = {
            id: Date.now().toString(),
            type: newAddress.type as 'Home' | 'Work' | 'Other',
            name: newAddress.name,
            phone: newAddress.phone,
            street: newAddress.street,
            city: newAddress.city,
            state: newAddress.state,
            zipCode: newAddress.zipCode,
            country: newAddress.country || 'India',
            isDefault: user?.addresses?.length === 0
        };

        setUser({
            ...user!,
            addresses: [...(user?.addresses || []), address]
        });

        setSelectedAddress(address);
        setIsAddingAddress(false);
        setNewAddress({ type: 'Home', name: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', zipCode: '', country: 'India' });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        setLoading(true);

        try {
            const deliveryName = selectedAddress.name || user!.name;
            const deliveryPhone = selectedAddress.phone || user!.phone || '9999999999';

            const orderData = {
                userId: user!.id,
                userName: deliveryName,
                userEmail: user!.email,
                userPhone: deliveryPhone,
                items: cart,
                subtotal,
                shipping,
                discount,
                giftCardApplied: 0,
                total,
                status: 'Processing' as const,
                paymentMethod,
                paymentStatus: 'Pending' as const,
                date: new Date().toLocaleDateString('en-IN'),
                createdAt: new Date().toISOString(),
                trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                address: selectedAddress as Extract<Order['address'], typeof selectedAddress>
            };

            if (paymentMethod === 'COD') {
                const orderId = await createOrder(orderData);
                const order = { id: orderId, ...orderData };
                addOrder(order);
                clearCart();
                setLoading(false);
                navigate(`/order-confirmation/${order.id}`);
            } else {
                // Online Payment via Cashfree
                const { httpsCallable } = await import('firebase/functions');
                const { functions } = await import('../../firebase');
                const { getCashfree } = await import('../../utils/cashfree');

                const createCFOrder = httpsCallable(functions, 'createCashfreeOrder');
                
                // 1. We save the pending order in Firestore first so we have an ID
                const orderId = await createOrder(orderData);

                // 2. Get Session ID from Cloud Function
                const result = await createCFOrder({
                    orderId: orderId,
                    orderAmount: orderData.total,
                    customerDetails: {
                        id: user!.id,
                        name: deliveryName,
                        email: user!.email,
                        phone: deliveryPhone
                    }
                });

                const data = result.data as any;
                const paymentSessionId = data.paymentSessionId;

                // 3. Open Cashfree Checkout Modal
                const cashfree = await getCashfree();
                
                cashfree.checkout({
                    paymentSessionId: paymentSessionId,
                    redirectTarget: "_modal"
                }).then(async (cfResult: any) => {
                    if (cfResult.error) {
                        // User closed the modal or payment failed
                        console.error('Cashfree Error:', cfResult.error);
                        
                        await updateOrderPaymentStatus(orderId, 'Failed');
                        
                        const order = { id: orderId, ...orderData, paymentStatus: 'Failed' as const };
                        addOrder(order);
                        clearCart();
                        setLoading(false);
                        navigate(`/order-confirmation/${orderId}`);
                    }
                    if (cfResult.paymentDetails) {
                        // Success!
                        await updateOrderPaymentStatus(orderId, 'Paid');
                         
                        const order = { id: orderId, ...orderData, paymentStatus: 'Paid' as const };
                        addOrder(order);
                        clearCart();
                        setLoading(false);
                        navigate(`/order-confirmation/${orderId}`);
                    }
                });
            }
        } catch (error: any) {
            console.error('Error placing order:', error);
            alert(`Failed to initiate payment: ${error.message}`);
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-[#FCFBF7]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900 mb-12">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Checkout Flow */}
                    <div className="flex-1 space-y-8">
                        {/* Step 1: Delivery Address */}
                        <div className="bg-white border border-slate-100 rounded-sm p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                <h2 className="text-xl font-serif italic text-slate-900">Delivery Address</h2>
                            </div>

                            <div className="space-y-4">
                                {user.addresses?.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr)}
                                        className={`border-2 rounded-sm p-4 cursor-pointer transition-all ${selectedAddress?.id === addr.id
                                            ? 'border-gold bg-gold/5'
                                            : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedAddress?.id === addr.id ? 'border-gold bg-gold' : 'border-slate-300'
                                                }`}>
                                                {selectedAddress?.id === addr.id && <Check size={12} className="text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                                        {addr.type}
                                                    </span>
                                                    {addr.isDefault && (
                                                        <span className="text-[8px] font-bold uppercase tracking-wider text-gold">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-900 font-medium">{addr.name || user.name}</p>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                                </p>
                                                {(addr.phone || user.phone) && <p className="text-sm text-slate-500 mt-1">Phone: {addr.phone || user.phone}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isAddingAddress ? (
                                    <div className="border border-slate-200 rounded-sm p-4 space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Add New Address</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={newAddress.type}
                                                onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'Home' | 'Work' | 'Other' })}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold md:col-span-2"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={newAddress.name}
                                                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                value={newAddress.phone}
                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/[^0-9]/g, '') })}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                                                maxLength={10}
                                            />
                                            <input
                                                type="text"
                                                placeholder="ZIP / Pincode"
                                                value={newAddress.zipCode}
                                                onChange={handleZipChange}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold md:col-span-2"
                                                maxLength={6}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Street Address"
                                                value={newAddress.street}
                                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold md:col-span-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                className="p-3 border border-slate-200 rounded-sm text-sm outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleAddAddress}
                                                className="px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                                            >
                                                Save Address
                                            </button>
                                            <button
                                                onClick={() => setIsAddingAddress(false)}
                                                className="px-6 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:border-slate-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingAddress(true)}
                                        className="w-full border-2 border-dashed border-slate-200 rounded-sm p-4 flex items-center justify-center gap-2 text-slate-400 hover:border-gold hover:text-gold transition-all"
                                    >
                                        <Plus size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Add New Address</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Payment Method */}
                        <div className="bg-white border border-slate-100 rounded-sm p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                <h2 className="text-xl font-serif italic text-slate-900">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                {/* COD */}
                                <div
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`border-2 rounded-sm p-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-gold bg-gold/5' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-gold bg-gold' : 'border-slate-300'
                                            }`}>
                                            {paymentMethod === 'COD' && <Check size={12} className="text-white" />}
                                        </div>
                                        <Banknote size={20} className="text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                                            <p className="text-[10px] text-slate-500">Pay when you receive</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Prepaid (UPI/Net Banking) */}
                                <div
                                    onClick={() => setPaymentMethod('Prepaid')}
                                    className={`border-2 rounded-sm p-4 cursor-pointer transition-all ${paymentMethod === 'Prepaid' ? 'border-gold bg-gold/5' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Prepaid' ? 'border-gold bg-gold' : 'border-slate-300'
                                            }`}>
                                            {paymentMethod === 'Prepaid' && <Check size={12} className="text-white" />}
                                        </div>
                                        <Wallet size={20} className="text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">UPI / Net Banking</p>
                                            <p className="text-[10px] text-slate-500">Pay online securely</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card */}
                                <div
                                    onClick={() => setPaymentMethod('Card')}
                                    className={`border-2 rounded-sm p-4 cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-gold bg-gold/5' : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Card' ? 'border-gold bg-gold' : 'border-slate-300'
                                            }`}>
                                            {paymentMethod === 'Card' && <Check size={12} className="text-white" />}
                                        </div>
                                        <CreditCard size={20} className="text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">Credit / Debit Card</p>
                                            <p className="text-[10px] text-slate-500">Visa, Mastercard, Amex</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400">
                                <Lock size={12} />
                                <span>Your payment information is secure and encrypted</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-[400px] flex-shrink-0">
                        <div className="bg-white border border-slate-100 rounded-sm p-6 md:p-8 sticky top-32 space-y-6">
                            <h2 className="text-xl font-serif italic text-slate-900 border-b border-slate-50 pb-4">
                                Order Summary
                            </h2>

                            {/* Items */}
                            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                                        <img src={item.images[0]} className="w-16 h-20 object-cover rounded-sm" alt={item.name} />
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-serif italic text-slate-900 line-clamp-1">{item.name}</h4>
                                            <p className="text-[9px] text-slate-400">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                                            <p className="text-sm font-bold text-slate-900 mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="font-bold text-slate-900">
                                        {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Discount</span>
                                        <span className="font-bold text-green-600">-₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-100 pt-3 flex justify-between">
                                    <span className="text-base font-bold uppercase tracking-widest text-slate-900">Total</span>
                                    <span className="text-2xl font-bold text-slate-900">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={!selectedAddress || loading}
                                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Place Order <ChevronRight size={14} />
                                    </>
                                )}
                            </button>

                            {/* Trust Indicators */}
                            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-50 text-slate-300">
                                <ShieldCheck size={16} />
                                <Lock size={16} />
                                <CreditCard size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
