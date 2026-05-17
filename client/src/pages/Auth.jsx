import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Loader2,
  LineChart,
  Mail,
  Lock,
  Store,
  User,
  Phone,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../api/config';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';

const VALUE_BULLETS = [
  'Track inventory, sales & profit in real time',
  'Manage customer debts without a paper notebook',
  'Works offline — power cut or bad signal, no problem',
  '7-day free trial · No credit card required',
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  // Landing CTAs link to /auth?mode=signup to land users directly on the signup
  // form. Plain /auth defaults to the login view.
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        if (!shopName.trim() || !ownerName.trim() || !phone.trim()) {
          throw new Error('Shop name, owner name, and phone are required');
        }
        const phoneDigits = phone.replace(/\D/g, '').slice(-10);
        if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
          throw new Error('Phone must be a 10-digit Indian mobile number');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);

        await emailjs.send(
          'service_e7km54r',
          'template_upk6b9d',
          { email, otp },
          'anbHxK8c1vWljIRbE'
        );

        setShowOtp(true);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.msg ||
          err.message ||
          err.text ||
          'Authentication failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (enteredOtp !== generatedOtp) {
        throw new Error('Invalid OTP code. Please try again.');
      }
      await api.post('/auth/register', { email, password, shopName, ownerName, phone });
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const formKey = showOtp ? 'otp' : isLogin ? 'login' : 'signup';

  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-[1.05fr_1fr] overflow-hidden">
      {/* -----------------------------------------------------------------
          Left: brand panel (desktop only)
        -----------------------------------------------------------------*/}
      <aside className="hidden lg:flex relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-400/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link to="/landing" className="inline-flex items-center gap-2.5 self-start group">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <LineChart size={18} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              ShopTracker <span className="text-emerald-400">Pro</span>
            </span>
          </Link>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
            >
              <Sparkles size={12} className="text-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                Trusted by 2,000+ shops
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tight"
            >
              Run your shop like a{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Fortune 500
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-slate-300 leading-relaxed"
            >
              The modern inventory, sales and customer-debt platform — built for Indian
              shop owners. From your phone, even offline.
            </motion.p>

            <motion.ul
              initial="initial"
              animate="animate"
              variants={{
                animate: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
              }}
              className="mt-8 space-y-3"
            >
              {VALUE_BULLETS.map((b) => (
                <motion.li
                  key={b}
                  variants={{
                    initial: { opacity: 0, x: -10 },
                    animate: { opacity: 1, x: 0 },
                  }}
                  className="flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-sm text-slate-200">{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational · UPI accepted
          </div>
        </div>
      </aside>

      {/* -----------------------------------------------------------------
          Right: form column
        -----------------------------------------------------------------*/}
      <main className="relative flex flex-col">
        {/* Mobile brand bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link to="/landing" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <LineChart size={15} />
            </span>
            <span className="text-base font-extrabold text-slate-900">
              ShopTracker <span className="text-emerald-600">Pro</span>
            </span>
          </Link>
          <Link
            to="/landing"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            ← Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10 md:py-12 lg:py-16">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={formKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {showOtp ? (
                  <OtpView
                    email={email}
                    enteredOtp={enteredOtp}
                    setEnteredOtp={setEnteredOtp}
                    isLoading={isLoading}
                    error={error}
                    onSubmit={handleOtpVerify}
                    onBack={() => {
                      setShowOtp(false);
                      setError('');
                    }}
                  />
                ) : (
                  <AuthFormView
                    isLogin={isLogin}
                    toggleMode={toggleMode}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    shopName={shopName}
                    setShopName={setShopName}
                    ownerName={ownerName}
                    setOwnerName={setOwnerName}
                    phone={phone}
                    setPhone={setPhone}
                    isLoading={isLoading}
                    error={error}
                    onSubmit={handleSubmit}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:block absolute top-6 right-6">
          <Link
            to="/landing"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
};

/* -------------------------------------------------------------------------
   Login / Signup form view
-------------------------------------------------------------------------- */
const AuthFormView = ({
  isLogin,
  toggleMode,
  email,
  setEmail,
  password,
  setPassword,
  shopName,
  setShopName,
  ownerName,
  setOwnerName,
  phone,
  setPhone,
  isLoading,
  error,
  onSubmit,
}) => (
  <>
    <div className="mb-8">
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
        {isLogin ? 'Welcome back.' : 'Create your account.'}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {isLogin
          ? 'Sign in to manage your shop.'
          : 'Start your 7-day free trial — no credit card needed.'}
      </p>
    </div>

    {error && <ErrorBanner message={error} />}

    <form onSubmit={onSubmit} className="space-y-4">
      {!isLogin && (
        <>
          <Field
            label="Shop name"
            icon={<Store size={16} />}
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            placeholder="Sharma General Store"
          />
          <Field
            label="Owner name"
            icon={<User size={16} />}
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            placeholder="Rajesh Sharma"
          />
          <PhoneField value={phone} onChange={setPhone} />
        </>
      )}

      <Field
        label="Email address"
        icon={<Mail size={16} />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="name@company.com"
        autoComplete={isLogin ? 'email' : 'email'}
      />

      <Field
        label="Password"
        icon={<Lock size={16} />}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="••••••••"
        autoComplete={isLogin ? 'current-password' : 'new-password'}
        minLength={6}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="group w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:shadow-emerald-600/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {isLogin ? 'Signing in…' : 'Sending OTP…'}
          </>
        ) : (
          <>
            {isLogin ? 'Sign in' : 'Continue'}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </>
        )}
      </button>
    </form>

    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
        OR
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>

    <p className="text-center text-sm text-slate-500">
      {isLogin ? "Don't have an account? " : 'Already have one? '}
      <button
        type="button"
        onClick={toggleMode}
        className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
      >
        {isLogin ? 'Create one for free' : 'Sign in'}
      </button>
    </p>

    {!isLogin && (
      <p className="mt-5 text-center text-[11px] text-slate-400 leading-relaxed">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    )}
  </>
);

/* -------------------------------------------------------------------------
   OTP view
-------------------------------------------------------------------------- */
const OtpView = ({
  email,
  enteredOtp,
  setEnteredOtp,
  isLoading,
  error,
  onSubmit,
  onBack,
}) => (
  <>
    <div className="mb-8 text-center">
      <div className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 items-center justify-center mb-5">
        <Mail size={22} />
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
        Check your email
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        We've sent a 6-digit code to <br className="sm:hidden" />
        <span className="font-semibold text-slate-700">{email}</span>
      </p>
    </div>

    {error && <ErrorBanner message={error} />}

    <form onSubmit={onSubmit} className="space-y-5">
      <input
        type="text"
        inputMode="numeric"
        autoFocus
        value={enteredOtp}
        onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        required
        maxLength={6}
        placeholder="000000"
        className="w-full text-center text-3xl tracking-[0.6em] font-extrabold text-slate-900 placeholder:text-slate-300 bg-slate-50 border border-slate-200 rounded-lg py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
      />

      <button
        type="submit"
        disabled={isLoading || enteredOtp.length !== 6}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Verifying…
          </>
        ) : (
          <>
            <ShieldCheck size={15} /> Verify & create account
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="block w-full text-center text-sm text-slate-500 hover:text-slate-700 font-medium"
      >
        ← Back to sign up
      </button>
    </form>
  </>
);

/* -------------------------------------------------------------------------
   Shared field components
-------------------------------------------------------------------------- */
const Field = ({ label, icon, ...inputProps }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...inputProps}
        className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-3 ${
          icon ? 'pl-11' : 'pl-4'
        } pr-4 text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all`}
      />
    </div>
  </div>
);

const PhoneField = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
      Mobile number
    </label>
    <div className="flex gap-2">
      <div className="flex items-center justify-center gap-1.5 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-sm font-semibold">
        <Phone size={14} className="text-slate-400" />
        +91
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        required
        inputMode="numeric"
        pattern="[6-9][0-9]{9}"
        maxLength={10}
        placeholder="9876543210"
        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
      />
    </div>
  </div>
);

const ErrorBanner = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700"
  >
    {message}
  </motion.div>
);

export default Auth;
