import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '../../firebase';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';

export const FarmerRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [landArea, setLandArea] = useState('5.0');
  const [password, setPassword] = useState('Farmer@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await api.syncFarmerProfile({ name, mobile, village, district, landArea: Number(landArea) });
      // Send verification email
      await sendEmailVerification(userCredential.user);
      // Do not sign them in automatically
      await signOut(auth);
      // Show verification screen with email and Login button
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('User already exists. Please sign in');
      } else {
        setError(err?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const signedInUser = await loginWithGoogle('FARMER');
      if (signedInUser) navigate('/farmer/dashboard');
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
    <div className="bg-[#faf8f5] py-12 md:py-20 text-[#1a2e2a] min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-9">
          <span className="text-xs font-bold text-[#0f5e59] tracking-[0.16em] uppercase mb-2 block">
            Farmer Enrollment
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#123c35]">
            Join Kisan Marg
          </h1>
          <p className="text-sm text-stone-500 mt-2">
            Create your digital farmer profile to book slots and skip weighbridge waiting.
          </p>
        </div>

        <div className="bg-white border border-[#0f5e59]/15 rounded-3xl p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,94,89,0.08)]">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar Patil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors placeholder:text-stone-400 focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors placeholder:text-stone-400 focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98000 00000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors placeholder:text-stone-400 focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Village / Tehsil</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Sawangi, Parseoni"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors placeholder:text-stone-400 focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                >
                  <option value="Nagpur">Nagpur</option>
                  <option value="Wardha">Wardha</option>
                  <option value="Bhandara">Bhandara</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Cultivable Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                />
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#faf8f5] border border-stone-200 rounded-xl transition-colors focus:outline-none focus:border-[#0f8a6a] focus:ring-4 focus:ring-[#0f8a6a]/10"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-[#0f5e59] hover:bg-[#0b4b47] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a317] focus-visible:ring-offset-2"
            >
              <span>{loading ? 'Registering...' : 'Complete Farmer Registration'}</span>
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
              className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:border-[#0f5e59]/50 bg-white hover:bg-[#faf8f5] text-stone-700 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a317] focus-visible:ring-offset-2"
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

          <div className="mt-5 text-center text-xs text-stone-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-emerald-800 hover:underline">
              Sign In to Your Account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
