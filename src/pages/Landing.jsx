// src/pages/Landing.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Helper: smooth scroll to a section on same page
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// Custom hook for count-up animation
function useCountUp(targetValue, isSuffix = false, isComma = false) {
  const [display, setDisplay] = useState(isComma ? '0' : '0');
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const duration = 1400;
            const start = performance.now();
            const update = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const val = Math.round(targetValue * eased);
              setDisplay(isComma ? val.toLocaleString() : val.toString());
              if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.55 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetValue, isComma]);

  return { display, ref };
}

// Count-up component
function CountUp({ value, suffix = '', isComma = false }) {
  const { display, ref } = useCountUp(value, suffix, isComma);
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();

  // Theme state
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  useEffect(() => {
    document.body.classList.toggle('light-mode', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  // Modals state
  const [demoOpen, setDemoOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  const openDemo = () => setDemoOpen(true);
  const closeDemo = () => setDemoOpen(false);
  const openTrial = () => setTrialOpen(true);
  const closeTrial = () => setTrialOpen(false);
  const openAuth = (mode = 'login') => { setAuthMode(mode); setAuthOpen(true); };
  const closeAuth = () => { setAuthOpen(false); };

  // Auth form fields
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');
  const [authErrors, setAuthErrors] = useState({});

  const resetAuth = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirm('');
    setAuthErrors({});
  };

  const switchAuth = () => setAuthMode(prev => prev === 'login' ? 'signup' : 'login');

  const validateAuth = () => {
    const errs = {};
    if (!authEmail.trim()) errs.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) errs.email = 'Enter a valid email.';
    if (!authPassword.trim()) errs.password = 'Enter your password.';
    if (authMode === 'signup') {
      if (!authConfirm.trim()) errs.confirm = 'Confirm your password.';
      else if (authPassword !== authConfirm) errs.confirm = 'Passwords must match.';
      if (authPassword.length < 8) errs.password = 'Use at least 8 characters.';
    }
    setAuthErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!validateAuth()) return;
    // Simulated login/signup (you may call backend later)
    localStorage.setItem('loggedIn', 'true');
    toast.success(authMode === 'login' ? 'Logged in successfully.' : 'Account created successfully.');
    closeAuth();
    resetAuth();
    navigate('/app');
  };

  // Demo/trial form submissions
  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (!data['Full Name'] || !data['Email Address'] || !data['Organization']) {
      toast.error('Please fill all fields.');
      return;
    }
    // Simulated API call (replace with real fetch)
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Demo request submitted!');
    closeDemo();
    form.reset();
  };

  const handleTrialSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (!data['Full Name'] || !data['Email Address'] || !data['Organization']) {
      toast.error('Please fill all fields.');
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Trial started! Check your email.');
    closeTrial();
    form.reset();
  };

  // Live threat feed
  const [threatMessages, setThreatMessages] = useState([]);
  const threats = [
    'Phishing email blocked: "Urgent payment required" from fake@bank.com',
    'Suspicious link detected in email to admin@company.co.zm',
    'Malicious attachment (.exe) quarantined from marketing@scam.xyz',
    'BEC attempt: CEO impersonation targeting finance@org.africa',
    'Fake Microsoft login page detected and blocked',
    'Whale phishing attempt: invoice fraud from vendor@fake-supplier.com'
  ];
  let threatIndex = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = threats[threatIndex.current % threats.length];
      const time = new Date().toLocaleTimeString();
      setThreatMessages(prev => {
        const updated = [`${msg} (${time})`, ...prev].slice(0, 5);
        return updated;
      });
      threatIndex.current++;
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll‑linked active nav
  const [activeLink, setActiveLink] = useState('');
  useEffect(() => {
    const sections = ['features', 'how-it-works', 'pricing'];
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveLink(visible.target.id);
      },
      { threshold: [0.45], rootMargin: '-20% 0px -45% 0px' }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-md border-b border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="brand-lockup">
                <img src="/assets/brand-mark.png" alt="PhishGuard AI shield logo" className="brand-mark" />
                <Link to="/" className="brand-name text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  PhishGuard AI
                </Link>
              </div>
              <button onClick={() => setIsLight(!isLight)} className="p-2 rounded-full hover:bg-gray-800 transition" aria-label="Toggle dark mode">
                {isLight ? <i className="fas fa-sun text-yellow-400"></i> : <i className="fas fa-moon text-yellow-400"></i>}
              </button>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-3 text-sm font-medium">
              <div className="flex items-center space-x-3">
                <button onClick={() => scrollToSection('features')} className={`nav-link hover:text-blue-400 transition ${activeLink === 'features' ? 'is-active' : ''}`}>Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className={`nav-link hover:text-blue-400 transition ${activeLink === 'how-it-works' ? 'is-active' : ''}`}>How It Works</button>
                <Link to="/pricing" className={`nav-link hover:text-blue-400 transition ${activeLink === 'pricing' ? 'is-active' : ''}`}>Pricing</Link>
                <a href="#" className="nav-link hover:text-blue-400 transition" onClick={(e)=> {e.preventDefault(); toast('Resources hub coming soon.', {icon:'ℹ️'}); }}>Resources</a>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openAuth('login')} className="nav-link btn-secondary hover:text-blue-400 transition">Log In</button>
                <button onClick={() => openAuth('signup')} className="nav-cta btn-primary">Sign Up</button>
                <button onClick={() => scrollToSection('how-it-works')} className="nav-cta see-in-action">See It In Action</button>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMobile} className="text-gray-300 hover:text-white focus:outline-none" aria-label="Menu">
                <i className="fas fa-bars text-2xl"></i>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="mobile-menu-panel flex flex-col space-y-2 pb-4 pt-3 text-sm font-medium">
              <button onClick={() => { scrollToSection('features'); setMobileOpen(false); }} className="nav-link hover:text-blue-400 transition py-2 px-3 rounded-xl">Features</button>
              <button onClick={() => { scrollToSection('how-it-works'); setMobileOpen(false); }} className="nav-link hover:text-blue-400 transition py-2 px-3 rounded-xl">How It Works</button>
              <Link to="/pricing" className="nav-link hover:text-blue-400 transition py-2 px-3 rounded-xl" onClick={()=>setMobileOpen(false)}>Pricing</Link>
              <a href="#" className="nav-link hover:text-blue-400 transition py-2 px-3 rounded-xl" onClick={(e)=>{e.preventDefault(); toast('Resources hub coming soon.',{icon:'ℹ️'}); setMobileOpen(false);}}>Resources</a>
              <button onClick={() => { openAuth('login'); setMobileOpen(false); }} className="nav-link hover:text-blue-400 transition py-2 px-3 rounded-xl">Log In</button>
              <button onClick={() => { openAuth('signup'); setMobileOpen(false); }} className="nav-cta nav-cta-mobile">Sign Up</button>
              <button onClick={() => { scrollToSection('how-it-works'); setMobileOpen(false); }} className="nav-cta nav-cta-mobile see-in-action">See It In Action</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main id="top">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-bg hero-section">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
            <div className="hero-shell grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
              <div className="fade-up">
                <div className="hero-kicker">
                  <span className="hero-kicker-dot"></span>
                  Trusted Email Defense for Modern African Teams
                </div>
                <h1 className="mt-6 text-4xl md:text-6xl xl:text-7xl font-extrabold leading-[1.02]">
                  <span className="text-white">Stop phishing before it becomes</span>
                  <span className="hero-accent block">a business problem</span>
                </h1>
                <p className="text-xl md:text-2xl font-semibold mt-5 text-gray-100">Fast detection, clear risk signals, and response workflows teams can act on immediately.</p>
                <p className="text-gray-300 max-w-2xl mt-6 text-lg leading-8">PhishGuard AI scans inbound email in real time, flags suspicious behavior early, and helps organizations respond with more confidence and less noise.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button onClick={openDemo} className="hero-primary-btn px-6 py-3 rounded-xl font-semibold transition shadow-lg">Get a Demo</button>
                  <button onClick={() => scrollToSection('how-it-works')} className="hero-secondary-btn px-6 py-3 rounded-xl font-semibold transition">See How It Works</button>
                </div>
                <div className="hero-trust-row mt-10 flex flex-wrap gap-4">
                  <span className="hero-pill"><i className="fas fa-chart-line mr-2 text-blue-400"></i>99.7% Detection Rate</span>
                  <span className="hero-pill"><i className="fas fa-bolt mr-2 text-purple-400"></i>Real-time Protection</span>
                  <span className="hero-pill"><i className="fas fa-map-marker-alt mr-2 text-green-400"></i>Built for African Threats</span>
                </div>
                <div className="hero-stats-grid mt-10 grid sm:grid-cols-3 gap-4">
                  <div className="hero-stat-card">
                    <div className="hero-stat-number"><CountUp value={1284} isComma /></div>
                    <div className="hero-stat-label">Threats blocked this week</div>
                  </div>
                  <div className="hero-stat-card">
                    <div className="hero-stat-number"><CountUp value={6} /> sec</div>
                    <div className="hero-stat-label">Average triage response</div>
                  </div>
                  <div className="hero-stat-card">
                    <div className="hero-stat-number"><CountUp value={42} /></div>
                    <div className="hero-stat-label">Signals analyzed per email</div>
                  </div>
                </div>
              </div>
              <div className="fade-up">
                <div className="hero-preview-panel">
                  <div className="hero-preview-header">
                    <div>
                      <p className="hero-preview-label">Live Product Snapshot</p>
                      <h2 className="hero-preview-title">Threat command view</h2>
                    </div>
                    <div className="hero-preview-status">
                      <span className="status-dot"></span>
                      System Active
                    </div>
                  </div>
                  <div className="hero-preview-main">
                    <div className="preview-risk-card">
                      <p className="preview-label">Current risk climate</p>
                      <div className="preview-risk-score">74</div>
                      <p className="preview-subtext">Elevated threat activity detected across finance-focused inboxes.</p>
                    </div>
                    <div className="preview-metric-stack">
                      <div className="preview-mini-card">
                        <span className="preview-label">Blocked today</span>
                        <strong>318</strong>
                      </div>
                      <div className="preview-mini-card">
                        <span className="preview-label">Escalated cases</span>
                        <strong>14</strong>
                      </div>
                    </div>
                  </div>
                  <div className="preview-timeline">
                    <div className="timeline-row">
                      <span className="timeline-time">09:18</span>
                      <span className="timeline-copy">CEO impersonation detected and quarantined.</span>
                    </div>
                    <div className="timeline-row">
                      <span className="timeline-time">09:24</span>
                      <span className="timeline-copy">Suspicious vendor invoice link neutralized.</span>
                    </div>
                    <div className="timeline-row">
                      <span className="timeline-time">09:31</span>
                      <span className="timeline-copy">High-risk mailbox alert routed to admin dashboard.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Threat Feed */}
        <section className="py-8 bg-[#0f1117] threat-feed-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#111827] rounded-xl p-4 border border-gray-800 threat-feed-shell">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-red-500 animate-pulse"></i>
                  <span className="font-semibold">Live Threat Feed</span>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Real-time</span>
                </div>
                <span className="text-xs text-gray-500">Updated every 5s</span>
              </div>
              <div className="mt-3 space-y-2 text-sm font-mono max-h-40 overflow-y-auto">
                {threatMessages.map((msg, i) => (
                  <div key={i} className="text-xs text-gray-400 border-l-2 border-red-500 pl-2 py-1">
                    <i className="fas fa-skull text-red-500 mr-1"></i> {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="py-20 bg-[#0f1117]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 fade-up">
              <div>
                <h2 className="text-3xl font-bold text-red-400">The Problem</h2>
                <p className="mt-4 text-gray-300">Phishing continues to hit African organizations hard, and basic spam filtering is no longer enough against targeted modern attacks.</p>
                <div className="mt-8 grid gap-4">
                  <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex items-center space-x-4">
                    <div className="text-3xl text-blue-400"><i className="fas fa-dollar-sign"></i></div>
                    <div><div className="text-2xl font-bold">$4.2M</div><div className="text-gray-400">Average cost of a phishing attack for African businesses</div></div>
                  </div>
                  <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex items-center space-x-4">
                    <div className="text-3xl text-purple-400"><i className="fas fa-chart-line"></i></div>
                    <div><div className="text-2xl font-bold">83%</div><div className="text-gray-400">Of organizations experienced phishing attacks in 2025</div></div>
                  </div>
                  <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 flex items-center space-x-4">
                    <div className="text-3xl text-red-400"><i className="fas fa-envelope"></i></div>
                    <div><div className="text-2xl font-bold">BEC</div><div className="text-gray-400">Business Email Compromise is the #1 threat</div></div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-blue-400">The Solution</h2>
                <p className="mt-4 text-gray-300">PhishGuard AI combines machine learning, language analysis, and practical security workflows to detect phishing faster and respond before damage spreads.</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-green-500 text-xl"></i><span>AI-Powered Detection - Machine learning models trained on millions of phishing samples</span></div>
                  <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-green-500 text-xl"></i><span>Real-time Threat Intelligence - Dashboard with attack statistics and geographic origins</span></div>
                  <div className="flex items-center space-x-3"><i className="fas fa-check-circle text-green-500 text-xl"></i><span>Auto-Quarantine & Alerts - Instant response to block threats before they reach users</span></div>
                </div>
                <div className="mt-8">
                  <div className="inline-flex items-center bg-green-900/30 text-green-400 px-4 py-2 rounded-full text-sm border border-green-500/30 animate-pulse">
                    <i className="fas fa-shield-alt mr-2"></i> Threat Blocked <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></span> <span className="ml-2">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section id="features" className="py-20">
          {/* ... same as before but with all feature cards ... */}
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-[#0f1117]">
          {/* ... same architecture diagram ... */}
        </section>

        {/* Pricing Section (still on landing as anchor) */}
        <section id="pricing" className="py-20">
          {/* ... same pricing cards ... */}
        </section>

        {/* Get Started */}
        <section id="get-started" className="py-20 bg-gradient-to-b from-[#0a0c10] to-[#05070c]">
          {/* ... call to action ... */}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0a0c10] py-12">
        {/* ... footer content ... */}
      </footer>

      {/* Modals */}
      {demoOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeDemo}>
          <div className="bg-[#111827] p-6 rounded-2xl w-full max-w-md border border-gray-700 transform transition-all" onClick={e => e.stopPropagation()}>
            <button onClick={closeDemo} className="absolute right-4 top-4 text-gray-400 hover:text-gray-200"><i className="fas fa-times"></i></button>
            <h3 className="text-2xl font-bold">Request a Demo</h3>
            <form onSubmit={handleDemoSubmit} className="mt-4 space-y-4">
              <input type="text" name="Full Name" placeholder="Full Name" required className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" />
              <input type="email" name="Email Address" placeholder="Email Address" required className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="Organization" placeholder="Organization" required className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeDemo} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" className="submit-btn px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {trialOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeTrial}>
          <div className="bg-[#111827] p-6 rounded-2xl w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
            <button onClick={closeTrial} className="absolute right-4 top-4 text-gray-400 hover:text-gray-200"><i className="fas fa-times"></i></button>
            <h3 className="text-2xl font-bold">Start Free Trial</h3>
            <form onSubmit={handleTrialSubmit} className="mt-4 space-y-4">
              <input type="text" name="Full Name" placeholder="Full Name" required className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" />
              <input type="email" name="Email Address" placeholder="Email Address" required className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="Organization" placeholder="Organization" required className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeTrial} className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" className="submit-btn px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition">Start Trial</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {authOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeAuth}>
          <div className="modal-panel relative w-full max-w-md rounded-[1.75rem] border border-gray-700 bg-[#111827] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={closeAuth} className="absolute right-4 top-4 text-gray-400 hover:text-gray-200"><i className="fas fa-times"></i></button>
            <h3 className="text-2xl font-bold text-white">{authMode === 'login' ? 'Log In' : 'Sign Up'}</h3>
            <p className="mt-2 text-sm text-gray-400">Access your account with email and password.</p>
            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email address</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full rounded-2xl border border-gray-700 bg-[#0f1117] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {authErrors.email && <p className="text-xs text-red-400 mt-1">{authErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full rounded-2xl border border-gray-700 bg-[#0f1117] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {authErrors.password && <p className="text-xs text-red-400 mt-1">{authErrors.password}</p>}
              </div>
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm password</label>
                  <input type="password" value={authConfirm} onChange={e => setAuthConfirm(e.target.value)} className="w-full rounded-2xl border border-gray-700 bg-[#0f1117] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {authErrors.confirm && <p className="text-xs text-red-400 mt-1">{authErrors.confirm}</p>}
                </div>
              )}
              {authMode === 'login' && <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>}
              <div className="flex flex-col gap-3 pt-3">
                <button type="submit" className="btn-primary w-full">{authMode === 'login' ? 'Log In' : 'Create Account'}</button>
                <button type="button" onClick={closeAuth} className="btn-secondary w-full">Cancel</button>
              </div>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
              {authMode === 'login' ? 'Need an account?' : 'Already have an account?'}
              <button onClick={switchAuth} className="text-blue-400 hover:text-blue-300 font-semibold ml-1">{authMode === 'login' ? 'Sign up' : 'Log in'}</button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}