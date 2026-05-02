import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/config';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Calendar,
  X,
  Package,
  TrendingUp,
  TrendingDown,
  Lock,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const SalesEntry = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setSellingPrice(p.mrp);
    setSearch('');
    setShowDropdown(false);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/sales', {
        productId: selectedProduct._id,
        sellingPrice: Number(sellingPrice),
        quantity: Number(quantity),
        date: new Date(saleDate)
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error recording sale');
    } finally {
      setLoading(false);
    }
  };

  const unitProfit = selectedProduct ? (Number(sellingPrice) - selectedProduct.buyPrice) : 0;
  const totalProfit = unitProfit * quantity;
  const isLoss = totalProfit < 0;

  if (user?.status !== 'VIP') {
    return (
      <div className="p-8 max-w-5xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500 shadow-inner">
            <Lock size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">Feature Locked</h1>
          <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
            The manual Sale Entry tool is an advanced feature reserved exclusively for our VIP users.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary w-full py-4 text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-emerald-500/20">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">New Sale Entry</h1>
        <p className="text-slate-500">Record a new transaction to track your business profit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="qb-card p-8 bg-white relative">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      className="input-field pl-12 font-bold"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Product</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className="input-field pl-12 font-bold"
                      placeholder="Click to browse or search..."
                      value={search}
                      autoComplete="off"
                      onFocus={() => setShowDropdown(true)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                    />
                  </div>
                </div>
             </div>

             {/* Dynamic Product Dropdown */}
             {showDropdown && (
              <div className="absolute left-8 right-8 mt-2 bg-white border border-slate-200 rounded-2xl max-h-80 overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] animate-in slide-in-from-top-2">
                <div className="p-2 sticky top-0 bg-white border-b border-slate-50 flex justify-between items-center px-4">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Selection</span>
                   <button onClick={() => setShowDropdown(false)} className="text-slate-300 hover:text-red-500 p-1">
                      <X size={14} />
                   </button>
                </div>
                {filteredProducts.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full text-left px-5 py-4 hover:bg-emerald-50 border-b border-slate-50 last:border-0 transition-all flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-emerald-600 italic">
                          {p.image ? (
                            <img src={`${BASE_URL}/api/products/image/${p.image}`} alt={p.name} className="h-full w-full object-cover" />
                          ) : p.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-800 transition-colors group-hover:text-emerald-700">{p.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Stock: {p.stockQuantity}</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-slate-700">₹{p.mrp}</p>
                       <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-1 rounded uppercase font-black tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">Select</span>
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                   <div className="p-10 text-center opacity-30 grayscale">
                      <Package size={32} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase">No items found</p>
                   </div>
                )}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="qb-card border-l-4 border-l-emerald-600 animate-in slide-in-from-bottom-5 duration-300 bg-white shadow-lg p-8">
              <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-bold text-emerald-600 text-xl italic overflow-hidden">
                    {selectedProduct.image ? <img src={`${BASE_URL}/api/products/image/${selectedProduct.image}`} className="w-full h-full object-cover" /> : selectedProduct.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Cost: ₹{selectedProduct.buyPrice} · System MRP: ₹{selectedProduct.mrp}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-bold">₹</span>
                    <input 
                      type="number" 
                      className="input-field pl-12 py-6 text-2xl font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-200"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      required
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Quantity</label>
                  <input 
                    type="number" 
                    className="input-field py-6 text-2xl font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/5 text-center"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <button type="submit" disabled={loading} className="w-full btn-primary py-5 text-base tracking-[0.1em] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? (
                      <><Loader2 size={24} className="animate-spin" /> Processing Transaction...</>
                    ) : (
                      <><Plus size={24} /> Confirm Sale Record</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`qb-card transition-all duration-700 bg-white shadow-xl ${selectedProduct ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4">Revenue Estimate</h3>
             
             <div className="space-y-8">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-2">Total Earning</p>
                  <p className="text-4xl font-black text-slate-900 italic tracking-tighter">₹{(Number(sellingPrice) * quantity) || 0}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Net Profit</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isLoss ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {isLoss ? 'At Loss' : 'Healthy'}
                    </span>
                  </div>
                  <p className={`text-5xl font-black italic tracking-tighter ${isLoss ? 'text-red-500' : 'text-emerald-700'}`}>
                    {isLoss ? '-' : '+'}₹{Math.abs(totalProfit).toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLoss ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                     {isLoss ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                   </div>
                   <div className="text-[11px] font-bold text-slate-500 italic leading-relaxed">
                     {isLoss 
                       ? "Caution: Selling below stock value." 
                       : "Transaction maintains positive operating margin."
                     }
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesEntry;
