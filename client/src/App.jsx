import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import SalesEntry from './pages/SalesEntry';
import History from './pages/History';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
