import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  History, 
  LogOut, 
  Package,
  ArrowUpCircle
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
    { name: 'Add Sale', icon: <ShoppingBag size={20} />, path: '/sales/add' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex-col p-5 z-50">
        <div className="flex items-center gap-3 px-2 py-8 mb-4">
          <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
            <ArrowUpCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">ShopTrack</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group border text-sm font-black uppercase tracking-widest ${
                  isActive 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' 
                  : 'text-slate-400 border-transparent hover:bg-emerald-50 hover:text-emerald-600'
                }`
              }
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 mt-auto font-black text-xs uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 z-50 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'text-emerald-600' 
                : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
                  {React.cloneElement(item.icon, { size: 20 })}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-400"
        >
          <div className="p-2">
            <LogOut size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight">Exit</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
