import React, { useState, useEffect } from 'react';
import api from '../api/config';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  History,
  TrendingDown,
  BarChart,
  Calendar,
  Layers,
  Lock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const SubscriptionBanner = ({ subscription }) => {
  const navigate = useNavigate();
  if (!subscription) return null;

  const { state, currentPeriodEnd } = subscription;
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
  const daysLeft = periodEnd
    ? Math.max(0, Math.ceil((periodEnd - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // ACTIVE users with plenty of time left don't need a banner.
  if (state === 'ACTIVE' && daysLeft > 7) return null;

  const isTrial = state === 'TRIALING';
  const isInactive = state === 'INACTIVE' || state === 'PAST_DUE';
  const isRenewSoon = state === 'ACTIVE' && daysLeft <= 7;

  const config = isInactive
    ? {
        bg: 'bg-red-50 border-red-200',
        iconBg: 'bg-red-500 text-white',
        icon: <AlertCircle size={16} />,
        title: 'Your subscription has expired',
        body: 'Reactivate to continue tracking sales and inventory.',
        cta: 'Reactivate now',
        ctaClass: 'bg-red-600 hover:bg-red-700 text-white',
      }
    : isRenewSoon
    ? {
        bg: 'bg-amber-50 border-amber-200',
        iconBg: 'bg-amber-500 text-white',
        icon: <AlertCircle size={16} />,
        title: `Renews in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
        body: 'Pay early to extend without interruption.',
        cta: 'Renew now',
        ctaClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      }
    : {
        bg: 'bg-emerald-50 border-emerald-200',
        iconBg: 'bg-emerald-600 text-white',
        icon: <Sparkles size={16} />,
        title: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial`,
        cta: 'Upgrade for ₹49',
        ctaClass: 'bg-slate-900 hover:bg-emerald-600 text-white',
      };

  return (
    <div className={`flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5 rounded-2xl border ${config.bg}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-900 tracking-tight">{config.title}</p>
        <p className="hidden md:block text-[12px] font-bold text-slate-600 mt-0.5">{config.body}</p>
      </div>
      <button
        onClick={() => navigate('/upgrade')}
        className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-[11px] transition-all ${config.ctaClass}`}
      >
        {config.cta}
        <ArrowRight size={12} />
      </button>
    </div>
  );
};

const SummaryCard = ({ title, amount, icon, colorClass, bgClass, isCurrency = true }) => (
  <div className="qb-card flex flex-col md:min-h-[140px] pb-4 md:pb-6 animate-in slide-in-from-bottom-5 duration-500 border-l-4 border-l-emerald-500">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${bgClass} ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{title}</h3>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">{isCurrency ? '₹' : ''}{amount.toLocaleString()}</h2>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalSales: 0, totalProfit: 0, itemCount: 0 });
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, statsRes] = await Promise.all([
          api.get('/sales/summary/daily'),
          api.get('/sales/stats')
        ]);
        setSummary(sumRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-slate-300">Syncing Shop Analytics...</div>;

  return (
    <div className="pt-20 px-6 pb-6 md:p-10 space-y-8 md:space-y-10">
      <SubscriptionBanner subscription={user?.subscription} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-4 md:pb-8">
        <div>
          <h1 className="md:text-5xl text-3xl font-black text-slate-900 uppercase leading-none tracking-tighter">Inventory Insights</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Periodic Business Summary</p>
        </div>
        <div className="flex gap-4 self-start">
          <div className="bg-emerald-600 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl shadow-emerald-600/20 inline-flex md:flex flex-row md:flex-col items-center md:items-stretch gap-2 md:gap-0 text-left md:text-center">
            <p className="text-[8px] text-emerald-100 font-black uppercase tracking-widest leading-none md:mb-1">Daily Buffer</p>
            <p className="text-base md:text-xl font-black text-white italic">₹{summary.totalProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Today's Revenue"
          amount={summary.totalSales}
          icon={<DollarSign size={20} />}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <SummaryCard
          title="Net Profits"
          amount={summary.totalProfit}
          icon={<TrendingUp size={20} />}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <SummaryCard
          title="Items Sold"
          amount={summary.itemCount}
          icon={<ShoppingCart size={20} />}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
          isCurrency={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 qb-card p-4 md:p-8 bg-white h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase italic">Revenue Trend (Last 7 Days)</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <Calendar size={14} /> Tracking Enabled
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats} margin={{ top: 10, right: 10, left: window.innerWidth < 768 ? -25 : 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                  width={window.innerWidth < 768 ? 40 : 60}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fill="none" />
                <Area type="monotone" dataKey="debt" stroke="#ef4444" strokeWidth={3} fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="qb-card flex-1 p-8 bg-slate-900 text-white border-0 shadow-2xl flex flex-col justify-center text-center">
            <Layers className="text-emerald-500 mx-auto mb-6" size={48} />
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">Stock Overview</h3>
            <p className="text-xs text-slate-400 italic mb-8">Maintain healthy inventory levels to prevent revenue loss.</p>
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest"
            >
              Inventory Manager
            </button>
          </div>

          {user?.subscription?.hasActiveAccess ? (
            <button
              onClick={() => navigate('/sales/add')}
              className="qb-card p-6 border-2 border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-50 text-emerald-700 flex items-center justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="font-black text-sm uppercase italic">Quick Sale Entry</span>
              </div>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/upgrade')}
              className="qb-card p-6 border-2 border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-between opacity-70 hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400">
                  <Lock size={20} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-sm uppercase italic">Quick Sale Entry</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-1">Subscription expired — Renew</span>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const ArrowRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>;

export default Dashboard;
