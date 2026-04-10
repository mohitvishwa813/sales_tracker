import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, getYear, getMonth } from 'date-fns';
import { 
  Calendar, 
  Search, 
  Filter,
  ChevronRight,
  History as HistoryIcon,
  ShoppingBag
} from 'lucide-react';

const History = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('daily'); // daily, monthly, yearly
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - i);

  useEffect(() => {
    fetchSales();
  }, [filterType, selectedDate, selectedMonth, selectedYear]);

  const fetchSales = async () => {
    setLoading(true);
    let start, end;

    if (filterType === 'daily') {
      start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
    } else if (filterType === 'monthly') {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      start = startOfMonth(firstDay);
      end = endOfMonth(firstDay);
    } else if (filterType === 'yearly') {
      const firstDay = new Date(selectedYear, 0, 1);
      start = startOfYear(firstDay);
      end = endOfYear(firstDay);
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">Retrieving Records...</div>;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Journal Archive</h2>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px] italic opacity-80 underline decoration-emerald-200 underline-offset-4 decoration-2">Business Transaction History</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-3xl border border-slate-100 shadow-sm">
          {['daily', 'monthly', 'yearly'].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-6 py-3 rounded-[1.25rem] text-[10px] uppercase font-black tracking-widest transition-all ${filterType === t ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-emerald-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-card shadow-lg bg-white border border-slate-100 p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="text-emerald-500" size={20} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Observation Period</span>
                {filterType === 'daily' && (
                  <input 
                    type="date" 
                    className="bg-transparent border-0 focus:ring-0 font-black text-xl text-slate-800 p-0 leading-none h-auto"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                )}
                {filterType === 'monthly' && (
                  <p className="font-black text-xl text-slate-800 uppercase italic">{months[selectedMonth]} {selectedYear}</p>
                )}
                {filterType === 'yearly' && (
                  <p className="font-black text-xl text-slate-800 uppercase italic">Year Of {selectedYear}</p>
                )}
              </div>
            </div>

            {filterType === 'monthly' && (
              <div className="hidden sm:flex flex-wrap gap-1 max-w-xs justify-end">
                {months.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(idx)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border ${selectedMonth === idx ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 font-bold'}`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-0 overflow-hidden border-0 shadow-2xl bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6">Identity / Sequence</th>
                  <th className="px-8 py-6">Volume</th>
                  <th className="px-8 py-6">Gross Flow</th>
                  <th className="px-8 py-6 text-right">Net Buffer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sales.map((sale) => (
                  <tr key={sale._id} className="group hover:bg-emerald-50/20 transition-all cursor-pointer" onClick={() => {
                    setSelectedDate(format(new Date(sale.date), 'yyyy-MM-dd'));
                    setFilterType('daily');
                  }}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-emerald-600 text-lg group-hover:scale-110 transition-transform italic border-l-4 border-l-emerald-500">
                          {sale.productId?.name?.charAt(0) || 'Ø'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase italic tracking-tighter text-lg">{sale.productId?.name || 'Unknown Item'}</span>
                          <span className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{format(new Date(sale.date), 'MMM dd | hh:mm a')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full tracking-[0.1em]">{sale.quantity} UNIT</span>
                    </td>
                    <td className="px-8 py-6 font-black text-xl text-slate-900 tracking-tighter italic">
                      ₹{sale.sellingPrice * sale.quantity}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] font-black text-xs uppercase shadow-sm border-2 ${sale.profit >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-emerald-500/5' : 'bg-red-50 text-red-600 border-red-100/50 shadow-red-500/5'}`}>
                        {sale.profit >= 0 ? '+' : ''}₹{Math.abs(sale.profit)}
                      </div>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-32">
                      <div className="p-8 bg-slate-50 rounded-full inline-block mb-6 opacity-20 ring-1 ring-slate-200">
                        <HistoryIcon size={64} className="text-slate-400" />
                      </div>
                      <p className="font-black uppercase tracking-[0.3em] italic text-slate-300">Archive matches zero results</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card bg-slate-900 text-white border-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-10 border-b border-white/5 pb-6">Summary Console</p>
            <div className="space-y-10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black mb-3 tracking-widest">Total Period Revenue</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">₹{totals.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black mb-3 tracking-widest">Total Operating Buffer</p>
                <p className={`text-5xl font-black italic tracking-tighter ${totals.profit < 0 ? 'text-red-500' : 'text-emerald-400'} drop-shadow-xl`}>
                   ₹{totals.profit.toLocaleString()}
                </p>
                <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-[10px] italic text-slate-400 uppercase font-black tracking-tight leading-relaxed">System Analysis: {totals.profit >= 0 ? "The current period maintains a growth-positive posture." : "Critical deficit detected in current interval."}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setFilterType('daily');
              setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            }}
            className="w-full bg-white border border-slate-100 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/20 hover:shadow-xl transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quick Action</p>
                <p className="text-sm font-black text-slate-800 uppercase italic">Snap to Today</p>
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
