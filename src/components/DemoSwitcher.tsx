import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Shield, ArrowRight, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, quickLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = async (role: 'farmer' | 'operator' | 'admin') => {
    await quickLogin(role);
    if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'operator') navigate('/operator/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    setIsOpen(false);
  };

  return (
    <div className="bg-emerald-950 text-emerald-100 text-xs border-b border-emerald-800/80 px-4 py-1.5 transition-all z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-emerald-300/80">
            Current Persona:{' '}
            <strong className="text-white">
              {user ? `${user.name} (${user.role})` : 'Public Guest'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-medium transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Fast Role Switcher</span>
            {isOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            title="Open second window to test realtime 2-way live queue updates"
            className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 transition"
          >
            <span>2-Window Live Test</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {isOpen && (
        <div className="mt-2 pt-2 border-t border-emerald-800/60 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-400 font-medium">Switch Account:</span>
            <button
              onClick={() => handleSwitch('farmer')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition ${
                user?.role === 'FARMER'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Farmer: Rajesh Patil</span>
            </button>

            <button
              onClick={() => handleSwitch('operator')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition ${
                user?.role === 'OPERATOR'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏢 Operator: Parseoni Centre</span>
            </button>

            <button
              onClick={() => handleSwitch('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition ${
                user?.role === 'ADMIN'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>🛡️ APMC Admin Portal</span>
            </button>
          </div>

          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/');
                setIsOpen(false);
              }}
              className="text-red-400 hover:text-red-300 font-medium px-2 py-0.5 underline cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};
