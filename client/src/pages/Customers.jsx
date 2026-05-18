import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/config';
import { Users, Plus, Save, User as UserIcon, CreditCard, ChevronRight, X, Search, Package, Trash2, AlertCircle, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState('');

  // New Customer Form
  const [newCustomer, setNewCustomer] = useState({ name: '', number: '' });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Debt Form: list of line items. Each {productId?, productName, amount}.
  // Submitted as N independent debt records on the customer (one POST each).
  const [debtItems, setDebtItems] = useState([]);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '' });
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    setDebtItems(prev => [...prev, { productId: p._id, productName: p.name, amount: p.mrp }]);
    setSearch('');
    setShowDropdown(false);
  };

  const handleAddCustomItem = () => {
    const name = search.trim();
    if (!name) return;
    setDebtItems(prev => [...prev, { productName: name, amount: '' }]);
    setSearch('');
    setShowDropdown(false);
  };

  const updateItemAmount = (index, value) => {
    setDebtItems(prev => prev.map((it, i) => i === index ? { ...it, amount: value } : it));
  };

  const removeItem = (index) => {
    setDebtItems(prev => prev.filter((_, i) => i !== index));
  };

  const debtTotal = debtItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const closeDebtModal = () => {
    setShowDebtModal(false);
    setDebtItems([]);
    setSearch('');
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(newCustomer.number)) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    setIsSavingCustomer(true);
    try {
      await api.post('/customers', newCustomer);
      setShowAddModal(false);
      setNewCustomer({ name: '', number: '' });
      showToast('Customer created successfully!');
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || 'Error creating customer', 'error');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (debtItems.length === 0) {
      showToast('Add at least one item to the debt', 'error');
      return;
    }
    const bad = debtItems.find(it => !it.productName.trim() || Number(it.amount) <= 0);
    if (bad) {
      showToast('Every item needs a name and an amount above 0', 'error');
      return;
    }
    setIsAddingDebt(true);
    try {
      // Backend accepts one debt at a time; post sequentially so a mid-loop
      // failure leaves earlier items already saved (visible to the user on retry).
      for (const item of debtItems) {
        await api.post(`/customers/${selectedCustomer._id}/debts`, {
          productName: item.productName,
          productId: item.productId,
          amount: Number(item.amount),
        });
      }
      const count = debtItems.length;
      closeDebtModal();
      showToast(`${count} debt ${count === 1 ? 'item' : 'items'} added!`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showToast('Error adding debt', 'error');
    } finally {
      setIsAddingDebt(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setIsAddingPayment(true);
    try {
      await api.post(`/customers/${selectedCustomer._id}/debts`, {
        productName: 'Payment Received',
        amount: -Math.abs(Number(paymentForm.amount))
      });
      setShowPaymentModal(false);
      setPaymentForm({ amount: '' });
      showToast('Payment recorded successfully!');
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showToast('Error recording payment', 'error');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleDeleteCustomer = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to completely remove this customer and their debt history?",
      onConfirm: async () => {
        try {
          await api.delete(`/customers/${id}`);
          showToast('Customer removed successfully!');
          fetchCustomers();
        } catch (err) {
          console.error(err);
          showToast('Error removing customer', 'error');
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleDeleteDebt = (customerId, debtId) => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to remove this specific debt record?",
      onConfirm: async () => {
        try {
          await api.delete(`/customers/${customerId}/debts/${debtId}`);
          showToast('Debt record removed!');
          fetchCustomers();
        } catch (err) {
          console.error(err);
          showToast('Error removing debt record', 'error');
        }
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || 
    c.number.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center font-bold text-slate-300">Loading Customers...</div>;

  return (
    <div className="pt-20 px-6 pb-6 md:p-10 space-y-8 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">Customers</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Manage Directory & Debts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-600/20"
        >
          <Plus size={16} />
          New Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name or number..."
          value={searchCustomer}
          onChange={e => setSearchCustomer(e.target.value)}
          className="w-full bg-white border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-emerald-500 font-bold shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => (
          <div key={c._id} className="qb-card p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase italic tracking-tight">{c.name}</h3>
                  <p className="text-xs font-bold text-slate-400">{c.number}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteCustomer(c._id)} 
                className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                title="Remove Customer"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Debt</span>
              <span className="text-xl font-black text-red-500">₹{c.totalDebt?.toLocaleString() || 0}</span>
            </div>

            {c.debts && c.debts.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto pr-1">
                {c.debts.map(debt => (
                  <div key={debt._id} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{debt.productName}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(debt.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-sm italic ${debt.amount < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {debt.amount < 0 ? '+' : ''}₹{Math.abs(debt.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setSelectedCustomer(c); setShowDebtModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <CreditCard size={14} /> Add Debt
              </button>
              <button
                onClick={() => { setSelectedCustomer(c); setShowPaymentModal(true); }}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <CheckCircle2 size={14} /> Add Payment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Customer</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={newCustomer.number}
                  onChange={e => setNewCustomer({...newCustomer, number: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  placeholder="10-digit number"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingCustomer}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingCustomer ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : (
                  <><Save size={16} /> Save Customer</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showDebtModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Add Debt</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">For {selectedCustomer.name}</p>
              </div>
              <button onClick={closeDebtModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddDebt} className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Add Items</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    autoComplete="off"
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && search.trim() && filteredProducts.length === 0) {
                        e.preventDefault();
                        handleAddCustomItem();
                      }
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500 font-bold"
                    placeholder="Search inventory or type a custom item..."
                  />
                </div>

                {showDropdown && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl max-h-60 overflow-y-auto shadow-2xl z-[100] animate-in slide-in-from-top-2">
                    <div className="p-2 sticky top-0 bg-white border-b border-slate-50 flex justify-between items-center px-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</span>
                       <button type="button" onClick={() => setShowDropdown(false)} className="text-slate-300 hover:text-red-500 p-1">
                          <X size={14} />
                       </button>
                    </div>
                    {filteredProducts.map(p => (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => handleSelectProduct(p)}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-slate-50 last:border-0 transition-all flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center font-bold text-red-600 text-xs italic overflow-hidden">
                              {p.image ? (
                                <img src={`${BASE_URL}/api/products/image/${p.image}`} alt={p.name} className="h-full w-full object-cover" />
                              ) : p.name.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm group-hover:text-red-700">{p.name}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Stock: {p.stockQuantity}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-700">₹{p.mrp}</p>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                       <div className="p-4">
                          {search.trim() ? (
                            <button
                              type="button"
                              onClick={handleAddCustomItem}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs uppercase tracking-widest transition-all"
                            >
                              <Plus size={14} /> Add "{search.trim()}" as custom item
                            </button>
                          ) : (
                            <div className="text-center opacity-30 grayscale">
                              <Package size={24} className="mx-auto mb-2" />
                              <p className="text-[9px] font-black uppercase">No items found</p>
                            </div>
                          )}
                       </div>
                    )}
                  </div>
                )}
              </div>

              {debtItems.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Items ({debtItems.length})</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {debtItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2">
                        <span className="flex-1 text-sm font-bold text-slate-800 truncate">{item.productName}</span>
                        <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-slate-200">
                          <span className="text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={item.amount}
                            onChange={(e) => updateItemAmount(idx, e.target.value)}
                            className="w-20 bg-transparent text-sm font-black text-red-600 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-3 py-3 bg-red-50 rounded-xl border-2 border-red-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                    <span className="text-lg font-black text-red-600 italic">₹{debtTotal}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingDebt || debtItems.length === 0}
                className="w-full bg-red-500 hover:bg-red-400 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingDebt ? (
                  <><Loader2 size={16} className="animate-spin" /> Adding…</>
                ) : (
                  <><Plus size={16} /> Add {debtItems.length > 0 ? `${debtItems.length} ` : ''}Debt {debtItems.length > 1 ? 'Records' : 'Record'}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-600">Add Payment</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">For {selectedCustomer.name}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-emerald-600"
                  placeholder="Enter amount paid"
                />
              </div>
              <button
                type="submit"
                disabled={isAddingPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingPayment ? (
                  <><Loader2 size={16} className="animate-spin" /> Recording…</>
                ) : (
                  <><CheckCircle2 size={16} /> Record Payment</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

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

export default Customers;
