import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';

export const RoleSelectionLoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'OPERATOR'>('FARMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role: 'FARMER' | 'OPERATOR') => {
    setSelectedRole(role);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // If user's email is not verified, block access and show the verification screen
      if (!userCredential.user.emailVerified) {
        try {
          await sendEmailVerification(userCredential.user);
        } catch (sendErr) {
          console.warn('Could not resend email verification:', sendErr);
        }
        await signOut(auth);
        navigate('/verify-email', { state: { email } });
        return;
      }

      if (selectedRole) {
        localStorage.setItem('kisan_role', selectedRole);
      }
      try {
        await login({ email, password, role: selectedRole as Role });
      } catch {
        // Fallback or sync
      }

      if (selectedRole === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/operator/dashboard');
      }
    } catch (err: any) {
      setError('Email or password is incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(selectedRole as Role);
      if (selectedRole === 'FARMER') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/operator/dashboard');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      setError(err?.message || 'Failed to sign in with Google. Please try again.');
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

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-3 text-stone-500 font-semibold">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

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
