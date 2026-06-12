import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/config';
import {
  Plus,
  Trash2,
  Package,
  Image as ImageIcon,
  X,
  TrendingDown,
  TrendingUp,
  Tag,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Layers,
  Pencil
} from 'lucide-react';

// Soft client-side cap — must match server's MAX_PRODUCTS_PER_USER. Server is
// the source of truth; this just disables the "Register Item" button early
// so users don't open a modal that will fail. The number itself is intentionally
// not shown anywhere in the UI per product spec.
const PRODUCT_CAP = 60;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    buyPrice: '',
    mrp: '',
    stockQuantity: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // null = adding new product. A product _id means modal is in edit mode.
  const [editingId, setEditingId] = useState(null);

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [activeImage, setActiveImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setNewProduct({ name: '', buyPrice: '', mrp: '', stockQuantity: '' });
    setImageFile(null);
    setPreviewUrl(null);
    setEditingId(null);
  };

  const openEditModal = (product) => {
    setNewProduct({
      name: product.name,
      buyPrice: product.buyPrice,
      mrp: product.mrp,
      stockQuantity: product.stockQuantity
    });
    setImageFile(null);
    // Show existing image as preview. Replaced if user picks a new file.
    setPreviewUrl(product.image ? `${BASE_URL}/api/products/image/${product.image}` : null);
    setEditingId(product._id);
    setIsAdding(true);
  };

  const closeModal = () => {
    setIsAdding(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('buyPrice', newProduct.buyPrice);
    formData.append('mrp', newProduct.mrp);
    formData.append('stockQuantity', newProduct.stockQuantity || 0);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product updated successfully!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product successfully added to Vault!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.code === 'PRODUCT_LIMIT_REACHED') {
        closeModal();
        showToast(err.response.data.msg, 'error');
        fetchProducts();
      } else {
        showToast(editingId ? 'Error updating product' : 'Error adding item to inventory', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to remove this item from your inventory?",
      onConfirm: async () => {
        try {
          await api.delete(`/products/${id}`);
          showToast('Product successfully removed!');
          fetchProducts();
        } catch (err) {
          console.error(err);
          showToast('Error removing product', 'error');
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">SCANNING INVENTORY...</div>;

  const atCapacity = products.length >= PRODUCT_CAP;

  const handleAddClick = () => {
    if (atCapacity) {
      showToast("You've reached your plan's product limit. Contact info@shoptracker.in to expand.", 'error');
      return;
    }
    setIsAdding(true);
  };

  return (
    <div className="pt-20 px-6 pb-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Inventory Vault</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 underline decoration-emerald-200 underline-offset-8">Product Catalog & Stock Controls</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700">
            <Layers size={14} className="text-emerald-600" />
            <span className="text-[11px] font-black uppercase tracking-widest">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <button
            onClick={handleAddClick}
            disabled={atCapacity}
            className="btn-primary py-4 px-10 flex items-center gap-3 text-[11px] tracking-[0.3em] font-black italic shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            title={atCapacity ? "You've reached your plan's product limit" : undefined}
          >
            <Plus size={20} strokeWidth={3} /> REGISTER ITEM
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-2xl max-h-[75vh] md:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-white">
            {/* 1. Static Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                {editingId ? 'Edit Item' : 'Registration Form'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-white text-slate-300 hover:text-red-500 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            {/* 2. Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Complete Product Name</label>
                    <input 
                      type="text" 
                      className="input-field py-4 font-black italic text-lg" 
                      placeholder="Enter unique product title..."
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Buy Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl font-black italic">₹</span>
                      <input 
                        type="number" 
                        className="input-field pl-10 py-4 font-black text-xl italic" 
                        placeholder="0.00"
                        value={newProduct.buyPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, buyPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Market MRP (Selling)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl font-black italic">₹</span>
                      <input 
                        type="number" 
                        className="input-field pl-10 py-4 font-black text-xl italic" 
                        placeholder="0.00"
                        value={newProduct.mrp}
                        onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Stock Count</label>
                    <input 
                      type="number" 
                      className="input-field py-4 font-black text-xl italic" 
                      placeholder="0 Units"
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Visual Identity</label>
                    <label className="cursor-pointer block bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      {previewUrl ? (
                         <div className="flex items-center justify-center gap-4">
                            <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-2xl shadow-lg ring-4 ring-white" />
                            <span className="text-[10px] font-black text-slate-400 uppercase italic">Replace Image</span>
                         </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <ImageIcon size={32} className="text-slate-300 mb-2" />
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Select Image Asset</span>
                          </div>
                        )}
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* 3. Static Footer (Buttons always visible) */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-end gap-5 flex-shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="btn-outline flex-1 md:flex-none py-4 px-10 border-0 font-black text-[10px] uppercase tracking-widest text-slate-400"
              >
                Cancel
              </button>
              <button
                form="productForm"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 md:flex-none py-4 px-14 text-[11px] font-black uppercase tracking-widest italic shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> {editingId ? 'UPDATING...' : 'SAVING...'}</>
                ) : (
                  editingId ? 'UPDATE ITEM' : 'SAVE TO VAULT'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
        {products.map((p) => (
          <div key={p._id} className="qb-card p-4 md:p-5 bg-white border-0 border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg hover:shadow-emerald-600/5 md:hover:shadow-2xl md:hover:-translate-y-1 group transition-all relative overflow-hidden flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0">
            {/* Image section */}
            <div className="relative w-20 h-20 md:w-full md:h-48 bg-slate-50 rounded-xl md:rounded-2xl overflow-hidden border border-slate-50 flex-shrink-0 flex items-center justify-center">
              {p.image ? (
                <img 
                  src={`${BASE_URL}/api/products/image/${p.image}`} 
                  alt={p.name} 
                  onClick={() => {
                    setImageLoading(true);
                    setActiveImage({ url: `${BASE_URL}/api/products/image/${p.image}`, name: p.name });
                  }}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                  title="Click to view full size"
                />
              ) : (
                <>
                  <Package size={32} className="text-slate-200 opacity-50 md:hidden" />
                  <Package size={48} className="text-slate-200 opacity-50 hidden md:block" />
                </>
              )}
            </div>

            {/* Action buttons (absolute on desktop, vertical bar on far right on mobile) */}
            <div className="flex flex-col gap-2 md:absolute md:top-3 md:right-3 md:flex-row opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-auto shrink-0 self-center md:self-start">
              <button
                onClick={() => openEditModal(p)}
                className="p-2 md:p-2.5 bg-slate-50 md:bg-white/95 text-slate-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm md:shadow-lg shadow-slate-900/10"
                title="Edit product"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="p-2 md:p-2.5 bg-red-50 md:bg-white/95 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm md:shadow-red-500/20"
                title="Delete product"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Product info section */}
            <div className="px-1 md:px-2 flex-1 space-y-1.5 md:space-y-3 min-w-0 md:mt-4">
              <h3 className="text-base md:text-lg font-black text-slate-900 uppercase italic tracking-tighter whitespace-nowrap overflow-x-auto no-scrollbar max-w-full">{p.name}</h3>
              <div className="inline-flex items-center gap-3">
                 <span className="text-[9px] md:text-[10px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-[0.1em]">
                   {p.stockQuantity} Units in Stock
                 </span>
              </div>

              {/* Mobile-only compact price/profit row */}
              <div className="flex md:hidden flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs">
                <span className="font-bold text-slate-500">Cost: <span className="font-black text-slate-700">₹{p.buyPrice.toLocaleString()}</span></span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-slate-500">MRP: <span className="font-black text-emerald-600">₹{p.mrp.toLocaleString()}</span></span>
                <span className="text-slate-300">|</span>
                <span className={`font-black ${p.mrp - p.buyPrice >= 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-100/50' : 'text-red-600 bg-red-50 border border-red-100/50'} px-2 py-0.5 rounded-md text-[9px]`}>
                  {p.mrp - p.buyPrice >= 0 ? '+' : ''}₹{(p.mrp - p.buyPrice).toLocaleString()}
                </span>
              </div>

              {/* Desktop-only prices grid */}
              <div className="hidden md:grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 mt-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5">Cost Basis</p>
                  <p className="text-lg md:text-xl font-black text-slate-600 tracking-tighter italic">₹{p.buyPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5">Market MRP</p>
                  <p className="text-lg md:text-xl font-black text-emerald-600 tracking-tighter italic">₹{p.mrp.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Desktop-only profit margin bar */}
            <div className="hidden md:flex mt-3 p-3 bg-emerald-50 rounded-xl items-center justify-between border border-emerald-100/50">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Profit Margin</span>
                <span className="text-[10px] font-bold text-emerald-800/60 uppercase">Per Unit</span>
              </div>
              <span className={`text-base md:text-lg font-black italic ${p.mrp - p.buyPrice >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {p.mrp - p.buyPrice >= 0 ? '+' : ''}₹{(p.mrp - p.buyPrice).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full border-4 border-dashed border-slate-100 rounded-[3rem] py-32 text-center bg-white/50 backdrop-blur-sm">
            <Package size={80} className="text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] italic text-sm">Inventory Vault is Empty</p>
            <button onClick={() => { resetForm(); setIsAdding(true); }} className="mt-8 text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest italic underline underline-offset-8">Register New Entry</button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300 font-bold tracking-widest text-[10px] uppercase ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-2 border-red-100' : 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight mb-2">Confirm Action</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">{confirmDialog.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })} className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-50 transition-all border-2 border-slate-100">
                Cancel
              </button>
              <button onClick={confirmDialog.onConfirm} className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20 transition-all">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Popup Image Card */}
      {activeImage && (
        <div 
          onClick={() => setActiveImage(null)} 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-lg w-full max-h-[85vh] flex flex-col relative border border-white animate-in zoom-in-95 duration-300 cursor-default"
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveImage(null)} 
              className="absolute top-4 right-4 z-50 p-2 bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-full transition-all backdrop-blur-sm cursor-pointer"
              title="Close image view"
            >
              <X size={20} />
            </button>
            
            {/* Image Container */}
            <div className="flex-1 bg-slate-50 flex items-center justify-center overflow-hidden min-h-[300px] relative">
              {imageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
                  <Loader2 className="animate-spin text-emerald-600" size={36} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Asset...</p>
                </div>
              )}
              <img 
                src={activeImage.url} 
                alt={activeImage.name} 
                onLoad={() => setImageLoading(false)}
                className={`max-w-full max-h-[70vh] object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              />
            </div>

            {/* Footer with Title */}
            <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight truncate pr-4">
                {activeImage.name}
              </h3>
              <button
                onClick={() => setActiveImage(null)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
