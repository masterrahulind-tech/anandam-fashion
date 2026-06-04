
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../App';
import { updateOrderStatus, updateOrderTracking, shipOrder } from '../../services/firestoreService';
import { CheckCircle, Clock, Truck, XCircle, Search, Eye, AlertTriangle } from 'lucide-react';
import { Order } from '../../types';

const OrderSymphony = () => {
    const { orders, setOrders } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewOrder, setViewOrder] = useState<Order | null>(null);
    const [trackingInput, setTrackingInput] = useState({ number: '', courier: '' });
    const [isSavingTracking, setIsSavingTracking] = useState(false);

    // Shipping Modal State
    const [orderToShip, setOrderToShip] = useState<Order | null>(null);
    const [shipInfo, setShipInfo] = useState({ courier: '', number: '' });

    // Sync URL state with viewOrder
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId) {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                setViewOrder(order);
                setTrackingInput({
                    number: order.trackingNumber || '',
                    courier: order.courierName || ''
                });
            } else {
                setViewOrder(null);
            }
        } else {
            setViewOrder(null);
        }
    }, [searchParams, orders]);

    const handleViewOrder = (order: Order) => {
        setSearchParams({ orderId: order.id });
    };

    const handleCloseModal = () => {
        setSearchParams({});
    };

    const filteredOrders = orders.filter(o =>
        (statusFilter === 'All' || o.status === statusFilter) &&
        (o.id.includes(searchTerm) || o.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleStatusUpdate = async (id: string, newStatus: Order['status']) => {
        try {
            await updateOrderStatus(id, newStatus);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            if (viewOrder && viewOrder.id === id) setViewOrder({ ...viewOrder, status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleTrackingUpdate = async () => {
        if (!viewOrder) return;
        setIsSavingTracking(true);
        try {
            await updateOrderTracking(viewOrder.id, trackingInput.number, trackingInput.courier);
            setOrders(prev => prev.map(o => o.id === viewOrder.id ? {
                ...o,
                trackingNumber: trackingInput.number,
                courierName: trackingInput.courier
            } : o));
            alert("Tracking info updated successfully.");
        } catch (error) {
            console.error("Failed to update tracking", error);
            alert("Failed to update tracking info.");
        } finally {
            setIsSavingTracking(false);
        }
    };

    const handleShipClick = (order: Order) => {
        setOrderToShip(order);
        setShipInfo({
            courier: order.courierName || '',
            number: order.trackingNumber || ''
        });
    };

    const handleConfirmShip = async () => {
        if (!orderToShip) return;
        if (!shipInfo.courier || !shipInfo.number) {
            alert("Please provide both Courier Name and Tracking Number to ship.");
            return;
        }

        setIsSavingTracking(true);
        try {
            await shipOrder(orderToShip.id, shipInfo.number, shipInfo.courier);
            setOrders(prev => prev.map(o => o.id === orderToShip.id ? {
                ...o,
                status: 'Shipped',
                trackingNumber: shipInfo.number,
                courierName: shipInfo.courier
            } : o));

            if (viewOrder && viewOrder.id === orderToShip.id) {
                setViewOrder({
                    ...viewOrder,
                    status: 'Shipped',
                    trackingNumber: shipInfo.number,
                    courierName: shipInfo.courier
                });
            }

            setOrderToShip(null);
            alert("Order marked as Shipped.");
        } catch (error) {
            console.error("Failed to ship order", error);
            alert("Failed to mark order as shipped.");
        } finally {
            setIsSavingTracking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-serif italic text-slate-900">Order Symphony</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Lifecycle Pipeline</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-3 py-2 w-full md:w-64">
                    <Search size={14} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search order ID or Client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 text-xs outline-none bg-transparent font-serif italic"
                    />
                </div>
            </div>

            {/* Pipeline Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status as any)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${statusFilter === status ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="bg-white border border-slate-100 rounded-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Stage</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</td>
                                    <td className="p-4 font-serif italic text-slate-900">{order.userName}</td>
                                    <td className="p-4 text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-sm">₹{order.total.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            {order.status === 'Processing' && (
                                                <>
                                                    <button
                                                        onClick={() => handleShipClick(order)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all"
                                                        title="Mark as Shipped"
                                                    >
                                                        <Truck size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                                        title="Cancel Order"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-all"
                                                    title="Complete Delivery"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => handleViewOrder(order)} className="p-2 hover:text-gold hover:bg-slate-50 rounded-full transition-all">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 font-serif italic">No orders in this pipeline stage.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Order Modal */}
            {viewOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-black z-10 bg-white/80 p-1 rounded-full">
                            <XCircle size={24} />
                        </button>

                        {/* Order Details Column */}
                        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-slate-100">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-serif italic">Order Dossier</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Ref: #{viewOrder.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Client Details</h4>
                                    <p className="text-sm"><span className="text-slate-400 text-xs">Name:</span> {viewOrder.userName}</p>
                                    <div className="text-sm">
                                        <span className="text-slate-400 text-xs">Shipping To:</span>
                                        <p className="font-serif italic text-slate-600 mt-1">{viewOrder.address}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Pipeline Control</h4>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleStatusUpdate(viewOrder.id, 'Processing')} className={`text-left px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${viewOrder.status === 'Processing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Clock size={14} className="inline mr-2" /> Processing</button>
                                        {viewOrder.status === 'Processing' ? (
                                            <button onClick={() => handleShipClick(viewOrder)} className="text-left px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"><Truck size={14} className="inline mr-2" /> Mark as Shipped</button>
                                        ) : (
                                            <button onClick={() => handleStatusUpdate(viewOrder.id, 'Shipped')} className={`text-left px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${viewOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><Truck size={14} className="inline mr-2" /> Mark as Shipped</button>
                                        )}
                                        <button onClick={() => handleStatusUpdate(viewOrder.id, 'Delivered')} className={`text-left px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${viewOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><CheckCircle size={14} className="inline mr-2" /> Complete Delivery</button>
                                        <button onClick={() => handleStatusUpdate(viewOrder.id, 'Cancelled')} className={`text-left px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${viewOrder.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><XCircle size={14} className="inline mr-2" /> Cancel Piece</button>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Logistics Control</h4>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold uppercase text-slate-400">Courier Service</label>
                                                <input
                                                    type="text"
                                                    value={trackingInput.courier}
                                                    onChange={e => setTrackingInput({ ...trackingInput, courier: e.target.value })}
                                                    className="w-full p-2 bg-slate-50 text-xs border border-transparent focus:border-gold outline-none rounded-sm"
                                                    placeholder="e.g. Delhivery, BlueDart"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold uppercase text-slate-400">Tracking Number</label>
                                                <input
                                                    type="text"
                                                    value={trackingInput.number}
                                                    onChange={e => setTrackingInput({ ...trackingInput, number: e.target.value })}
                                                    className="w-full p-2 bg-slate-50 text-xs border border-transparent focus:border-gold outline-none rounded-sm"
                                                    placeholder="Enter AWB Number"
                                                />
                                            </div>
                                            <button
                                                onClick={handleTrackingUpdate}
                                                disabled={isSavingTracking}
                                                className="w-full bg-slate-900 text-white py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50"
                                            >
                                                {isSavingTracking ? 'Saving...' : 'Update Logistics'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Commissioned Pieces</h4>
                                <div className="space-y-3">
                                    {viewOrder.items.map((item, i) => (
                                        <div key={i} className="flex gap-4 py-2">
                                            <img src={item.images[0]} className="w-12 h-16 object-cover rounded-sm" alt="" />
                                            <div className="flex-1">
                                                <p className="font-serif italic text-sm text-slate-900">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">Size: {item.selectedSize}{item.selectedColor ? ` | Color: ${item.selectedColor}` : ''} | Qty: {item.quantity}</p>
                                                {item.isCustomized && (
                                                    <span className="inline-block mt-1 bg-gold/10 text-gold text-[8px] font-bold uppercase px-2 py-0.5 rounded-sm">Bespoke</span>
                                                )}
                                            </div>
                                            <p className="font-bold text-sm">₹{item.price.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar (Dossier Footer) */}
                        <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2">Acquisition Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span>₹{viewOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Shipping</span>
                                        <span>₹{viewOrder.shipping.toLocaleString()}</span>
                                    </div>
                                    {viewOrder.discount > 0 && (
                                        <div className="flex justify-between text-xs text-green-600">
                                            <span>Boutique Discount</span>
                                            <span>-₹{viewOrder.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Total Valuation</span>
                                    <span className="text-2xl font-serif italic text-slate-900">₹{viewOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-white p-3 border border-slate-200 rounded-sm">
                                    Paid via {viewOrder.paymentMethod}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Shipping Info Collection Modal */}
            {orderToShip && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOrderToShip(null)} />
                    <div className="relative bg-white w-full max-w-md p-8 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setOrderToShip(null)} className="absolute top-4 right-4 text-slate-400 hover:text-black">
                            <XCircle size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-serif italic text-slate-900">Ship Commission</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Order: {orderToShip.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-sm flex gap-3 mb-6">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                            <p className="text-[10px] leading-relaxed text-amber-800 font-medium">
                                Tracking information is required to notify the customer and mark this order as active in transit.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Logistics Partner</label>
                                <input
                                    type="text"
                                    value={shipInfo.courier}
                                    onChange={e => setShipInfo({ ...shipInfo, courier: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none text-sm font-serif italic"
                                    placeholder="e.g. Delhivery, BlueDart, Ecom Express"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">AWB / Tracking Number</label>
                                <input
                                    type="text"
                                    value={shipInfo.number}
                                    onChange={e => setShipInfo({ ...shipInfo, number: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border-b border-transparent focus:border-gold outline-none text-sm font-mono"
                                    placeholder="Enter Tracking ID..."
                                />
                            </div>
                            <button
                                onClick={handleConfirmShip}
                                disabled={isSavingTracking}
                                className="w-full bg-black text-white py-4 mt-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all disabled:opacity-50"
                            >
                                {isSavingTracking ? 'Finalizing Shipment...' : 'Confirm Shipment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderSymphony;
