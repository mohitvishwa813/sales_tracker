import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  Boxes,
  PieChart,
  Users,
  WifiOff,
  Camera,
  ShieldCheck,
  Smartphone,
  Bell,
  Star,
  Play,
  Check,
  ArrowUp,
  ArrowRight,
  Menu,
  X,
  Home,
  Package,
  ShoppingCart,
  Settings,
  FileText,
  LineChart,
  BarChart3,
  Mail,
  Phone,
} from 'lucide-react';

// Inline SVGs — the installed lucide-react version doesn't export these brand icons.
const InstagramIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// ------- Theme: emerald primary + slate dark, matching the post-signup app -------
// primary: emerald-600 (#059669)
// primary-dark: emerald-700 (#047857)
// primary-light: emerald-50 (#ecfdf5)
// secondary (dark): slate-900 (#0f172a)
// accent gradient endpoints: emerald-500 → emerald-700

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: '-80px' },
  transition: { staggerChildren: 0.08 },
};

// ============================================================
// Nav
// ============================================================
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Reviews', href: '#testimonials' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200'
          : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 text-slate-900 font-extrabold text-xl">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <LineChart size={16} />
          </span>
          ShopTracker <span className="text-emerald-600">Pro</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth"
            className="px-5 py-2.5 rounded-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold text-sm transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white border-t border-slate-100"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {l.label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-slate-100">
                <Link
                  to="/auth"
                  className="py-3 text-center rounded-lg border-2 border-emerald-600 text-emerald-600 font-semibold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="py-3 text-center rounded-lg bg-emerald-600 text-white font-semibold text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ============================================================
// Dashboard mockup used in hero
// ============================================================
const HeroMockup = () => (
  <motion.div
    initial={{ opacity: 0, y: 40, rotateX: 8 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
    style={{ transformPerspective: 1200 }}
    className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-6"
  >
    <div className="flex items-center gap-1.5 pb-3 mb-4 border-b border-slate-200">
      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      <span className="ml-auto text-xs text-slate-400">Dashboard Overview</span>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <MockCard label="Total Revenue" value="₹2,45,000" change="+12.5% this month" />
      <MockCard label="Products Sold" value="1,284" change="+8.2% this month" />
      <MockCard label="Active Customers" value="342" change="+15 new today" />
      <MockCard label="Low Stock Alerts" value="7 Items" change="Action needed" changeColor="text-red-500" />

      <div className="col-span-2 h-28 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200/50 relative overflow-hidden">
        <svg
          className="absolute inset-x-0 bottom-0 w-full"
          height="80"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 0.8, ease: 'easeOut' }}
            d="M0,60 Q40,40 80,45 T160,30 T240,35 T320,15 T400,25"
            stroke="#059669"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0,60 Q40,40 80,45 T160,30 T240,35 T320,15 T400,25 L400,80 L0,80 Z"
            fill="#059669"
            fillOpacity="0.15"
          />
        </svg>
      </div>
    </div>
  </motion.div>
);

const MockCard = ({ label, value, change, changeColor = 'text-emerald-600' }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
    <p className="text-xs text-slate-500 mb-1.5">{label}</p>
    <p className="text-xl font-bold text-slate-900">{value}</p>
    <p className={`text-xs font-semibold mt-1 ${changeColor}`}>{change}</p>
  </div>
);

// ============================================================
// Hero
// ============================================================
const Hero = () => (
  <section
    id="top"
    className="relative pt-32 md:pt-40 pb-20 md:pb-24 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40"
  >
    <div className="absolute -top-1/2 -right-[20%] w-[800px] h-[800px] rounded-full bg-emerald-500/[0.07]" />

    <div className="relative max-w-7xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div className="text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-sm font-semibold text-emerald-700 shadow-md shadow-emerald-100"
        >
          <Zap size={14} className="text-emerald-500" />
          Trusted by 2,000+ shop owners across India
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.1] tracking-tight text-slate-900"
        >
          Run Your Shop Smarter with{' '}
          <span className="bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
            ShopTracker Pro
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg text-slate-500 max-w-xl lg:max-w-none"
        >
          Track inventory, sales, and customer debts from one beautiful, offline-first
          dashboard. Built for Indian shop owners — works on your phone, tablet, or
          desktop.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
        >
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/40 hover:shadow-emerald-600/50 hover:-translate-y-0.5 transition-all"
          >
            Start 7-Day Free Trial
            <ArrowRight size={16} />
          </Link>
          <a
            href="#dashboard"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold transition-colors"
          >
            <Play size={14} />
            Watch Demo
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex gap-8 justify-center lg:justify-start"
        >
          <Stat number="₹50Cr+" label="Revenue Tracked" />
          <Stat number="2,000+" label="Active Shops" />
          <Stat number="99.9%" label="Uptime" />
        </motion.div>
      </div>

      <div className="relative lg:order-2 order-first">
        <HeroMockup />
      </div>
    </div>
  </section>
);

