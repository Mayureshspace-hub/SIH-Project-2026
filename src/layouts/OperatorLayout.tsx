import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ListOrdered,
  Users2,
  CalendarDays,
  Scale,
  BadgePercent,
  BarChart3,
  Building,
  LogOut,
  Menu,
  X,
  Radio,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from '../components/DemoSwitcher';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export const OperatorLayout: React.FC = () => {
  const { user, operator, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { name: t('navigation.overview'), path: '/operator/dashboard', icon: Building2 },
    { name: t('operator.todayQueue'), path: '/operator/queue', icon: ListOrdered, live: true },
    { name: t('operator.farmers'), path: '/operator/farmers', icon: Users2 },
    { name: t('operator.bookings'), path: '/operator/bookings', icon: CalendarDays },
    { name: t('operator.procurement'), path: '/operator/procurement', icon: Scale },
    { name: t('operator.payments'), path: '/operator/payments', icon: BadgePercent },
    { name: t('operator.reports'), path: '/operator/reports', icon: BarChart3 },
    { name: t('operator.profile'), path: '/operator/profile', icon: Building },
    { name: t('operator.knowledgeHub'), path: '/operator/knowledge-hub', icon: BookOpen },
    { name: t('operator.aiImageAnalysis'), path: '/operator/ai-image-analysis', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      <DemoSwitcher />

      {/* Operator Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight font-serif">Kisan Marg</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t('operator.profile')}
                </span>
              </div>
              <p className="text-xs text-slate-400">{operator?.centre?.name || 'Centre Operator'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-slate-900 text-white border-b border-slate-800">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.live && <Radio className="w-3 h-3 text-red-400 animate-pulse ml-auto" />}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Desktop Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-slate-200">
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-emerald-100 text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {item.live && <Radio className="w-3 h-3 text-red-500 animate-pulse" />}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
