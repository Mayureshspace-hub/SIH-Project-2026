import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { auth } from '../../firebase';
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = (location.state as { email?: string })?.email || searchParams.get('email') || 'your email';

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [passwordForResend, setPasswordForResend] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordForResend) {
      setShowPasswordPrompt(true);
      return;
    }

    setResending(true);
    setResendStatus(null);
    setResendError(null);

    try {
      // Authenticate temporarily to send verification email
      const userCredential = await signInWithEmailAndPassword(auth, email, passwordForResend);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendStatus('A new verification email has been sent. Please check your inbox.');
      setShowPasswordPrompt(false);
      setPasswordForResend('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setResendError('Incorrect password. Please enter your account password to resend.');
      } else {
        setResendError(err.message || 'Unable to resend verification email right now.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-stone-50 py-12 md:py-20 text-stone-900 min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center">
          {/* Email Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 mx-auto mb-5 shadow-xs">
            <Mail className="w-8 h-8 text-emerald-700" />
          </div>

          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1 block">
            Email Verification
          </span>
          <h1 className="text-2xl font-serif font-bold text-emerald-950 mb-4">
            Verify Your Account
          </h1>

          {/* Requested Exact Notification Message */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 mb-6 text-stone-800 text-sm leading-relaxed text-left">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-950">
                  We have sent you a verification email to{' '}
                  <strong className="font-bold underline decoration-emerald-500 decoration-2 underline-offset-2">
                    {email}
                  </strong>
                  . Please verify it and log in.
                </p>
                <p className="text-xs text-stone-600 mt-2">
                  Click the link in the email to activate your account. If you don&apos;t see it, check your spam or junk folder.
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Optional Resend Option */}
            {!showPasswordPrompt ? (
              <button
                type="button"
                onClick={() => setShowPasswordPrompt(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-600 hover:text-stone-900 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Didn&apos;t receive the email? Resend verification</span>
              </button>
            ) : (
              <form onSubmit={handleResend} className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl text-left space-y-2">
                <label className="block text-[11px] font-semibold text-stone-700">
                  Enter password to resend email to {email}:
                </label>
                <input
                  type="password"
                  required
                  placeholder="Your password"
                  value={passwordForResend}
                  onChange={(e) => setPasswordForResend(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={resending}
                    className="flex-1 py-1.5 px-3 bg-emerald-800 text-white text-xs font-medium rounded-lg hover:bg-emerald-900 disabled:opacity-60 cursor-pointer"
                  >
                    {resending ? 'Sending...' : 'Send Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setResendError(null);
                    }}
                    className="py-1.5 px-3 border border-stone-200 text-stone-600 text-xs rounded-lg hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {resendStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-1.5 text-left">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{resendStatus}</span>
              </div>
            )}

            {resendError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{resendError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
