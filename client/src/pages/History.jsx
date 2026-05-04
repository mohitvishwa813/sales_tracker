import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/config';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, getYear, getMonth } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter,
  ChevronRight,
  History as HistoryIcon,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

const History = () => {
  const [sales, setSales] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchSales();
  }, [filterType, selectedDate]);

  const fetchSales = async () => {
    setLoading(true);
    let start, end;
    const date = new Date(selectedDate);

    if (filterType === 'daily') {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else if (filterType === 'monthly') {
      start = startOfMonth(date);
      end = endOfMonth(date);
    } else {
      start = startOfYear(date);
      end = endOfYear(date);
    }
    try {
      const [salesRes, customersRes] = await Promise.all([
        api.get(`/sales?start=${start.toISOString()}&end=${end.toISOString()}`),
        api.get('/customers')
      ]);
      setSales(salesRes.data);

      const allDebts = [];
      customersRes.data.forEach(c => {
        c.debts.forEach(d => {
          if (d.status !== 'paid') {
            const dDate = new Date(d.date);
            if (dDate >= start && dDate <= end) {
              allDebts.push({
                _id: d._id,
                isDebt: true,
                customerName: c.name,
                productName: d.productName,
                amount: d.amount,
                date: d.date
              });
            }
          } else if (d.status === 'paid' && d.paidDate) {
            const pDate = new Date(d.paidDate);
            if (pDate >= start && pDate <= end) {
              let buyPrice = 0;
              if (d.productId && d.productId.buyPrice) {
                 let mrp = d.productId.mrp || d.amount;
                 let qty = Math.max(1, Math.round(d.amount / mrp));
                 buyPrice = d.productId.buyPrice * qty;
              }
              const profit = d.amount - buyPrice;

              allDebts.push({
                _id: d._id + '_paid',
                isDebtRepayment: true,
                customerName: c.name,
                productName: d.productName,
                productId: d.productId,
                amount: d.amount,
                profit: profit,
                date: d.paidDate
              });
            }
          }
        });
      });
      setDebts(allDebts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totals = sales.reduce((acc, s) => {
    acc.revenue += (s.sellingPrice * s.quantity);
    acc.profit += s.profit;
    return acc;
  }, { revenue: 0, profit: 0 });

  // Add repaid debt to revenue and profit
  debts.filter(d => d.isDebtRepayment).forEach(d => {
    totals.revenue += d.amount;
    totals.profit += d.profit;
  });

  // Add manual partial payments to revenue and profit
  debts.filter(d => d.isDebt && d.amount < 0).forEach(d => {
    totals.revenue += Math.abs(d.amount);
    totals.profit += Math.abs(d.amount);
  });

  // Only sum positive amounts for "Total Debt Recorded"
  const totalDebt = debts.filter(d => d.isDebt && d.amount > 0).reduce((acc, d) => acc + d.amount, 0);

  const combinedHistory = [...sales, ...debts].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">RETRIEVING AUDIT LOGS...</div>;

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Transaction Log</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 underline decoration-emerald-200 underline-offset-8">Historical Business Record</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm scale-90 md:scale-100 origin-right">
          {['daily', 'monthly', 'yearly'].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-6 py-2.5 rounded-xl text-[9px] uppercase font-black tracking-widest transition-all ${filterType === t ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          <div className="qb-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-8 border-l-blue-500 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <CalendarIcon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Archive Period</span>
                <input 
                  type="date" 
                  className="bg-transparent border-0 focus:ring-0 font-black text-xl text-slate-800 p-0 leading-none h-auto italic"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-10">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Entries</p>
                  <p className="text-xl font-black text-slate-800 italic">{sales.length}</p>
               </div>
               <div className="w-px h-10 bg-slate-100"></div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Period Status</p>
                  <p className={`text-xl font-black italic ${totals.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {totals.profit >= 0 ? 'PROFITABLE' : 'LOSS'}
                  </p>
               </div>
            </div>
          </div>

          <div className="qb-card p-0 overflow-hidden bg-white shadow-2xl border-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 whitespace-nowrap">Product Identity</th>
                    <th className="px-8 py-5 whitespace-nowrap">Volume</th>
                    <th className="px-8 py-5 whitespace-nowrap">Gross Revenue</th>
                    <th className="px-8 py-5 whitespace-nowrap text-right">Net Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {combinedHistory.map((item) => (
                    item.isDebt ? (
                      <tr key={item._id} className={`group hover:bg-slate-50 transition-all ${item.amount < 0 ? 'bg-emerald-50/20' : 'bg-red-50/20'}`}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm border ${item.amount < 0 ? 'border-emerald-100 text-emerald-600' : 'border-red-100 text-red-600'} flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform italic`}>
                              {item.amount < 0 ? 'P' : 'D'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 uppercase italic tracking-tighter text-base">{item.customerName} - {item.productName}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(item.date), 'MMM dd | hh:mm a')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest ${item.amount < 0 ? 'text-emerald-500 bg-emerald-100' : 'text-red-500 bg-red-100'}`}>
                            {item.amount < 0 ? 'PAYMENT' : 'DEBT'}
                          </span>
                        </td>
                        <td className={`px-8 py-6 whitespace-nowrap font-black text-xl italic tracking-tighter ${item.amount < 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {item.amount < 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase shadow-sm ${item.amount < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {item.amount < 0 ? '+' : '-'}₹{Math.abs(item.amount).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ) : item.isDebtRepayment ? (
                      <tr key={item._id} className="group hover:bg-slate-50 transition-all bg-emerald-50/20">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm group-hover:scale-110 transition-transform italic overflow-hidden">
                              {item.productId?.image ? (
                                 <img src={`${BASE_URL}/api/products/image/${item.productId.image}`} className="w-full h-full object-cover rounded-2xl" />
                              ) : item.productId?.name?.charAt(0) || 'R'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 uppercase italic tracking-tighter text-base">{item.customerName} - {item.productName}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(item.date), 'MMM dd | hh:mm a')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-100 px-3 py-1.5 rounded-full tracking-widest">---- (PAID DEBT)</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap font-black text-xl text-emerald-600 italic tracking-tighter">
                          +₹{item.amount.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase shadow-sm ${item.profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {item.profit >= 0 ? '+' : '-'}₹{Math.abs(item.profit).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={item._id} className="group hover:bg-slate-50 transition-all">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-emerald-600 text-sm group-hover:scale-110 transition-transform italic">
                              {item.productId?.image ? (
                                 <img src={`${BASE_URL}/api/products/image/${item.productId.image}`} className="w-full h-full object-cover rounded-2xl" />
                              ) : item.productId?.name?.charAt(0) || 'Ø'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 uppercase italic tracking-tighter text-base">{item.productId?.name || 'Unknown Item'}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(item.date), 'MMM dd | hh:mm a')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full tracking-widest">{item.quantity} UNIT</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap font-black text-xl text-slate-900 italic tracking-tighter">
                          ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase shadow-sm ${item.profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {item.profit >= 0 ? '+' : '-'}₹{Math.abs(item.profit).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                  {combinedHistory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-32 opacity-20 grayscale">
                        <HistoryIcon size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-[0.3em] italic">No transaction records found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="qb-card bg-emerald-600 text-white border-0 shadow-2xl p-10 flex flex-col justify-between min-h-[400px]">
             <div>
                <BarChart3 className="text-white/20 mb-8" size={64} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-200 mb-8 pb-4 border-b border-white/10">Summary Console</h3>
                
                <div className="space-y-10">
                   <div>
                      <p className="text-[9px] text-emerald-200/60 uppercase font-black mb-2 tracking-widest">Total Period Revenue</p>
                      <p className="text-4xl font-black italic tracking-tighter">₹{totals.revenue.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[9px] text-emerald-200/60 uppercase font-black mb-2 tracking-widest">Total Net Gain</p>
                      <p className={`text-5xl font-black italic tracking-tighter ${totals.profit < 0 ? 'text-red-400' : 'text-white'}`}>
                        {totals.profit >= 0 ? '+' : '-'}₹{Math.abs(totals.profit).toLocaleString()}
                      </p>
                   </div>
                   <div className="pt-4 border-t border-white/10 mt-4">
                      <p className="text-[9px] text-red-200/80 uppercase font-black mb-2 tracking-widest">Total Debt Recorded</p>
                      <p className="text-3xl font-black italic tracking-tighter text-red-100">₹{totalDebt.toLocaleString()}</p>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[9px] italic text-emerald-100 uppercase font-black tracking-tight leading-relaxed opacity-60">Calculated based on current MRP and historical Stock Costs.</p>
             </div>
          </div>

          <button 
            onClick={() => {
              setFilterType('daily');
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            }}
            className="w-full bg-white border border-slate-200 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/20 hover:shadow-xl transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <CalendarIcon size={20} />
              </div>
              <div className="text-left font-black italic uppercase">
                <p className="text-[8px] text-slate-400 tracking-widest leading-none mb-1">Action</p>
                <p className="text-sm text-slate-800">Jump to Today</p>
              </div>
            </div>
            <ChevronRight className="text-slate-200 group-hover:text-emerald-500 transition-colors" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
