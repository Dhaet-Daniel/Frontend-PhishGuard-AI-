// src/pages/Pricing.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Pricing() {
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  // toggle function as in Landing (can be shared via context, but simple duplication works)
  const toggleTheme = () => {
    const newVal = !isLight;
    setIsLight(newVal);
    document.body.classList.toggle('light-mode', newVal);
    localStorage.setItem('theme', newVal ? 'light' : 'dark');
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  // Reuse same auth logic as Landing (could extract, but for brevity copy)
  // ...

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-md border-b border-gray-800">
        {/* Same navbar as Landing but with active 'Pricing' link */}
      </nav>
      <main>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center fade-up">
              <h1 className="text-4xl font-bold">Choose Your Plan</h1>
              <p className="text-gray-400 mt-2">Select the perfect plan for your phishing protection needs.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Free plan card */}
              <div className="pricing-card bg-[#111827] border-2 border-gray-600 p-6 rounded-2xl text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold">Free</h3>
                <div className="mt-4 text-4xl font-bold">$0<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400 mt-2">Get started with basic protection.</p>
                <ul className="mt-6 space-y-3 text-gray-300">
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Up to 10 email scans/month</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Basic phishing detection</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Community support</li>
                  <li className="text-gray-500"><i className="fas fa-times mr-2"></i> No API access</li>
                  <li className="text-gray-500"><i className="fas fa-times mr-2"></i> No advanced features</li>
                </ul>
                <button className="mt-8 w-full py-2 bg-gray-600 text-white rounded-lg font-semibold transition hover:bg-gray-500">Get Started</button>
              </div>
              {/* Individual plan */}
              <div className="pricing-card bg-[#111827] p-6 rounded-2xl text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-105 border border-gray-800">
                <h3 className="text-2xl font-bold">Individual</h3>
                <div className="mt-4 text-4xl font-bold">$9.99<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400 mt-2">Perfect for personal use.</p>
                <ul className="mt-6 space-y-3 text-gray-300">
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Unlimited email scans</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Advanced AI detection</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Real-time alerts</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Email support</li>
                  <li className="text-gray-500"><i className="fas fa-times mr-2"></i> No team features</li>
                </ul>
                <button className="mt-8 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">Choose Plan</button>
              </div>
              {/* Business plan */}
              <div className="pricing-card bg-[#111827] p-6 rounded-2xl text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-105 border border-gray-800">
                <h3 className="text-2xl font-bold">Business</h3>
                <div className="mt-4 text-4xl font-bold">$29.99<span className="text-lg text-gray-400">/month per user</span></div>
                <p className="text-gray-400 mt-2">For small to medium teams.</p>
                <ul className="mt-6 space-y-3 text-gray-300">
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Everything in Individual</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Team management dashboard</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Priority support</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> API access (1000 req/day)</li>
                  <li className="text-gray-500"><i className="fas fa-times mr-2"></i> No custom integrations</li>
                </ul>
                <button className="mt-8 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">Choose Plan</button>
              </div>
              {/* Professional plan */}
              <div className="pricing-card bg-[#111827] p-6 rounded-2xl text-center hover:border-blue-500/50 transition-all duration-300 hover:scale-105 border border-gray-800">
                <h3 className="text-2xl font-bold">Professional</h3>
                <div className="mt-4 text-4xl font-bold">$49.99<span className="text-lg text-gray-400">/month per user</span></div>
                <p className="text-gray-400 mt-2">Enterprise-grade protection.</p>
                <ul className="mt-6 space-y-3 text-gray-300">
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Everything in Business</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Custom threat intelligence</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Dedicated account manager</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> SSO / SAML integration</li>
                  <li><i className="fas fa-check text-green-500 mr-2"></i> Advanced analytics</li>
                </ul>
                <button className="mt-8 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-[#0f1117] border-t border-gray-800">
        {/* Footer similar to landing */}
      </footer>
    </>
  );
}