import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sprout, ArrowRight, Shield } from 'lucide-react';
import { DemoSwitcher } from '../components/DemoSwitcher';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Centres', path: '/centres' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <DemoSwitcher />

      {/* Minimal Public Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-800 transition">
              <Sprout className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-emerald-950 font-serif">Kisan Marg</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Procurement &amp; Live Queue
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition hover:text-emerald-700 ${
                  location.pathname === link.path ? 'text-emerald-800 font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={
                  user.role === 'FARMER'
                    ? '/farmer/dashboard'
                    : user.role === 'OPERATOR'
                    ? '/operator/dashboard'
                    : '/admin/dashboard'
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-900 transition shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-stone-700 hover:text-emerald-800 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-900 transition shadow-xs"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="bg-stone-900 text-stone-400 text-sm border-t border-stone-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-white font-semibold text-base font-serif">Kisan Marg</span>
              <span className="text-xs text-stone-500">| Smart India Hackathon 2026 Initiative</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-stone-400">
              <Link to="/how-it-works" className="hover:text-stone-200 transition">How It Works</Link>
              <Link to="/centres" className="hover:text-stone-200 transition">Centres</Link>
              <Link to="/about" className="hover:text-stone-200 transition">About</Link>
              
              {/* Subtle Admin Portal footer link as explicitly instructed in Prompt Section 5 & 29 */}
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-1 text-stone-500 hover:text-emerald-400 transition"
                title="Restricted APMC Central Administration"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
            &copy; 2026 Kisan Marg. Designed to eliminate waiting lines and bring transparency to agricultural procurement.
          </div>
        </div>
      </footer>
    </div>
  );
};
