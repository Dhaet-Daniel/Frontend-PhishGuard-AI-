import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import DashboardLayout from './pages/DashboardLayout';
import Scanner from './pages/Scanner';
import Settings from './pages/Settings';
import BatchScanner from './pages/BatchScanner';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminResults from './pages/AdminResults';
import AdminFeedback from './pages/AdminFeedback';
import AdminRequests from './pages/AdminRequests';
import AdminDomains from './pages/AdminDomains';
import AdminFeatureFlags from './pages/AdminFeatureFlags';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route path="/scanner" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Scanner />} />
            <Route path="batch" element={<BatchScanner />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute roleRequired="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="domains" element={<AdminDomains />} />
            <Route path="features" element={<AdminFeatureFlags />} />
            <Route path="requests" element={<AdminRequests />} />
          </Route>

          <Route path="/app" element={<Navigate to="/scanner" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
