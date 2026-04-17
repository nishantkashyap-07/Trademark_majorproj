import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const { isAuthenticated, sendOtp, verifyAuth, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email is required');

    setError('');
    setIsSubmitting(true);

    try {
      await sendOtp(email);
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return setError('Please enter the 6-digit verification code');

    setError('');
    setIsSubmitting(true);

    try {
      await verifyAuth(email, otpString);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid verification session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus move
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <Head>
        <title>Identity Access | TrademarkChain</title>
      </Head>

      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Branding */}
        <div className="text-center mb-10 space-y-4">
          <Link href="/" className="inline-block group">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-slate-200 dark:border-white/5 mx-auto group-hover:scale-105 transition-transform duration-500">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Protocol Access</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Identity Verification Gateway</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card !p-10 !bg-white/80 dark:!bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-2xl relative">
          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Corporate Identity (Email)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="authorized@protocol.io"
                    required
                    className="premium-input !pl-12 !h-14 !text-sm !bg-slate-50 dark:!bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Generate Access Code'}
                </button>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose text-center">
                  By continuing, you verify compliance with the <a href="#" className="text-indigo-500 hover:underline">universal protocol standards</a>.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-slide-up">
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Verify Identity</h3>
                <p className="text-xs text-slate-500 font-medium">Code sent to <span className="text-indigo-500 font-bold">{email}</span></p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className="w-full h-14 bg-slate-50 dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/5 rounded-xl text-center text-xl font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest hover:underline"
                  >
                    Change Email
                  </button>
                  {countdown > 0 ? (
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest italic">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                ) : 'Authenticate Session'}
              </button>
            </form>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 text-center space-y-6">
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            First time in the protocol? <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors border-b-2 border-indigo-500/20 pb-1">Initialize Organization</Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-all group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7 7-7" /></svg>
            Registry Index
          </Link>
        </div>
      </div>
    </div>
  );
}
