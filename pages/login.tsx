import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ParticleField from '@/components/ui/ParticleField';
import GridBackground from '@/components/ui/GridBackground';

export default function Login() {
  const router = useRouter();
  const { isAuthenticated, login, loginWithGoogle, isLoading: authLoading } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      await loginWithGoogle();
      // Will redirect via useEffect when authenticated
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Will redirect via useEffect when authenticated
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <Head>
        <title>Login | TrademarkChain Protocol</title>
      </Head>

      {/* Ambient Visuals */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Login Container */}
      <div className="relative z-10 w-full max-w-[420px] space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-100 dark:border-white/5 mx-auto hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Secure Access</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your decentralized assets and registrations.</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card !p-10 !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 shadow-sm relative overflow-hidden">
          {!loginMethod ? (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] text-center mb-2">Authentication Gateway</h2>
              
              <div className="space-y-4">
                {/* Email Login Option */}
                <button
                  onClick={() => setLoginMethod('email')}
                  className="w-full group p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Standard Login</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Email & Password</p>
                    </div>
                  </div>
                </button>

                {/* Google Login Option */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full group p-5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-slate-400/50 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-white rounded-xl flex items-center justify-center border border-slate-100 dark:border-white shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Google Identity</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">One-click access</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl">
                <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 font-medium leading-relaxed italic text-center">
                  Web3 features will be available upon connecting your cryptographic wallet post-authentication.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              <button
                onClick={() => setLoginMethod(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group"
              >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                Back to selector
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Access</h3>
                <p className="text-xs text-slate-500 font-medium">Verify your registered credentials</p>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    required
                    className="premium-input !h-12 !text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="premium-input !h-12 !text-sm"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                      <input type="checkbox" className="sr-only" />
                      <div className="w-2 h-2 rounded-sm bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">Remember session</span>
                  </label>
                  <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Reset Pass</a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting || authLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                  ) : 'Continue Access'}
                </button>
              </form>

              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Confidential System Access. Unauthorized entry is prohibited.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-slate-500 font-medium">
            New to the protocol? <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Create an Organization</Link>
          </p>
          <Link href="/" className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors">
            ← Registry Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
