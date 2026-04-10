import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ArrowUpCircle } from 'lucide-react';
import api from '../api/config';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await api.post('/auth/register', { email, password });
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#ecfdf5_0%,_transparent_50%)]"></div>
      
      <div className="glass-card w-full max-w-md relative z-10 shadow-2xl shadow-emerald-500/5">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-emerald-500 rounded-3xl shadow-xl shadow-emerald-500/20">
            <ArrowUpCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 italic">ShopTrack Pro Platform</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-tight p-4 rounded-xl mb-6">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Email Address</label>
            <input
              type="email"
              className="input-field w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Secure Password</label>
            <input
              type="password"
              className="input-field w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-4 text-xs font-black uppercase tracking-[0.2em] py-4">
            {isLogin ? 'Enter Platform' : 'Join Platform'}
          </button>
        </form>

        <p className="text-center mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
          {isLogin ? "Need a new account? " : "Already have access? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 hover:underline font-black"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
