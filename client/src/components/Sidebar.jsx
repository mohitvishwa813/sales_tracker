import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package,
  History,
  LogOut,
  LayoutDashboard,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Add Sale', icon: <ShoppingCart size={20} />, path: '/sales/add' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
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

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
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
        
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <div className="p-2">
            <LogOut size={20} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-tighter">Exit</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
