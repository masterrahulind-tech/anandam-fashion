
import React, { useState, useEffect } from 'react';
import { useApp } from '../../App';
import { updateSettings } from '../../services/firestoreService';
import { Save, Zap, Upload, AlertTriangle } from 'lucide-react';

const AdminSettings = () => {
    const { settings, setSettings } = useApp();
    const [form, setForm] = useState(settings);
    const [bulkData, setBulkData] = useState('');

    useEffect(() => {
        setForm(settings);
    }, [settings]);

    const handleSave = async () => {
        try {
            await updateSettings(form);
            setSettings(form);
            alert('Global configurations updated.');
        } catch (error) {
            console.error(error);
            alert('Failed to update settings.');
        }
    };

    const handleBulkImport = () => {
        // Placeholder for bulk import logic
        console.log("Importing:", bulkData);
        alert("Bulk import simulation: Data received. (Backend logic pending)");
        setBulkData('');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif italic text-slate-900">Atelier Configurations</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Global Toggles & Utilities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Festival Mode Engine */}
                <div className="bg-white border border-slate-100 rounded-sm p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-full ${form.festivalMode ? 'bg-gold text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif italic">Festival Sale Engine</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global Urgency Mode</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-sm">
                            <span className="font-bold text-sm text-slate-700">Activate Festival Mode</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={form.festivalMode} onChange={e => setForm({ ...form, festivalMode: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Festival Name</label>
                            <input
                                type="text"
                                value={form.festivalName || ''}
                                onChange={e => setForm({ ...form, festivalName: e.target.value })}
                                placeholder="e.g. Diwali Royal Edit"
                                className="w-full p-3 bg-slate-50 border-b border-slate-200 outline-none focus:border-gold font-serif italic"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Banner Message</label>
                            <input
                                type="text"
                                value={form.bannerMessage || ''}
                                onChange={e => setForm({ ...form, bannerMessage: e.target.value })}
                                placeholder="e.g. Exclusive 20% Off on all Silk Sarees"
                                className="w-full p-3 bg-slate-50 border-b border-slate-200 outline-none focus:border-gold font-serif italic"
                            />
                        </div>

                        <button onClick={handleSave} className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all flex items-center justify-center gap-2">
                            <Save size={14} /> Update Configuration
                        </button>
                    </div>
                </div>

                {/* Bulk Import Utility */}
                <div className="bg-white border border-slate-100 rounded-sm p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-full bg-slate-100 text-slate-600">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif italic">Bulk Archive Ingester</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Mass Inventory Sync</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-sm border border-amber-100 flex gap-3 text-amber-800 text-xs">
                            <AlertTriangle size={16} className="shrink-0" />
                            <p>Paste JSON array of products or external registry links. Ensure strict adherence to the schema.</p>
                        </div>
                        <textarea
                            value={bulkData}
                            onChange={e => setBulkData(e.target.value)}
                            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xs outline-none focus:border-gold resize-none"
                            placeholder='[{"name": "...", "price": 1000, ...}]'
                        ></textarea>
                        <button onClick={handleBulkImport} className="w-full border border-black text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
                            Sync Registry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
