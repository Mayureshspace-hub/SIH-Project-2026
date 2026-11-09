import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarCheck2,
  Clock,
  FileText,
  CreditCard,
  Bell,
  UserCheck,
  LogOut,
  Sprout,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { DemoSwitcher } from '../components/DemoSwitcher';
import { LanguageSelector } from '../components/LanguageSelector';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

export const FarmerLayout: React.FC = () => {
  const { user, farmer, logout } = useAuth();
  const { lastFarmerUpdate } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveQueueData, setLiveQueueData] = useState<any>(null);

  // Fetch notifications count and live queue status
  useEffect(() => {
    let mounted = true;
    api.getNotifications().then((res) => {
      if (mounted) setUnreadCount(res.unreadCount);
    }).catch(() => {});

    api.getFarmerLiveQueue().then((res) => {
      if (mounted && res && res.tokenNumber) {
        setLiveQueueData(res);
      }
    }).catch(() => {});

    return () => { mounted = false; };
  }, [location.pathname, lastFarmerUpdate]);

  useEffect(() => {
    if (lastFarmerUpdate) {
      setLiveQueueData(lastFarmerUpdate);
    }
  }, [lastFarmerUpdate]);

  const navItems = [
    { name: t('navigation.overview'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: t('navigation.findCentre'), path: '/farmer/centres', icon: Search },
    { name: t('navigation.bookSlot'), path: '/farmer/book-slot', icon: CalendarCheck2 },
    {
      name: t('navigation.myQueue'),
      path: '/farmer/queue',
      icon: Clock,
      badge: liveQueueData?.tokenNumber ? 'LIVE' : null,
    },
    { name: t('navigation.myBookings'), path: '/farmer/bookings', icon: FileText },
    { name: t('navigation.procurement'), path: '/farmer/procurement', icon: ShieldCheck },
    { name: t('navigation.paymentStatus'), path: '/farmer/payments', icon: CreditCard },
    {
      name: t('navigation.notifications'),
      path: '/farmer/notifications',
      icon: Bell,
      count: unreadCount,
    },
    { name: t('navigation.profile'), path: '/farmer/profile', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans">
      <DemoSwitcher />

      {/* Top Mobile/Desktop Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/farmer/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-lg font-bold text-emerald-950 font-serif leading-none">Kisan Marg</span>
              <span className="block text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">
                {t('farmer.dashboard')}
              </span>
            </div>
          </Link>
        </div>

        {/* Live Token Status Pill */}
        {liveQueueData?.tokenNumber && (
          <Link
            to="/farmer/queue"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-medium hover:bg-amber-100 transition shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{t('procurement.token')}: <strong>{liveQueueData.tokenNumber}</strong></span>
            <span className="text-stone-400">•</span>
            <span>{liveQueueData.farmersAhead} {t('queue.yourPosition')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
          </Link>
        )}

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link
            to="/farmer/notifications"
            className="relative p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition"
            title={t('navigation.notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-stone-200">
            <div className="text-right">
              <p className="text-xs font-bold text-stone-900 leading-tight">{user?.name || 'Rajesh Patil'}</p>
              <p className="text-[11px] text-stone-500">{farmer?.farmerId || 'MH-NAG-2026-0814'}</p>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title={t('common.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 p-4 shrink-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                        isActive ? 'bg-white text-emerald-900' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-stone-200">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs text-stone-600">
              <p className="font-semibold text-stone-900 mb-0.5">{t('common.help')}</p>
              <p className="text-[11px] text-stone-500">Kisan Call Centre Toll-Free:</p>
              <p className="font-mono font-bold text-emerald-800 mt-1">1800-180-1551</p>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-stone-900/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <span className="font-serif font-bold text-emerald-950 text-lg">{t('farmer.dashboard')}</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-emerald-800 text-white' : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-stone-200">
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Mandatory per Section 7 & 56) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 flex items-center justify-around px-2 py-2 shadow-lg">
        <Link
          to="/farmer/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            location.pathname === '/farmer/dashboard' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t('common.home')}</span>
        </Link>

        <Link
          to="/farmer/centres"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            location.pathname.startsWith('/farmer/centres') ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>{t('navigation.centres')}</span>
        </Link>

        <Link
          to="/farmer/book-slot"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            location.pathname === '/farmer/book-slot' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <CalendarCheck2 className="w-5 h-5" />
          <span>{t('navigation.bookSlot')}</span>
        </Link>

        <Link
          to="/farmer/queue"
          className={`relative flex flex-col items-center gap-1 text-[10px] font-medium ${
            location.pathname === '/farmer/queue' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{t('navigation.queue')}</span>
          {liveQueueData?.tokenNumber && (
            <span className="absolute -top-1 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
          )}
        </Link>

        <Link
          to="/farmer/profile"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            location.pathname === '/farmer/profile' ? 'text-emerald-800 font-bold' : 'text-stone-500'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>{t('navigation.profile')}</span>
        </Link>
      </nav>
    </div>
  );
};
