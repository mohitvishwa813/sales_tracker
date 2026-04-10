import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Package2,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    costPrice: '',
    defaultSellingPrice: '',
    minPrice: '',
    stock: '',
    maxDiscount: 0
  });

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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      setIsAdding(false);
      setNewProduct({ name: '', costPrice: '', defaultSellingPrice: '', minPrice: '', maxDiscount: 0 });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    costPrice: '',
    defaultSellingPrice: '',
    minPrice: '',
    stock: ''
  });

  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      name: product.name,
      costPrice: product.costPrice,
      defaultSellingPrice: product.defaultSellingPrice,
      minPrice: product.minPrice,
      stock: product.stock
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${editingId}`, editData);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">Syncing Catalog...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Product Catalog</h2>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs italic opacity-80">Master Data Management System</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn-primary flex items-center gap-3"
          >
            <Plus size={20} />
            Create Product
          </button>
        )}
      </div>

      <div className="space-y-10">
        {(isAdding || editingId) && (
          <div className="glass-card border-emerald-500/20 bg-emerald-50/10 animate-in slide-in-from-top-10 duration-500">
            <h3 className="text-xl font-black text-slate-800 uppercase italic mb-8 border-b border-slate-100 pb-4">
              {editingId ? 'Modify Record' : 'New Item Registration'}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-2">Display Name</label>
                <input 
                  type="text" 
                  className="input-field w-full"
                  value={editingId ? editData.name : newProduct.name}
                  onChange={(e) => editingId ? setEditData({ ...editData, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-2">Base Cost</label>
                <input 
                  type="number" 
                  className="input-field w-full"
                  value={editingId ? editData.costPrice : newProduct.costPrice}
                  onChange={(e) => editingId ? setEditData({ ...editData, costPrice: e.target.value }) : setNewProduct({ ...newProduct, costPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-2">Target Price</label>
                <input 
                  type="number" 
                  className="input-field w-full"
                  value={editingId ? editData.defaultSellingPrice : newProduct.defaultSellingPrice}
                  onChange={(e) => editingId ? setEditData({ ...editData, defaultSellingPrice: e.target.value }) : setNewProduct({ ...newProduct, defaultSellingPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-2">Floor Price</label>
                <input 
                  type="number" 
                  className="input-field w-full"
                  value={editingId ? editData.minPrice : newProduct.minPrice}
                  onChange={(e) => editingId ? setEditData({ ...editData, minPrice: e.target.value }) : setNewProduct({ ...newProduct, minPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 ml-2">Units In Stock</label>
                <input 
                  type="number" 
                  className="input-field w-full"
                  value={editingId ? editData.stock : newProduct.stock}
                  onChange={(e) => editingId ? setEditData({ ...editData, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-end gap-3">
                <button type="submit" className="flex-1 btn-primary py-4">
                  {editingId ? 'Update' : 'Register'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-card p-0 overflow-hidden border-0 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Base Cost</th>
                <th className="px-8 py-6">Target Price</th>
                <th className="px-8 py-6">Safe Floor</th>
                <th className="px-8 py-6">Units</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-emerald-50/20 transition-all group animate-in fade-in slide-in-from-left-4">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 transition-all font-black text-lg group-hover:scale-110 italic border-l-4 border-l-emerald-500">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-slate-800 uppercase tracking-tight italic group-hover:text-emerald-700">{p.name}</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Asset ID: {p._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-700">₹{p.costPrice}</td>
                  <td className="px-8 py-6 font-black text-emerald-600 drop-shadow-sm text-lg italic">₹{p.defaultSellingPrice}</td>
                  <td className="px-8 py-6 font-black text-amber-600/80 italic">₹{p.minPrice}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.stock > 10 ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600 animate-pulse border border-red-100'}`}>
                      {p.stock} Units
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-30 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEdit(p)}
                        className={`p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 transform hover:scale-110 active:scale-95 transition-all shadow-sm ${editingId === p._id ? 'text-emerald-600 border-emerald-200' : ''}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transform hover:scale-110 active:scale-95 transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-24 text-slate-300 italic uppercase font-black tracking-widest text-sm opacity-50">Empty Inventory Database</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
