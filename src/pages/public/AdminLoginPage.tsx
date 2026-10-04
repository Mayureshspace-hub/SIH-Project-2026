import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@demo.Kisan Marg');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password, role: 'ADMIN' });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Access denied. Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-900 py-16 text-stone-100 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Portal</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            APMC State Administration
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Restricted access for State Agricultural Marketing &amp; Procurement Regulators
          </p>
        </div>

        <div className="bg-stone-800/90 border border-stone-700 rounded-3xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-stone-900 border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Security Key / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-stone-900 border border-stone-700 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Authenticate & Enter Admin Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-700/80 text-[11px] text-stone-400 text-center font-mono">
            Demo Root: admin@demo.Kisan Marg | Admin@123
          </div>
        </div>
      </div>
    </div>
  );
};
