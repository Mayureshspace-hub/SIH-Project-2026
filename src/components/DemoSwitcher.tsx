import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, quickLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSwitch = async (role: 'farmer' | 'operator' | 'admin') => {
    setLoading(true);
    try {
      await quickLogin(role);
      if (role === 'farmer') navigate('/farmer/dashboard');
      else if (role === 'operator') navigate('/operator/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f5e59] text-white text-xs border-b border-[#0b4b47] px-4 py-1.5 transition-all z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kisan Marg Access:</span>
          </span>
          <span className="text-white/80">
            {user ? (
              <span>
                Logged in as <strong className="text-white underline">{user.name}</strong> ({user.role})
              </span>
            ) : (
              <span className="text-white/70">Not logged in</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60 text-[11px] hidden sm:inline">1-Click Login:</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSwitch('farmer')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              user?.role === 'FARMER'
                ? 'bg-amber-400 text-[#123c35]'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            👨‍🌾 Farmer (Rajesh)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSwitch('operator')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              user?.role === 'OPERATOR'
                ? 'bg-amber-400 text-[#123c35]'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            🏢 Operator (Vikas)
          </button>
          {user && (
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="px-2 py-0.5 rounded text-[11px] font-medium text-red-200 hover:text-white hover:bg-red-900/40 transition cursor-pointer ml-1"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
