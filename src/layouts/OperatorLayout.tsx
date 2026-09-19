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
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DemoSwitcher } from '../components/DemoSwitcher';

export const OperatorLayout: React.FC = () => {
  const { user, operator, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/operator/dashboard', icon: Building2 },
    { name: "Today's Live Queue", path: '/operator/queue', icon: ListOrdered, live: true },
    { name: 'Farmers List', path: '/operator/farmers', icon: Users2 },
    { name: 'Bookings & Slots', path: '/operator/bookings', icon: CalendarDays },
    { name: 'Procurement Slip', path: '/operator/procurement', icon: Scale },
    { name: 'Payment Updates', path: '/operator/payments', icon: BadgePercent },
    { name: 'Daily Reports', path: '/operator/reports', icon: BarChart3 },
    { name: 'Centre Profile', path: '/operator/profile', icon: Building },
    { name: 'Knowledge Hub', path: '/operator/knowledge-hub', icon: BookOpen },
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
                <span className="font-bold text-base tracking-tight text-white">Parseoni Procurement Centre</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  Live Operational Desk
                </span>
              </div>
              <p className="text-xs text-slate-400">Station Code: PRS-WB-01 • Nagpur District</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white">{user?.name || 'Vikas Deshpande'}</p>
            <p className="text-[11px] text-slate-400">Badge: {operator?.badgeNo || 'REG-PRS-001'}</p>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content & Sidebar */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 shrink-0">
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
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.live && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">Terminal Security</p>
              <p className="text-[11px] mt-0.5">Procurement transactions cryptographically validated and logged to APMC repository.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-slate-900 h-full p-4 flex flex-col text-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white text-base">Centre Operations</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
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
                        isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.live && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
