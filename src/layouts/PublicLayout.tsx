import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Menu,
  X,
  LogOut,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DemoSwitcher } from '../components/DemoSwitcher';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { name: t('navigation.home'), path: '/' },
    { name: t('navigation.howItWorks'), path: '/how-it-works' },
    { name: t('navigation.centres'), path: '/centres' },
    { name: t('navigation.about'), path: '/about' },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1a2e2a]"
      style={{
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <DemoSwitcher />

      {/* Top Info Strip */}
      <div className="bg-[#0f5e59] text-white/80 text-xs py-1.5 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>🌾 Empowering Indian Agriculture through Digital Innovation</span>
          <div className="flex items-center gap-4">
            <span>📞 Helpline: 1800-XXX-XXXX</span>
            <span>🕐 Mon–Sat, 8 AM – 6 PM</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
          >
            <img
              alt="Kisan Marg emblem"
              className="h-11 w-11 md:h-12 md:w-12 object-contain"
              src="/assets/kisan-marg-logo-emblem.png"
            />
            <span className="text-xl md:text-2xl font-extrabold tracking-tight whitespace-nowrap">
              <span className="text-[#175C4D]">Kisan</span>{' '}
              <span className="text-[#E8A317]">Marg</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1a2e2a]/60">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-[#0f5e59] relative py-1 ${
                  location.pathname === link.path
                    ? 'text-[#0f5e59] font-semibold'
                    : ''
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-[1.125rem] left-0 right-0 h-0.5 bg-[#0f5e59] rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    user.role === 'FARMER'
                      ? '/farmer/dashboard'
                      : user.role === 'OPERATOR'
                      ? '/operator/dashboard'
                      : '/admin/dashboard'
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f5e59] text-white text-sm font-medium hover:bg-[#0d4f4b] transition shadow-sm"
                >
                  <span>{t('navigation.goToDashboard')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-600 hover:text-red-600 transition cursor-pointer"
                  title={t('common.logout')}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block px-3.5 py-2 text-sm font-medium text-[#1a2e2a]/70 hover:text-[#0f5e59] transition-colors"
                >
                  {t('navigation.login')}
                </Link>

                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-5 py-2 rounded-lg bg-[#0f5e59] text-white text-sm font-medium hover:bg-[#0d4f4b] transition shadow-sm"
                >
                  {t('navigation.register')}
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#1a2e2a]/70 hover:bg-stone-100 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-stone-200/60 bg-white"
            >
              <nav className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-[#0f5e59]/5 text-[#0f5e59] font-semibold'
                        : 'text-[#1a2e2a]/70 hover:bg-stone-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    {t('common.logout')}
                  </button>
                ) : (
                  <div className="pt-3 border-t border-stone-100 flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium text-[#0f5e59] border border-[#0f5e59]/20 hover:bg-[#0f5e59]/5 transition-colors"
                    >
                      {t('navigation.login')}
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-[#0f5e59] text-white hover:bg-[#0d4f4b] transition"
                    >
                      {t('navigation.register')}
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="relative mt-auto overflow-hidden bg-[#063d2e] bg-cover bg-center text-white/70 text-sm"
        style={{ backgroundImage: "url('/assets/kisan-marg-footer-landscape.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#063d2e]/30 via-[#063d2e]/65 to-[#022d24]/95" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

            {/* Brand */}
            <div className="lg:pr-6">
              <Link to="/" className="inline-block group mb-4">
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-white">Kisan</span>{' '}
                  <span className="text-[#f7c531]">Marg</span>
                </span>
              </Link>

              <p className="max-w-xs text-white/80 text-sm leading-relaxed">
                Smart Farmer Procurement & Live Queue Platform.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">
                Quick Links
              </h4>
              <div className="space-y-2.5">
                <Link to="/" className="block text-sm text-white/75 hover:text-[#f7c531] transition-colors">Home</Link>
                <Link to="/how-it-works" className="block text-sm text-white/75 hover:text-[#f7c531] transition-colors">How It Works</Link>
                <Link to="/centres" className="block text-sm text-white/75 hover:text-[#f7c531] transition-colors">Centres</Link>
                <Link to="/about" className="block text-sm text-white/75 hover:text-[#f7c531] transition-colors">About</Link>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">
                Platform
              </h4>
              <div className="space-y-2.5">
                <Link to="/login" className="block text-sm text-white/75 hover:text-[#f7c531] transition-colors">Farmer Login</Link>
                <Link to="/register" className="block text-sm text-white/75 hover:text-[#f7c531] transition-colors">Register</Link>
                <Link
                  to="/admin-login"
                  className="inline-flex items-center gap-1 text-sm text-white/75 hover:text-[#f7c531] transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  Admin Portal
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">
                Contact
              </h4>
              <div className="space-y-3 text-sm text-white/75">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#f7c531]" />
                  Helpline: 1800-XXX-XXXX
                </p>
                <a
                  className="flex items-center gap-2 hover:text-[#f7c531] transition-colors"
                  href="mailto:support@kisanmarg.gov.in"
                >
                  <Mail className="w-4 h-4 text-[#f7c531]" />
                  support@kisanmarg.gov.in
                </a>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#f7c531]" />
                  Mon–Sat, 8 AM – 6 PM
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/65">
              &copy; 2026 Kisan Marg. Designed to eliminate waiting lines and bring transparency to agricultural procurement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};