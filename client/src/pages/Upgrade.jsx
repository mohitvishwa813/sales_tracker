import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Sparkles,
  Loader2,
  ShieldCheck,
  Zap,
  Crown,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

const PERKS = [
  'Up to 100+ products & sales tracking',
  'Customer debt management',
  'Full analytics history',
  'Image storage for every product',
  'Priority support',
];

// Confirmation strategy:
// 1. Razorpay's `handler` fires with payment_id + order_id + signature.
// 2. We POST those to /payments/verify — the server checks the HMAC signature
//    and confirms the payment with Razorpay's API, then activates instantly.
// 3. If /verify fails for any reason (network, server down) we fall back to
//    polling /status so the webhook can still rescue the session.
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

const Upgrade = () => {
  const navigate = useNavigate();
  const { user, refreshSubscription } = useAuth();
  const [phase, setPhase] = useState('idle'); // idle | creating | checkout | confirming | success | error
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const subscription = user?.subscription;
  const isActive = subscription?.state === 'ACTIVE';
  const isTrialing = subscription?.state === 'TRIALING';

  const handleUpgrade = async () => {
    setError('');
    setPhase('creating');

    if (typeof window.Razorpay === 'undefined') {
      setError('Payment library failed to load. Please refresh and try again.');
      setPhase('error');
      return;
    }

    let order;
    try {
      const res = await api.post('/payments/create-order');
      order = res.data;
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err.response?.data?.msg || 'Could not start payment. Please try again.');
      setPhase('error');
      return;
    }

    setPhase('checkout');

    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'ShopTracker Pro',
      description: 'Monthly subscription',
      theme: { color: '#10b981' },
      // Mobile: intent-only — list of UPI apps; tap one to open it with the
      // amount pre-filled. Desktop: standard UPI block (QR + manual VPA),
      // since intent links can't deep-link from a desktop browser.
      ...(isMobile
        ? {
            config: {
              display: {
                blocks: {
                  upi_apps: {
                    name: 'Pay using a UPI app',
                    instruments: [{ method: 'upi', flows: ['intent'] }],
                  },
                },
                sequence: ['block.upi_apps'],
                preferences: { show_default_blocks: false },
              },
            },
          }
        : {
            method: {
              upi: true,
              card: false,
              netbanking: false,
              wallet: false,
              emi: false,
              paylater: false,
            },
          }),
      handler: async (response) => {
        // Razorpay's success callback. Try the synchronous verify path first;
        // if it works the user is ACTIVE within ~1 second. Polling stays as a
        // fallback in case /verify itself fails to reach the server.
        setPhase('confirming');
        try {
          const verifyRes = await api.post('/payments/verify', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.data?.subscription?.state === 'ACTIVE') {
            await refreshSubscription();
            setPhase('success');
            setTimeout(() => navigate('/'), 1800);
            return;
          }
          // Server accepted but state didn't flip (unexpected) — fall through to polling.
          startConfirmationPolling();
        } catch (err) {
          console.error('Verify call failed, falling back to polling:', err);
          startConfirmationPolling();
        }
      },
      modal: {
        ondismiss: () => {
          setPhase('idle');
        },
      },
      prefill: {
        name: user?.profile?.ownerName || '',
        email: user?.profile?.email || '',
        contact: user?.profile?.phone ? `+91${user.profile.phone}` : '',
      },
    });

    rzp.on('payment.failed', (response) => {
      console.error('Razorpay payment.failed:', response.error);
      setError(response.error?.description || 'Payment failed. Please try again.');
      setPhase('error');
    });

    rzp.open();
  };

  const startConfirmationPolling = () => {
    setPhase('confirming');
    const startedAt = Date.now();

    pollRef.current = setInterval(async () => {
      const sub = await refreshSubscription();

      if (sub?.state === 'ACTIVE') {
        clearInterval(pollRef.current);
        setPhase('success');
        setTimeout(() => navigate('/'), 1800);
        return;
      }

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        clearInterval(pollRef.current);
        setError(
          "We received your payment but couldn't confirm it within 30 seconds. " +
          "Your subscription will activate shortly — please refresh in a minute."
        );
        setPhase('error');
      }
    }, POLL_INTERVAL_MS);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#ecfdf5_0%,_transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-5 py-12 md:py-20">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-emerald-200/80 shadow-sm shadow-emerald-100 mb-6"
          >
            <Crown size={12} className="text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.25em]">
              ShopTracker Pro
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.05]"
          >
            {isActive ? "You're on Pro." : isTrialing ? 'Lock in your access.' : 'Reactivate your shop.'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-slate-600 text-base md:text-lg"
          >
            {isActive
              ? `Your subscription is active until ${formatDate(subscription.currentPeriodEnd)}.`
              : 'Keep tracking sales, inventory and customer debts without interruption.'}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/[0.06] overflow-hidden"
        >
          <div className="bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                  Pro Monthly
                </p>
                <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                  <span className="text-5xl md:text-6xl font-black italic tracking-tighter">
                    ₹49
                  </span>
                  <span className="text-2xl font-bold text-slate-500 line-through">
                    ₹299
                  </span>
                  <span className="text-sm font-bold text-slate-400">/month</span>
                </div>
                <p className="mt-2 text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                  Launch offer · Save 84%
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Cancel anytime. No setup fees.
                </p>
              </div>
              <div className="hidden md:flex w-14 h-14 rounded-2xl bg-emerald-500/20 items-center justify-center">
                <Sparkles size={24} className="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <ul className="space-y-3.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-sm font-bold text-slate-700">{perk}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {phase === 'success' ? (
                <SuccessState />
              ) : phase === 'confirming' ? (
                <ConfirmingState />
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={phase === 'creating' || phase === 'checkout' || isActive}
                  className="w-full bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-4 px-7 rounded-full transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  {isActive ? (
                    <>You're already Pro</>
                  ) : phase === 'creating' ? (
                    <><Loader2 size={14} className="animate-spin" /> Preparing payment…</>
                  ) : phase === 'checkout' ? (
                    <><Loader2 size={14} className="animate-spin" /> Opening checkout…</>
                  ) : (
                    <>
                      Pay ₹49 & activate
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100"
                  >
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] font-bold text-red-700 leading-relaxed">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} />
                <span>Secured by Razorpay · UPI · Cards · Net Banking</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmingState = () => (
  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
      <Loader2 size={18} className="text-emerald-700 animate-spin" />
    </div>
    <div>
      <p className="text-sm font-black text-emerald-900">Confirming payment…</p>
      <p className="text-[11px] font-bold text-emerald-700/80 mt-0.5">
        This usually takes 5–10 seconds. Don't refresh.
      </p>
    </div>
  </div>
);

const SuccessState = () => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="bg-emerald-500 text-white rounded-2xl p-5 flex items-center gap-4"
  >
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
      <Check size={20} strokeWidth={3} />
    </div>
    <div>
      <p className="text-sm font-black">Payment confirmed!</p>
      <p className="text-[11px] font-bold text-emerald-100 mt-0.5">
        Redirecting to your dashboard…
      </p>
    </div>
  </motion.div>
);

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default Upgrade;
