import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const RoleSelectionLoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'OPERATOR'>('FARMER');
  const [email, setEmail] = useState('farmer@demo.com');
  const [password, setPassword] = useState('Farmer@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRoleChange = (role: 'FARMER' | 'OPERATOR') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'FARMER') {
      setEmail('farmer@demo.com');
      setPassword('Farmer@123');
    } else {
      setEmail('operator@parseoni.demo');
      setPassword('Operator@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Only redirect when a real session exists after login
      if (data?.session) {
        navigate('/');
      } else {
        setError('No active session found. Please verify your email before logging in.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 py-12 md:py-20 text-stone-900 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1 block">
            Portal Access
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
            Sign In to KisanSetu
          </h1>
          <p className="text-xs text-stone-500 mt-1">Select your account persona below to continue.</p>
        </div>

        {/* Role Selection Box: Farmer vs Centre (Section 6) */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-3 text-center">
            Who are you?
          </label>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('FARMER')}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                selectedRole === 'FARMER'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                  : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs">👨‍🌾 Farmer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('OPERATOR')}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition cursor-pointer ${
                selectedRole === 'OPERATOR'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                  : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-stone-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs">🏢 Procurement Centre</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'FARMER' ? 'Farmer' : 'Centre Operator'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Quick Demo Autofill Notice */}
          <div className="mt-5 pt-4 border-t border-stone-100 bg-stone-50 p-3 rounded-xl text-xs text-stone-600">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-emerald-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Demo Credentials Loaded
              </span>
            </div>
            <p className="font-mono text-[11px] text-stone-500">
              User: <strong className="text-stone-800">{email}</strong> | Pass: <strong className="text-stone-800">{password}</strong>
            </p>
          </div>

          {/* Registration link ONLY for Farmers, never for Operators per Section 6 */}
          {selectedRole === 'FARMER' ? (
            <div className="mt-5 text-center text-xs text-stone-600">
              Don&apos;t have a farmer account?{' '}
              <Link to="/register" className="font-bold text-emerald-800 hover:underline">
                Register as Farmer &rarr;
              </Link>
            </div>
          ) : (
            <div className="mt-4 text-center text-[11px] text-stone-400">
              Procurement Centre operator accounts are verified &amp; approved by State APMC Administration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
