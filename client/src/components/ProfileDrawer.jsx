import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User as UserIcon,
  Store,
  Mail,
  Phone,
  Pencil,
  Check,
  Loader2,
  LogOut,
  Download,
  Crown,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../hooks/usePwaInstall';

const ProfileDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { canInstall, install } = usePwaInstall();

  const [editing, setEditing] = useState(false);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const profile = user?.profile;
  const subscription = user?.subscription;

  useEffect(() => {
    if (isOpen && profile) {
      setShopName(profile.shopName || '');
      setOwnerName(profile.ownerName || '');
      setPhone(profile.phone || '');
      setEditing(false);
      setError('');
    }
  }, [isOpen, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!shopName.trim() || !ownerName.trim() || !phone.trim()) {
      setError('All fields are required');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Phone must be a 10-digit Indian mobile number');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/landing');
  };

  const handleInstall = async () => {
    await install();
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/upgrade');
  };

  const initial = (profile?.ownerName || profile?.email || '?').charAt(0).toUpperCase();
  const subBadge = getSubBadge(subscription);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-[9999] flex flex-col shadow-2xl"
          >
            <div className="relative bg-slate-900 text-white p-6 overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl" />
              <div className="relative flex items-start justify-between mb-5">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                  Account
                </p>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-emerald-600/30 shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black truncate">{profile?.shopName || 'My Shop'}</p>
                  <p className="text-xs font-bold text-slate-300 truncate mt-0.5">
                    {profile?.ownerName || profile?.email}
                  </p>
                </div>
              </div>

              {subBadge && (
                <div className={`relative mt-5 flex items-center justify-between gap-3 p-3 rounded-2xl border ${subBadge.containerClass}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Crown size={14} className={subBadge.iconClass} />
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${subBadge.labelClass}`}>
                        {subBadge.label}
                      </p>
                      {subBadge.sub && (
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{subBadge.sub}</p>
                      )}
                    </div>
                  </div>
                  {subBadge.showUpgradeCta && (
                    <button
                      onClick={handleUpgrade}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-[9px] transition-colors shrink-0"
                    >
                      Upgrade
                      <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Profile Details
                  </h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <Field label="Shop Name" icon={<Store size={14} />}>
                      <input
                        type="text"
                        className="input-field w-full"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Owner Name" icon={<UserIcon size={14} />}>
                      <input
                        type="text"
                        className="input-field w-full"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Mobile Number" icon={<Phone size={14} />}>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center px-3 rounded-md border border-slate-300 bg-slate-50 text-slate-500 text-sm font-bold">
                          +91
                        </div>
                        <input
                          type="tel"
                          className="input-field flex-1"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          required
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="9876543210"
                        />
                      </div>
                    </Field>
                    {error && (
                      <p className="text-[11px] font-bold text-red-600">{error}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                        className="flex-1 py-3 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[11px] font-black uppercase tracking-widest bg-slate-900 hover:bg-emerald-600 text-white transition-all disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2.5">
                    <ReadField icon={<Store size={14} />} label="Shop Name" value={profile?.shopName} />
                    <ReadField icon={<UserIcon size={14} />} label="Owner Name" value={profile?.ownerName} />
                    <ReadField icon={<Phone size={14} />} label="Mobile" value={profile?.phone ? `+91 ${profile.phone}` : ''} />
                    <ReadField icon={<Mail size={14} />} label="Email" value={profile?.email} />
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  <ActionButton
                    onClick={handleInstall}
                    icon={<Download size={16} />}
                    label="Install App"
                    sub={canInstall ? 'Available on this device' : 'Show install instructions'}
                  />
                  <ActionButton
                    onClick={handleLogout}
                    icon={<LogOut size={16} />}
                    label="Sign out"
                    sub="End your session"
                    danger
                  />
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
      <span className="text-slate-500">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

const ReadField = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
    <div className="w-9 h-9 rounded-xl bg-white text-slate-500 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-900 truncate mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon, label, sub, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
      danger
        ? 'bg-white border-slate-100 hover:bg-red-50 hover:border-red-100 text-slate-700 hover:text-red-700'
        : 'bg-white border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 text-slate-700 hover:text-emerald-700'
    }`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        danger ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1 text-left">
      <p className="text-sm font-black">{label}</p>
      <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{sub}</p>
    </div>
  </button>
);

function getSubBadge(sub) {
  if (!sub) return null;
  const daysLeft = sub.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd) - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (sub.state === 'ACTIVE') {
    return {
      label: 'Pro · Active',
      sub: `Renews in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      containerClass: 'bg-emerald-500/10 border-emerald-400/20',
      iconClass: 'text-emerald-400',
      labelClass: 'text-emerald-300',
      showUpgradeCta: daysLeft <= 7,
    };
  }
  if (sub.state === 'TRIALING') {
    return {
      label: 'Free Trial',
      sub: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
      containerClass: 'bg-amber-500/10 border-amber-400/20',
      iconClass: 'text-amber-400',
      labelClass: 'text-amber-300',
      showUpgradeCta: true,
    };
  }
  return {
    label: 'Subscription Inactive',
    sub: 'Reactivate to continue',
    containerClass: 'bg-red-500/10 border-red-400/20',
    iconClass: 'text-red-400',
    labelClass: 'text-red-300',
    showUpgradeCta: true,
  };
}

export default ProfileDrawer;
