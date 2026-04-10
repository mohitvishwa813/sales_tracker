import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle,
  History as HistoryIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, subValue, subColor }) => (
  <div className="glass-card bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
    <div className={`p-4 rounded-3xl bg-${color}-50 text-${color}-600 mb-4 shadow-sm border border-${color}-100`}>
      {icon}
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
    {subValue && (
      <span className={`mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight bg-${subColor}-50 text-${subColor}-600 border border-${subColor}-100`}>
        {subValue}
      </span>
    )}
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState({ totalSales: 0, totalProfit: 0, itemCount: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, salesRes, productsRes] = await Promise.all([
          api.get('/sales/summary/daily'),
          api.get('/sales?limit=5'),
          api.get('/products')
        ]);
        setSummary(sumRes.data);
        setRecentSales(salesRes.data.slice(0, 5));
        setLowStockCount(productsRes.data.filter(p => p.stock < 10).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">Syncing Intelligence...</div>;

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Market Overview</h2>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs italic">{format(new Date(), 'MMMM do, yyyy')}</p>
        </div>
        <button 
          onClick={() => navigate('/history')}
          className="w-full md:w-auto p-4 bg-white border border-slate-100 rounded-3xl shadow-sm text-slate-400 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
        >
          <HistoryIcon size={20} />
          <span className="md:hidden font-black uppercase text-xs">View History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Daily Revenue" 
          value={`₹${summary.totalSales.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="emerald"
          subValue={summary.itemCount > 0 ? "Trading Active" : "No Activity"}
          subColor="emerald"
        />
        <StatCard 
          title="Net Profits" 
          value={`₹${summary.totalProfit.toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          color="emerald"
          subValue={summary.totalProfit < 0 ? 'Margin Risk' : 'Healthy'}
          subColor={summary.totalProfit < 0 ? 'red' : 'emerald'}
        />
        <StatCard 
          title="Stock Flow" 
          value={`${summary.itemCount} Units`}
          icon={<ShoppingCart size={24} />}
          color="amber"
          subValue={lowStockCount > 0 ? `${lowStockCount} Items Low` : "Stock Stable"}
          subColor={lowStockCount > 0 ? "red" : "amber"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card bg-white border-0 shadow-2xl">
          <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Latest Entries</h3>
            <button onClick={() => navigate('/history')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:underline underline-offset-4 decoration-emerald-200">History Feed</button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale._id} className="flex items-center justify-between p-4 rounded-[2rem] hover:bg-emerald-50 transition-all group cursor-pointer border border-transparent hover:border-emerald-100 shadow-sm bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-emerald-600 text-lg group-hover:scale-110 transition-transform italic">
                    {sale.productId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-tight italic">{sale.productId?.name || 'Item'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{format(new Date(sale.date), 'hh:mm a')} · {sale.quantity} UNIT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-lg tracking-tighter">₹{sale.sellingPrice * sale.quantity}</p>
                  <p className={`text-[10px] font-black uppercase tracking-tight mt-0.5 px-3 py-1 rounded-full ${sale.profit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {sale.profit >= 0 ? '+' : ''}₹{Math.abs(sale.profit)}
                  </p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="py-20 text-center opacity-20 flex flex-col items-center">
                 <ShoppingCart size={48} className="mb-4" />
                 <p className="font-black uppercase text-[10px] tracking-widest">No transactions logged</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card flex flex-col justify-center items-center py-16 bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <TrendingUp size={160} className="text-emerald-500" />
          </div>
          <div className="relative z-10 px-6">
            <div className={`p-5 rounded-full mb-8 inline-block ring-8 ${lowStockCount > 0 ? 'bg-red-500/10 ring-red-500/5' : 'bg-emerald-500/10 ring-emerald-500/5'}`}>
              <AlertTriangle size={48} className={lowStockCount > 0 ? 'text-red-400 animate-bounce' : 'text-emerald-400 animate-pulse'} />
            </div>
            <h3 className={`text-2xl font-black mb-4 italic uppercase tracking-widest underline decoration-white/10 ${lowStockCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Strategy Hub</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed italic uppercase font-black tracking-widest max-w-sm mx-auto opacity-70">
              {lowStockCount > 0 
                ? `CRITICAL: ${lowStockCount} items are below safety stock levels. Restock immediately to avoid service disruption.`
                : "The algorithm suggests optimizing inventory for 'High Margin' items. Average profitability is holding steady. Inventory levels are healthy."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
