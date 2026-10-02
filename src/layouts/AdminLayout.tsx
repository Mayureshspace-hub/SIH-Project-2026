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

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Procurement Centres', path: '/admin/centres', icon: Building },
    { name: 'Centre Operators', path: '/admin/operators', icon: UserCog },
    { name: 'Farmers Roster', path: '/admin/farmers', icon: Users },
    { name: 'Bookings & Slots', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Queue Monitoring', path: '/admin/queue', icon: ListOrdered },
    { name: 'Procurement Records', path: '/admin/procurement', icon: Scale },
    { name: 'Payment Clearance', path: '/admin/payments', icon: Receipt },
    { name: 'Analytics & Reports', path: '/admin/reports', icon: FileBarChart },
    { name: 'System Settings', path: '/admin/settings', icon: Sliders },
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
              <span className="font-bold text-base tracking-tight text-white font-serif">Kisan Marg Admin Portal</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                RESTRICTED
              </span>
            </div>
            <p className="text-xs text-stone-400">Maharashtra State Agricultural Marketing &amp; APMC Central Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white">{user?.name || 'Dr. Anand Verma'}</p>
            <p className="text-[11px] text-stone-400">APMC State Commissioner</p>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium border border-stone-700 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800 p-4 shrink-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-amber-600 text-stone-950 font-bold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-stone-800">
            <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700 text-xs text-stone-400">
              <p className="font-semibold text-stone-200">Regulatory Audit</p>
              <p className="text-[11px] mt-0.5">Audit logging enabled. All centre registrations and slot adjustments are tracked.</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
