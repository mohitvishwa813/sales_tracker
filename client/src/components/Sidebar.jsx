import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package,
  History,
  LogOut,
  LayoutDashboard,
  BarChart2,
  Users,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("To install the app:\n\nOn Desktop Chrome/Edge: Click the install icon (monitor with a down arrow) in the right side of your URL bar.\n\nOn Mobile iOS Safari: Tap the 'Share' icon and select 'Add to Home Screen'.\n\nOn Mobile Chrome: Tap the 3 dots menu and select 'Add to Home screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLogoutClick = () => {
    setConfirmDialog({
      isOpen: true,
      message: "Are you sure you want to securely log out of your session?",
      onConfirm: () => {
        logout();
        navigate('/auth');
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Add Sale', icon: <ShoppingCart size={20} />, path: '/sales/add' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex-col z-50">
        <div className="p-8 pb-4">
          <div className="flex gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <h1 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">ShopTrack Pro</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Suite</p>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-700'
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-black uppercase tracking-wider">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-4 px-5 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-all w-full text-left"
            >
              <Download size={20} />
              <span className="text-sm font-black uppercase tracking-wider">Install App</span>
            </button>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all w-full text-left"
          >
            <LogOut size={20} />
            <span className="text-sm font-black uppercase tracking-wider">Log out</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (WebApp Style) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex items-center justify-around px-6 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-emerald-600 scale-110' : 'text-slate-400'
              }`
            }
          >
            <div className={`p-2 rounded-xl ${item.path === window.location.pathname ? 'bg-emerald-50' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Mobile Floating Actions */}
      <div className="md:hidden fixed top-6 right-6 flex flex-col gap-3 z-50">
          <button
            onClick={handleInstallClick}
            className="p-3 bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 rounded-2xl border border-emerald-400 transition-all hover:scale-105"
          >
            <Download size={20} />
          </button>
        <button
          onClick={handleLogoutClick}
          className="p-3 bg-white text-slate-400 hover:text-red-500 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 transition-all hover:scale-105"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
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
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
