import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import SalesEntry from './pages/SalesEntry';
import History from './pages/History';
import Customers from './pages/Customers';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Authenticating Session</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  
  return (
    <div className="flex flex-col md:flex-row bg-white min-h-screen text-slate-800 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen relative p-0 overflow-y-auto bg-slate-50 pb-24 md:pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#ecfdf5_0%,_transparent_50%)] pointer-events-none"></div>
        <div className="relative z-10 min-h-[calc(100vh-80px)] md:min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales/add" 
            element={
              <ProtectedRoute>
                <SalesEntry />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
