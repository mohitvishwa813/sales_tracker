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
import Landing from './pages/Landing';
import Upgrade from './pages/Upgrade';

const LoadingScreen = () => (
  <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center">
    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Authenticating Session</p>
  </div>
);

// Standard chrome (sidebar + main area) for logged-in pages.
const AppShell = ({ children }) => (
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

// Requires auth, but renders without chrome — used by Upgrade.
const AuthGate = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

// Requires auth AND wraps with sidebar/chrome — used by the main app pages.
const ProtectedRoute = ({ children }) => (
  <AuthGate>
    <AppShell>{children}</AppShell>
  </AuthGate>
);

// "/" renders Landing for logged-out visitors and Dashboard for logged-in users.
// Keeps the URL clean (no /landing redirect) and makes the marketing page the
// natural entry point for first-time visitors.
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Landing />;
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
};

// Pages that should NOT be shown to logged-in users (Auth). Bounces them home.
const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Smart home — landing or dashboard based on auth state */}
          <Route path="/" element={<HomeRoute />} />

          {/* Direct marketing URL — also shows Landing regardless of auth state */}
          <Route path="/landing" element={<Landing />} />

          {/* Auth page — logged-in users get redirected away */}
          <Route
            path="/auth"
            element={
              <GuestOnly>
                <Auth />
              </GuestOnly>
            }
          />

          {/* Auth-required but no sidebar */}
          <Route
            path="/upgrade"
            element={
              <AuthGate>
                <Upgrade />
              </AuthGate>
            }
          />

          {/* Auth-required + sidebar */}
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/sales/add" element={<ProtectedRoute><SalesEntry /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

          {/* Anything else → home (which decides landing vs dashboard) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
