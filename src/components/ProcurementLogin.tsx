import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { procurementAuth } from '../services/procurementAuth';

interface ProcurementLoginProps {
  onSuccess?: () => void;
}

export const ProcurementLogin: React.FC<ProcurementLoginProps> = ({ onSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await procurementAuth.login({
        usernameOrEmail,
        password,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/operator/procurement-centre');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid Procurement Centre credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0f5e59] shrink-0" />
        <span>Authorised APMC Procurement Centre Operator Portal. Single-credential login.</span>
      </div>

      <form onSubmit={handleOperatorSubmit} className="space-y-4">
        {/* Email or Username */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Email or Username
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="operator@parseoni.demo"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors placeholder:text-stone-400 focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors placeholder:text-stone-400 focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
            />
          </div>
        </div>

        {/* Dedicated Procurement Centre Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f5e59] hover:bg-[#0b4b47] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a317] focus-visible:ring-offset-2"
        >
          <span>{loading ? 'Authenticating Centre...' : 'Sign In as Procurement Centre'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Predefined Operator Credential Helper for Convenience */}
      <div className="mt-5 pt-4 border-t border-stone-100 bg-[#faf8f5] p-3 rounded-xl text-xs text-stone-600">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-[#123c35] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0f5e59]" />
            <span>Predefined Centre Credential</span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-[#0f5e59] px-2 py-0.5 rounded font-mono font-bold">Parseoni</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setUsernameOrEmail('operator@parseoni.demo');
            setPassword('Operator@123');
            setError(null);
          }}
          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-[#0f8a6a] text-[11px] font-medium text-stone-700 hover:text-[#0f5e59] transition cursor-pointer flex items-center justify-between"
        >
          <span>operator@parseoni.demo (Pass: Operator@123)</span>
          <span className="text-[#0f5e59] font-bold">Auto-Fill &rarr;</span>
        </button>
      </div>

      <div className="mt-4 text-center text-[11px] text-stone-400">
        Procurement Centre accounts are assigned and authorised by State APMC Administration.
      </div>
    </div>
  );
};