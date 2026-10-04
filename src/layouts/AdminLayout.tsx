import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Building,
  UserCog,
  Users,
  CalendarCheck,
  ListOrdered,
  Scale,
  Receipt,
  FileBarChart,
  Sliders,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from '../components/DemoSwitcher';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { name: t('navigation.overview'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('admin.centres'), path: '/admin/centres', icon: Building },
    { name: t('admin.operators'), path: '/admin/operators', icon: UserCog },
    { name: t('admin.farmers'), path: '/admin/farmers', icon: Users },
    { name: t('admin.bookings'), path: '/admin/bookings', icon: CalendarCheck },
    { name: t('admin.queue'), path: '/admin/queue', icon: ListOrdered },
    { name: t('admin.procurement'), path: '/admin/procurement', icon: Scale },
    { name: t('admin.payments'), path: '/admin/payments', icon: Receipt },
    { name: t('admin.reports'), path: '/admin/reports', icon: FileBarChart },
    { name: t('admin.settings'), path: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans">
      <DemoSwitcher />

      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-stone-950 font-bold">
            <ShieldAlert className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-serif">Kisan Marg {t('admin.dashboard')}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                RESTRICTED
              </span>
            </div>
            <p className="text-xs text-stone-400">Maharashtra State Agricultural Marketing &amp; APMC Central Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-stone-200">{user?.email || 'Admin'}</p>
            <p className="text-[10px] text-stone-500">System Administrator</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </button>
        </div>
      </header>

      {/* Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-stone-200">
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-amber-100 text-amber-900 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-stone-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
