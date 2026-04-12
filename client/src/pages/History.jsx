import React, { useState, useEffect } from 'react';
import api from '../api/config';
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
      const res = await api.get(`/sales?start=${start.toISOString()}&end=${end.toISOString()}`);
      setSales(res.data);
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
                    <th className="px-8 py-5">Product Identity</th>
                    <th className="px-8 py-5">Volume</th>
                    <th className="px-8 py-5">Gross Revenue</th>
                    <th className="px-8 py-5 text-right">Net Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="group hover:bg-slate-50 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-emerald-600 text-sm group-hover:scale-110 transition-transform italic">
                            {sale.productId?.image ? (
                               <img src={`http://localhost:5000/api/products/image/${sale.productId.image}`} className="w-full h-full object-cover rounded-2xl" />
                            ) : sale.productId?.name?.charAt(0) || 'Ø'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 uppercase italic tracking-tighter text-base">{sale.productId?.name || 'Unknown Item'}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(sale.date), 'MMM dd | hh:mm a')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full tracking-widest">{sale.quantity} UNIT</span>
                      </td>
                      <td className="px-8 py-6 font-black text-xl text-slate-900 italic tracking-tighter">
                        ₹{(sale.sellingPrice * sale.quantity).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase shadow-sm ${sale.profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {sale.profit >= 0 ? '+' : '-'}₹{Math.abs(sale.profit).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
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
