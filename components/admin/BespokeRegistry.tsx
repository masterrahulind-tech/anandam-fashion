
import React, { useState } from 'react';
import { useApp } from '../../App';
import { Ruler, Check, X, Scissors } from 'lucide-react';

const BespokeRegistry = () => {
    const { orders } = useApp();
    const bespokeOrders = orders.filter(o => o.items.some(i => i.isCustomized));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-serif italic text-slate-900">Bespoke Registry</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Custom Commissions & Measurements</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {bespokeOrders.length > 0 ? bespokeOrders.map(order => (
                    <div key={order.id} className="bg-white border border-slate-100 rounded-sm shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
                            <div>
                                <h3 className="font-serif italic text-lg">{order.userName}</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Order #{order.id}</p>
                            </div>
                            <span className="bg-gold/10 text-gold text-[9px] font-bold uppercase px-3 py-1 rounded-full">
                                {order.items.filter(i => i.isCustomized).length} Custom Pieces
                            </span>
                        </div>

                        <div className="space-y-6">
                            {order.items.filter(i => i.isCustomized).map((item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-6">
                                    <img src={item.images[0]} className="w-20 h-24 object-cover rounded-sm" alt="" />
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{item.name}</p>
                                            <p className="text-xs text-slate-500 italic mt-1">"Make it fit like a glove..."</p>
                                        </div>

                                        {item.customMeasurements && (
                                            <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
                                                <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                                    <Ruler size={12} /> Client Measurements (cm)
                                                </h4>
                                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                                    {Object.entries(item.customMeasurements).map(([key, val]) => (
                                                        <div key={key}>
                                                            <span className="block text-[9px] uppercase text-slate-400 mb-1">{key}</span>
                                                            <span className="font-serif italic font-bold text-slate-900">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {item.customNotes && (
                                            <div className="text-xs text-slate-600 bg-amber-50 p-3 rounded-sm border border-amber-100 italic">
                                                <span className="font-bold not-italic mr-2">Notes:</span>
                                                {item.customNotes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white border border-slate-100 p-20 text-center rounded-sm">
                        <Scissors className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="font-serif italic text-slate-400">No bespoke commissions pending.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BespokeRegistry;
