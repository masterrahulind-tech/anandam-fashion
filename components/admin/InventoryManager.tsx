
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../App';
import { addProduct, updateProduct, deleteProduct } from '../../services/firestoreService';
import { uploadFileToStorage } from '../../services/storageService';
import { Save, Trash2, Search, Plus, X, Image as ImageIcon, Ruler, Tag, AlertCircle, UploadCloud } from 'lucide-react';
import { Product, Category } from '../../types';

const INITIAL_FORM: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'ratings' | 'numReviews'> = {
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'Women',
    subCategory: '',
    images: [''],
    sizes: ['S', 'M', 'L'],
    colors: [],
    stock: 1,
    isOffer: false,
    isCustomizable: false
};

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const InventoryManager = () => {
    const { products, setProducts } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<Category>('Women');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    // Sync URL state with Form state
    useEffect(() => {
        const action = searchParams.get('action');
        const editId = searchParams.get('editId');

        if (action === 'add') {
            setEditingId(null);
            setFormData(INITIAL_FORM);
            setIsFormOpen(true);
        } else if (editId) {
            const product = products.find(p => p.id === editId);
            if (product) {
                const { id, createdAt, reviews, ratings, numReviews, ...rest } = product;
                setFormData(rest);
                setEditingId(editId);
                setIsFormOpen(true);
            } else {
                setIsFormOpen(false);
            }
        } else {
            setIsFormOpen(false);
            setEditingId(null);
        }
    }, [searchParams, products]);

    const handleOpenAdd = () => {
        setSearchParams({ action: 'add' });
    };

    const handleOpenEdit = (id: string) => {
        setSearchParams({ editId: id });
    };

    const handleCloseForm = () => {
        setSearchParams({});
    };

    const filteredProducts = products.filter(p =>
        p.category === activeTab &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );



    const handleDelete = async (id: string) => {
        if (window.confirm("Permanently delete this item from the registry?")) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete product.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Clean up images array (remove empty strings)
            const cleanData = {
                ...formData,
                images: formData.images.filter(img => img.trim() !== '')
            };

            if (editingId) {
                await updateProduct(editingId, cleanData);
                setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...cleanData } : p));
            } else {
                const newId = await addProduct({ ...cleanData, reviews: [], ratings: 0, numReviews: 0 } as any);
                setProducts(prev => [{ ...cleanData, id: newId, reviews: [], ratings: 0, numReviews: 0, createdAt: new Date().toISOString() } as Product, ...prev]);
            }
            handleCloseForm();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save product.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingIndex(index);
        try {
            const downloadUrl = await uploadFileToStorage(file, 'products');
            handleImageChange(index, downloadUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file.");
        } finally {
            setUploadingIndex(null);
        }
    };

    const addImageField = () => {
        if (formData.images.length < 5) {
            setFormData({ ...formData, images: [...formData.images, ''] });
        }
    };

    const toggleSize = (size: string) => {
        if (size === 'Free Size') {
            setFormData({ ...formData, sizes: ['Free Size'] });
        } else {
            let newSizes = formData.sizes.includes('Free Size') ? [] : [...formData.sizes];
            if (newSizes.includes(size)) {
                newSizes = newSizes.filter(s => s !== size);
            } else {
                newSizes.push(size);
            }
            setFormData({ ...formData, sizes: newSizes });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-serif italic text-slate-900">Archive Registry</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Inventory Control</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-sm px-3 py-2 flex-1 md:w-64">
                        <Search size={14} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search collection..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 text-xs outline-none bg-transparent font-serif italic"
                        />
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-black text-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> Add Piece
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
                {(['Women', 'Girls', 'Children'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-sm shadow-sm hover:shadow-md transition-all group relative">
                        <div className="aspect-[3/4] relative overflow-hidden bg-slate-50">
                            {p.images[0] ? (
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                            )}
                            {p.stock < 5 && (
                                <div className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-bold uppercase px-2 py-1 rounded-sm shadow-sm flex items-center gap-1">
                                    <AlertCircle size={8} /> Low Stock: {p.stock}
                                </div>
                            )}
                            {p.isOffer && (
                                <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold uppercase px-2 py-1 rounded-sm shadow-sm">
                                    Sale
                                </div>
                            )}
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-serif italic text-slate-900 line-clamp-1">{p.name}</h3>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{p.subCategory}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(p.id)} className="text-slate-400 hover:text-black"><Tag size={14} /></button>
                                    <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <span className="font-bold text-sm">₹{p.price.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase">{p.sizes.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-serif italic">{editingId ? 'Edit Masterpiece' : 'Commission New Piece'}</h2>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                    {editingId ? `Ref: #${editingId}` : 'New Inventory Entry'}
                                </p>
                            </div>
                            <button onClick={handleCloseForm} className="text-slate-400 hover:text-black"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Piece Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-50 font-serif italic border-b border-transparent focus:border-gold outline-none" placeholder="e.g. The Royal Banarasi" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Sub-Category</label>
                                        <input required type="text" value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value })} className="w-full p-3 bg-slate-50 font-serif italic border-b border-transparent focus:border-gold outline-none" placeholder="e.g. Silk Sarees" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Segment</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })} className="w-full p-3 bg-slate-50 text-sm border-b border-transparent focus:border-gold outline-none">
                                                <option value="Women">Women</option>
                                                <option value="Girls">Girls</option>
                                                <option value="Children">Children</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Stock Level</label>
                                            <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full p-3 bg-slate-50 text-sm border-b border-transparent focus:border-gold outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Description</label>
                                    <textarea required rows={8} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-slate-50 font-serif italic text-sm border-b border-transparent focus:border-gold outline-none resize-none" placeholder="Describe the craftsmanship..." />
                                </div>
                            </div>

                            {/* Pricing & Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Selling Price (₹)</label>
                                        <input required type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-3 bg-white text-sm border border-slate-200 focus:border-gold outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">MSRP (Original) (₹)</label>
                                        <input required type="number" min="0" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })} className="w-full p-3 bg-white text-sm border border-slate-200 focus:border-gold outline-none" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.isOffer} onChange={e => setFormData({ ...formData, isOffer: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <div>
                                            <span className="block text-xs font-bold uppercase tracking-widest">Activate Offer Badge</span>
                                            <span className="text-[9px] text-slate-400">Shows "SALE" and strike-through price</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.isCustomizable} onChange={e => setFormData({ ...formData, isCustomizable: e.target.checked })} className="w-4 h-4 accent-black" />
                                        <div>
                                            <span className="block text-xs font-bold uppercase tracking-widest">Enable Customization</span>
                                            <span className="text-[9px] text-slate-400">Allows users to input measurements</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Media Gallery (URL or File)</label>
                                    <button type="button" onClick={addImageField} disabled={formData.images.length >= 5} className="text-[9px] font-bold uppercase tracking-widest text-gold hover:text-black disabled:opacity-50">+ Add View</button>
                                </div>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="text"
                                                value={img}
                                                onChange={e => handleImageChange(idx, e.target.value)}
                                                placeholder={`Media URL ${idx + 1}`}
                                                className="flex-1 p-3 bg-slate-50 text-xs border-b border-transparent focus:border-gold outline-none font-mono"
                                            />
                                            <div className="relative flex items-center justify-center">
                                                <input 
                                                    type="file" 
                                                    id={`file-upload-${idx}`}
                                                    onChange={(e) => handleFileUpload(idx, e)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={uploadingIndex === idx}
                                                />
                                                <button type="button" title="Upload File" className={`p-3 bg-slate-100 rounded-sm text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center ${uploadingIndex === idx ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <UploadCloud size={16} />
                                                    {uploadingIndex === idx && <span className="ml-2 text-[10px] font-bold">...</span>}
                                                </button>
                                            </div>
                                            {img && (
                                                <div className="w-10 h-10 border border-slate-200 rounded-sm overflow-hidden flex-shrink-0 bg-slate-50">
                                                    {img.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || img.includes('firebasestorage') ? (
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-[8px] text-slate-400 font-bold uppercase bg-slate-100">File</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sizes */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Available Sizes</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_SIZES.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-4 py-2 text-xs font-bold border transition-all ${formData.sizes.includes(size)
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="space-y-4">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Available Colors (Comma Separated)</label>
                                <input
                                    type="text"
                                    value={formData.colors?.join(', ') || ''}
                                    onChange={e => setFormData({ ...formData, colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })}
                                    className="w-full p-3 bg-slate-50 text-xs border-b border-transparent focus:border-gold outline-none"
                                    placeholder="e.g. Ruby Red, Emerald Green, Gold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all disabled:opacity-50 sticky bottom-0 shadow-2xl"
                            >
                                {loading ? 'Saving...' : editingId ? 'Update Masterpiece' : 'AddTo Registry'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
