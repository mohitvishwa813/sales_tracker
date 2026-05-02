import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ArrowUpCircle, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../api/config';
import emailjs from '@emailjs/browser';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // OTP States
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
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        
        // Send OTP via EmailJS
        await emailjs.send("service_e7km54r", "template_upk6b9d", {
          email: email, 
          otp: otp,
        }, "anbHxK8c1vWljIRbE");
        
        setShowOtp(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.msg || err.message || err.text || 'Authentication failed');
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
        throw new Error("Invalid OTP code. Please try again.");
      }
      // OTP verified, create contact in db
      await api.post('/auth/register', { email, password });
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
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
            {showOtp ? 'Verify OTP' : (isLogin ? 'Sign In' : 'Create Account')}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 italic">
            {showOtp ? 'Check your email inbox' : 'ShopTrack Pro Platform'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-tight p-4 rounded-xl mb-6">
            Error: {error}
          </div>
        )}

        {!showOtp ? (
          <>
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
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full mt-4 text-xs font-black uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> {isLogin ? 'Authenticating...' : 'Sending OTP...'}</>
                ) : (
                  isLogin ? 'Enter Platform' : 'Join Platform'
                )}
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
          </>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-5 relative">
            <div className="absolute inset-0 bg-emerald-50 blur-3xl -z-10 rounded-full opacity-50"></div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2 text-center">Enter 6-Digit OTP</label>
              <input
                type="text"
                className="input-field w-full text-center text-2xl tracking-[0.5em] font-black text-emerald-900 placeholder:text-emerald-200"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="000000"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full mt-4 text-xs font-black uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Verifying...</>
              ) : (
                <><ShieldCheck size={18} /> Verify & Create Account</>
              )}
            </button>
            <p className="text-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600" onClick={() => setShowOtp(false)}>
              ← Back to Sign Up
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
