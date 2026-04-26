import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Scanner from './pages/Scanner';
import Settings from './pages/Settings';
import BatchScanner from './pages/BatchScanner';
import History from './pages/History';
import phishGuardLogo from './assets/phishguard-logo.png';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
        
        {/* Navigation */}
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={phishGuardLogo}
                alt="PhishGuard logo"
                className="h-10 w-10 rounded-md object-contain shadow-[0_0_18px_rgba(59,130,246,0.2)]"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent truncate">
                PhishGuard Command
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="hover:text-blue-400 transition">Scanner</Link>
              <Link to="/batch" className="hover:text-blue-400 transition">Batch Process</Link>
              <Link to="/history" className="hover:text-blue-400 transition">History</Link>
              <Link to="/settings" className="hover:text-blue-400 transition"><i className="fas fa-cog"></i></Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Scanner />} />
            <Route path="/batch" element={<BatchScanner />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
