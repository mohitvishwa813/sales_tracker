import React, { useState, useEffect } from 'react';
import api from '../api/config';
import {
  ShoppingBag,
  Search,
  Plus,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const SalesEntry = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setSellingPrice(p.defaultSellingPrice);
    setSearch('');
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
    } finally {
      setLoading(false);
    }
  };

  const profit = selectedProduct ? (sellingPrice - selectedProduct.costPrice) * quantity : 0;
  const isLoss = profit < 0;
  const isBelowMin = selectedProduct && sellingPrice < selectedProduct.minPrice;

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 uppercase italic">Entry Console</h1>
        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs italic opacity-80 underline decoration-emerald-200 underline-offset-4">Record Financial Activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="glass-card shadow-lg bg-white border border-slate-100 p-8">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
              <input
                type="date"
                className="input-field w-full pl-14 text-lg font-black text-slate-800"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card shadow-lg bg-white border border-slate-100 p-8">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Find Product</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                className="input-field w-full pl-14 text-lg font-black text-slate-800"
                placeholder="Product Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <div className="mt-4 bg-white border border-slate-100 rounded-3xl max-h-60 overflow-y-auto shadow-2xl z-20">
                {filteredProducts.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full text-left px-6 py-4 hover:bg-emerald-50 border-b border-slate-50 last:border-0 transition-all flex justify-between items-center group"
                  >
                    <span className="font-black text-slate-700 tracking-tight text-lg group-hover:text-emerald-700 transition-colors uppercase italic">{p.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase font-black tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">Pick</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProduct ? (
            <div className="glass-card border-emerald-500/20 bg-emerald-50/20 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
              <div className="flex justify-between items-start mb-10 border-b border-emerald-50 pb-6">
                <h3 className="text-2xl font-black text-emerald-800 italic uppercase leading-none">{selectedProduct.name}</h3>
                <button onClick={() => setSelectedProduct(null)} className="text-[10px] text-emerald-600 hover:text-emerald-800 font-black uppercase tracking-widest underline underline-offset-4 decoration-emerald-200">Switch Item</button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="text-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Stock Cost</p>
                  <p className="text-sm font-black text-slate-900">₹{selectedProduct.costPrice}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-3xl shadow-sm border border-emerald-200">
                  <p className="text-[9px] uppercase font-black text-emerald-500 tracking-widest mb-1">Standard</p>
                  <p className="text-sm font-black text-emerald-700">₹{selectedProduct.defaultSellingPrice}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-3xl shadow-sm border border-amber-200">
                  <p className="text-[9px] uppercase font-black text-amber-600 tracking-widest mb-1">Safe Floor</p>
                  <p className="text-sm font-black text-amber-700">₹{selectedProduct.minPrice}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100 col-span-3">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Available Inventory</p>
                  <p className={`text-xl font-black ${selectedProduct.stock > 5 ? 'text-slate-900' : 'text-red-500 animate-pulse'}`}>
                    {selectedProduct.stock} Units Remaining
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddSale} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Actual Sale Price</label>
                  <input
                    type="number"
                    className={`input-field w-full text-center text-3xl font-black h-20 ${isBelowMin ? 'border-amber-400 ring-8 ring-amber-500/5' : ''}`}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    required
                  />
                  {isBelowMin && (
                    <div className="flex items-center gap-2 mt-4 text-amber-600 justify-center">
                      <AlertCircle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Critical: Below margin floor!</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Unit Quantity</label>
                  <input
                    type="number"
                    className="input-field w-full text-center text-3xl font-black h-20"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] mt-8 flex items-center justify-center gap-3">
                  {loading ? 'Finalizing...' : 'Log Transaction'}
                  {!loading && <Plus size={24} />}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card border-dashed border-slate-200 flex flex-col items-center justify-center py-24 bg-white shadow-xl opacity-80">
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <ShoppingBag size={64} className="text-slate-200" />
              </div>
              <p className="text-slate-400 text-xs font-black italic uppercase tracking-widest opacity-50">Choose and Item above</p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className={`glass-card relative overflow-hidden transition-all duration-700 bg-slate-900 text-white border-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ${selectedProduct ? 'opacity-100 scale-100 lg:translate-x-0' : 'opacity-20 scale-95 lg:translate-x-4 pointer-events-none'}`}>
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
              {isLoss ? <TrendingDown size={140} className="text-red-500" /> : <TrendingUp size={140} className="text-emerald-500" />}
            </div>

            <h3 className="text-[10px] font-black mb-12 text-slate-500 uppercase tracking-[0.4em] border-b border-white/5 pb-6 inline-block">Real-time Performance</h3>

            <div className="space-y-12 relative z-10">
              <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Gross Earning</p>
                  <p className="text-4xl font-black text-white italic tracking-tighter">₹{(sellingPrice * quantity) || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest text-right">Net Buffer</p>
                  <p className={`text-5xl font-black italic ${isLoss ? 'text-red-500' : 'text-emerald-400'} drop-shadow-lg`}>
                    {isLoss ? '-' : '+'}₹{Math.abs(profit)}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 border border-white/5 ring-1 ring-white/5">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${isLoss ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {isLoss ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
                </div>
                <div>
                  <p className="text-xs font-black text-white tracking-[0.1em] uppercase">
                    {isLoss ? "Profitability Critical" : "Positive Momentum"}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic mt-2 uppercase tracking-tight opacity-70">
                    {isLoss
                      ? "Attention! This price configuration is detrimental to operations."
                      : "The current pricing structure maintains healthy operating margins."
                    }
                  </p>
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
