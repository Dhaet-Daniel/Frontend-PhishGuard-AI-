// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import DashboardLayout from './pages/DashboardLayout';
import Scanner from './pages/Scanner';
import Settings from './pages/Settings';
import BatchScanner from './pages/BatchScanner';
import History from './pages/History';

// Auth Guard Component
function AuthGuard({ children }) {
  const isLoggedIn = localStorage.getItem('authToken');
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
        
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected Dashboard app */}
          <Route path="/app" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
            {/* The existing tool pages – unchanged */}
            <Route index element={<Scanner />} />
            <Route path="batch" element={<BatchScanner />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}