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
  AlertTriangle
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    buyPrice: '',
    mrp: '',
    stockQuantity: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

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

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('buyPrice', newProduct.buyPrice);
    formData.append('mrp', newProduct.mrp);
    formData.append('stockQuantity', newProduct.stockQuantity || 0);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsAdding(false);
      setNewProduct({ name: '', buyPrice: '', mrp: '', stockQuantity: '' });
      setImageFile(null);
      setPreviewUrl(null);
      showToast('Product successfully added to Vault!');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Error adding item to inventory', 'error');
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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Inventory Vault</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 underline decoration-emerald-200 underline-offset-8">Product Catalog & Stock Controls</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn-primary py-4 px-10 flex items-center gap-3 text-[11px] tracking-[0.3em] font-black italic shadow-2xl"
        >
          <Plus size={20} strokeWidth={3} /> REGISTER ITEM
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-2xl max-h-[75vh] md:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-white">
            {/* 1. Static Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Registration Form</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white text-slate-300 hover:text-red-500 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            {/* 2. Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form id="productForm" onSubmit={handleAdd} className="space-y-8">
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
                onClick={() => setIsAdding(false)} 
                className="btn-outline flex-1 md:flex-none py-4 px-10 border-0 font-black text-[10px] uppercase tracking-widest text-slate-400"
              >
                Abort
              </button>
              <button 
                form="productForm"
                type="submit" 
                className="btn-primary flex-1 md:flex-none py-4 px-14 text-[11px] font-black uppercase tracking-widest italic shadow-xl shadow-emerald-600/20"
              >
                SAVE TO VAULT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-32">
        {products.map((p) => (
          <div key={p._id} className="qb-card p-8 bg-white border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 group transition-all relative overflow-hidden flex flex-col">
            <div className="mb-8 relative h-64 w-full bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-50 flex items-center justify-center">
               {p.image ? (
                  <img src={`${BASE_URL}/api/products/image/${p.image}`} alt={p.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <Package size={80} className="text-slate-200 opacity-50" />
                )}
                <button 
                  onClick={() => handleDelete(p._id)} 
                  className="absolute top-6 right-6 p-4 bg-red-500 text-white rounded-2xl opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-600 transition-all shadow-xl shadow-red-500/30"
                >
                  <Trash2 size={18} />
                </button>
            </div>

            <div className="px-2 flex-1 space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter line-clamp-2">{p.name}</h3>
              <div className="inline-flex items-center gap-3">
                 <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-[0.1em]">
                   {p.stockQuantity} Units in Stock
                 </span>
              </div>

              <div className="grid grid-cols-2 gap-10 pt-8 border-t border-slate-50 mt-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cost Basis</p>
                  <p className="text-2xl font-black text-slate-600 tracking-tighter italic">₹{p.buyPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Market MRP</p>
                  <p className="text-2xl font-black text-emerald-600 tracking-tighter italic">₹{p.mrp.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-emerald-50 rounded-[2rem] flex items-center justify-between border border-emerald-100/50">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Est. Profit Margin</span>
                <span className="text-xs font-bold text-emerald-800/60 uppercase">Per Unit</span>
              </div>
              <span className={`text-xl font-black italic ${p.mrp - p.buyPrice >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {p.mrp - p.buyPrice >= 0 ? '+' : ''}₹{(p.mrp - p.buyPrice).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full border-4 border-dashed border-slate-100 rounded-[3rem] py-32 text-center bg-white/50 backdrop-blur-sm">
            <Package size={80} className="text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] italic text-sm">Inventory Vault is Empty</p>
            <button onClick={() => setIsAdding(true)} className="mt-8 text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest italic underline underline-offset-8">Register New Entry</button>
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
    </div>
  );
};

export default Products;