const Stat = ({ number, label }) => (
  <div>
    <p className="text-2xl font-extrabold text-slate-900">{number}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

// ============================================================
// Features
// ============================================================
const FEATURES = [
  {
    icon: Boxes,
    title: 'Smart Inventory',
    body: 'Photo-rich product catalog with live stock tracking. Auto-decrements with every sale — never run out unexpectedly.',
  },
  {
    icon: PieChart,
    title: 'Revenue Dashboard',
    body: 'Live charts of sales, profit, and trends. Daily summary, 7-day comparisons, and a clear picture of where money flows.',
  },
  {
    icon: Users,
    title: 'Customer Debt Ledger',
    body: 'Track who owes what. Add unpaid amounts per customer, mark them paid, see total dues at a glance.',
  },
  {
    icon: TrendingUp,
    title: 'Sales & Profit Tracking',
    body: 'Log a sale in seconds — profit is auto-computed from buy price and selling price. No manual calculations.',
  },
  {
    icon: WifiOff,
    title: 'Offline-First PWA',
    body: 'Power cut? No signal? Keep working. ShopTracker stays usable offline and syncs the moment you reconnect.',
  },
  {
    icon: Camera,
    title: 'Photo Catalog',
    body: 'Snap a photo, set the price, done. Every product carries an image — recognise SKUs instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Default',
    body: 'JWT-encrypted sessions, bcrypt-hashed passwords, OTP-verified signups. Your data is yours alone.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    body: 'Low-stock warnings, daily sales recaps, customer-due reminders — straight to your dashboard.',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    body: 'Phone, tablet, desktop — same data, same experience. Install to home screen for a native-app feel.',
  },
];

const Features = () => (
  <section id="features" className="py-24 md:py-28 bg-white">
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
          Powerful Features
        </span>
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-slate-900 leading-tight">
          Everything You Need to Run Your Shop
        </h2>
        <p className="mt-4 text-slate-500 text-lg">
          From inventory tracking to customer debts and analytics — one platform handles
          every part of your shop.
        </p>
      </motion.div>

      <motion.div
        {...stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            whileHover={{ y: -5 }}
            className="group relative bg-white border border-slate-200 rounded-2xl p-8 transition-shadow hover:shadow-xl hover:shadow-slate-900/5 overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-600 to-emerald-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <f.icon size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================================
// How It Works
// ============================================================
const STEPS = [
  {
    n: 1,
    title: 'Create Account',
    body: 'Sign up with email + OTP. Add your shop name and owner details — no credit card.',
  },
  {
    n: 2,
    title: 'Add Products',
    body: 'Upload product photos, set buy price and MRP. Stock counts initialise automatically.',
  },
  {
    n: 3,
    title: 'Add Sales',
    body: 'Log every sale with one tap. Profit and stock update in real time.',
  },
  {
    n: 4,
    title: 'Grow Smart',
    body: 'Use charts and customer ledgers to spot trends, recover debts, and boost profits.',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 md:py-28 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
          Simple Setup
        </span>
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-slate-900 leading-tight">
          Get Started in 4 Easy Steps
        </h2>
        <p className="mt-4 text-slate-500 text-lg">
          No technical knowledge required. Set up and start tracking in under 10 minutes.
        </p>
      </motion.div>

      <motion.div
        {...stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 relative"
      >
        {STEPS.map((s, i) => (
          <motion.div key={s.n} variants={fadeUp} className="text-center relative">
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-[30px] left-[calc(50%+40px)] right-[calc(-50%+40px)] h-[2px] bg-emerald-200" />
            )}
            <div className="relative z-10 w-[60px] h-[60px] mx-auto rounded-full bg-emerald-600 text-white text-xl font-extrabold flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-5">
              {s.n}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">{s.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================================
// Dashboard Preview (dark themed)
// ============================================================
const Preview = () => (
  <section id="dashboard" className="py-24 md:py-28 bg-slate-900 text-white text-center">
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <motion.h2
        {...fadeUp}
        className="text-3xl md:text-[2.5rem] font-extrabold mb-4"
      >
        Powerful Dashboard at Your Fingertips
      </motion.h2>
      <motion.p
        {...fadeUp}
        className="text-slate-400 text-lg max-w-2xl mx-auto mb-12"
      >
        Get a bird's-eye view of your entire business with our intuitive, real-time
        dashboard.
      </motion.p>

      <motion.div
        {...fadeUp}
        className="max-w-5xl mx-auto bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl shadow-slate-950"
      >
        <div className="flex gap-2 mb-6">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 text-left">
          <PreviewSidebar />
          <PreviewMain />
        </div>
      </motion.div>
    </div>
  </section>
);

const PreviewSidebar = () => {
  const items = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Package, label: 'Products' },
    { icon: ShoppingCart, label: 'Sales' },
    { icon: Users, label: 'Customers' },
    { icon: FileText, label: 'History' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
      {items.map((it) => (
        <div
          key={it.label}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm mb-1 ${
            it.active ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          <it.icon size={14} />
          {it.label}
        </div>
      ))}
    </div>
  );
};

const PreviewMain = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <PreviewWidget label="Total Revenue" value="₹4.2L" valueColor="text-emerald-400" change="+18% vs last month" />
    <PreviewWidget label="Total Orders" value="1,847" valueColor="text-amber-400" change="+12% vs last month" />
    <PreviewWidget label="Avg Order Value" value="₹1,250" valueColor="text-sky-400" change="+5% vs last month" />

    <div className="md:col-span-2 h-44 rounded-xl bg-emerald-600/10 border border-slate-700 relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 150"
        preserveAspectRatio="none"
      >
        <motion.path
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          d="M0,120 Q50,100 100,110 T200,80 T300,90 T400,50 T500,60"
          stroke="#10b981"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M0,120 Q50,100 100,110 T200,80 T300,90 T400,50 T500,60 L500,150 L0,150 Z"
          fill="#10b981"
          fillOpacity="0.15"
        />
      </svg>
    </div>

    <div className="md:col-span-1 bg-slate-900 border border-slate-700 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
        Top Products
      </p>
      <PreviewRow name="Wireless Earbuds" qty="142" rev="₹2.1L" />
      <PreviewRow name="Smart Watch" qty="89" rev="₹1.7L" />
      <PreviewRow name="Phone Case" qty="234" rev="₹58.5K" lowStock />
    </div>
  </div>
);

const PreviewWidget = ({ label, value, valueColor, change }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
      {label}
    </p>
    <p className={`text-2xl font-bold mb-1 ${valueColor}`}>{value}</p>
    <p className="text-xs text-emerald-400 flex items-center gap-1">
      <ArrowUp size={11} />
      {change}
    </p>
  </div>
);

const PreviewRow = ({ name, qty, rev, lowStock }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0 text-xs">
    <div className="truncate">
      <p className="text-slate-200 font-semibold truncate">{name}</p>
      <p className="text-slate-500 mt-0.5">{qty} sold · {rev}</p>
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${lowStock ? 'text-red-400' : 'text-emerald-400'}`}>
      {lowStock ? 'Low' : 'OK'}
    </span>
  </div>
);

// ============================================================
// Pricing — only ONE real plan (₹299), other two reflect roadmap
// ============================================================
const Pricing = () => {
  const plans = [
    {
      name: 'Free Trial',
      price: '₹0',
      period: 'for 7 days',
      limit: 'Full Access',
      features: [
        'Every feature, unlocked',
        'Up to 100+ products',
        'Sales & profit tracking',
        'Customer debt ledger',
        'PWA install',
        'Email support',
      ],
      cta: 'Start Free Trial',
      ctaTo: '/auth?mode=signup',
      ctaStyle: 'outline',
      highlight: false,
    },
    {
      name: 'ShopTracker Pro',
      price: '₹299',
      period: '/ month',
      limit: 'Most Popular',
      features: [
        'Up to 100+ products & sales',
        'Customer debt management',
        'Full analytics history',
        'Photo catalog (image storage)',
        'Offline-first PWA',
        'Priority support',
      ],
      cta: 'Start 7-Day Free Trial',
      ctaTo: '/auth?mode=signup',
      ctaStyle: 'solid',
      highlight: true,
    },
    {
      name: 'Business',
      price: 'Soon',
      period: 'multi-shop',
      limit: 'Coming Soon',
      features: [
        'Everything in Pro',
        'Multi-shop dashboards',
        'Team accounts & roles',
        'Export to CSV / Excel',
        'Custom report builder',
        'Dedicated success manager',
      ],
      cta: 'Notify me',
      ctaTo: '/auth?mode=signup',
      ctaStyle: 'outline',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
            Flexible Pricing
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-slate-900 leading-tight">
            Pay Only for What You Need
          </h2>
          <p className="mt-4 text-slate-500 text-lg">
            Start with a 7-day free trial. One simple plan, no hidden fees, cancel
            anytime.
          </p>
        </motion.div>

        <motion.div
          {...stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {plans.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl p-8 text-center transition-all ${
                p.highlight
                  ? 'border-2 border-emerald-600 shadow-2xl shadow-emerald-600/10 lg:scale-105 bg-white'
                  : 'border-2 border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md shadow-emerald-600/30">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
              <div className="my-4">
                <span className="text-5xl font-extrabold text-slate-900">{p.price}</span>
                <span className="text-base text-slate-500 ml-1.5">{p.period}</span>
              </div>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {p.limit}
              </span>

              <ul className="space-y-2.5 text-left mt-6 mb-7">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 border-b border-slate-100 pb-2.5">
                    <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={p.ctaTo}
                className={`block w-full text-center px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
                  p.ctaStyle === 'solid'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
                    : 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================
// Testimonials
// ============================================================
const TESTIMONIALS = [
  {
    initials: 'RK',
    name: 'Rajesh Kumar',
    where: 'Electronics Store, Delhi',
    body:
      'ShopTracker Pro transformed how I run my mobile accessories store. The low-stock alerts alone have saved me from losing sales countless times.',
  },
  {
    initials: 'SP',
    name: 'Sneha Patel',
    where: 'Clothing Boutique, Mumbai',
    body:
      'The customer debt feature is a game-changer. I used to lose track of who owed what — now I can settle accounts at the end of every month, on time.',
  },
  {
    initials: 'AM',
    name: 'Arun Menon',
    where: 'Grocery Store, Bangalore',
    body:
      'Even when my internet drops, ShopTracker keeps working. The offline-first design has been a lifesaver during power cuts and bad signal days.',
  },
];

const Testimonials = () => (
  <section id="testimonials" className="py-24 md:py-28 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6 md:px-8">
      <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-block bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
          Customer Love
        </span>
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-slate-900 leading-tight">
          Loved by Shop Owners Across India
        </h2>
        <p className="mt-4 text-slate-500 text-lg">
          Real stories from real shop owners using ShopTracker every day.
        </p>
      </motion.div>

      <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <motion.div
            key={t.name}
            variants={fadeUp}
            className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
          >
            <div className="flex gap-0.5 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-700 leading-relaxed mb-6">"{t.body}"</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center">
                {t.initials}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.where}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ============================================================
// CTA — slate-900 with emerald glow, matching the app's dark sections
// ============================================================
const FinalCTA = () => (
  <section className="relative py-24 md:py-28 bg-slate-900 text-white text-center overflow-hidden">
    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

    <div className="relative max-w-3xl mx-auto px-6 md:px-8">
      <motion.h2
        {...fadeUp}
        className="text-3xl md:text-[2.5rem] font-extrabold mb-4"
      >
        Ready to Take Control of Your Shop?
      </motion.h2>
      <motion.p {...fadeUp} className="text-lg text-slate-300 mb-8">
        Join 2,000+ shop owners growing their business with ShopTracker Pro. Start your
        7-day free trial today — no credit card required.
      </motion.p>
      <motion.div {...fadeUp}>
        <Link
          to="/auth?mode=signup"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold shadow-2xl shadow-emerald-500/30 hover:-translate-y-1 transition-all"
        >
          Start Your 7-Day Free Trial
          <ArrowRight size={16} />
        </Link>
        <p className="mt-5 text-sm text-slate-400">
          7-day free trial · ₹299/month · Cancel anytime · UPI accepted
        </p>
      </motion.div>
    </div>
  </section>
);

// ============================================================
// Footer — cleaned up: only customer-relevant + legal items
// ============================================================
const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 px-6 md:px-8 border-t border-slate-800">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-slate-800">
      <div>
        <a href="#top" className="flex items-center gap-2 text-white font-extrabold text-xl mb-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <LineChart size={16} />
          </span>
          ShopTracker <span className="text-emerald-400">Pro</span>
        </a>
        <p className="text-sm leading-relaxed max-w-xs mb-5">
          The complete shop management and revenue tracking platform built for Indian
          retailers. Simple, powerful, and affordable.
        </p>

        <div className="space-y-2.5 mb-5">
          <a
            href="mailto:info@shoptracker.in"
            className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <Mail size={14} className="text-slate-500" />
            info@shoptracker.in
          </a>
          <a
            href="tel:+917879005030"
            className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <Phone size={14} className="text-slate-500" />
            +91 78790 05030
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://instagram.com/shoptracker.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ShopTracker Pro on Instagram"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <InstagramIcon size={16} />
          </a>
          <a
            href="https://www.facebook.com/share/1B2rcEugv7/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ShopTracker Pro on Facebook"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <FacebookIcon size={16} />
          </a>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
        <ul className="space-y-2.5 text-sm">
          <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
          <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
          <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
          <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
        <ul className="space-y-2.5 text-sm">
          <li><a href="#" className="hover:text-white transition-colors">About</a></li>
          <li><a href="mailto:info@shoptracker.in" className="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
        <ul className="space-y-2.5 text-sm">
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
        </ul>
      </div>
    </div>

    <p className="text-center text-sm mt-8">
      © {new Date().getFullYear()} ShopTracker Pro. All rights reserved. Made for Indian
      retailers.
    </p>
  </footer>
);

// ============================================================
// Main export
// ============================================================
const Landing = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Preview />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Landing;
