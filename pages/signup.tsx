import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const router = useRouter();
  const { registerInit, verifyAuth } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: 'creator',
  });

  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid corporate email required';
    if (!formData.organization.trim()) errors.organization = 'Organization name is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError('');
    setIsSubmitting(true);

    try {
      await registerInit(formData);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Onboarding initialization failed');
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
      await verifyAuth(formData.email, otpString);
      router.push('/dashboard?welcome=true');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] text-slate-900 dark:text-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <Head>
        <title>Initialize Organization | TrademarkChain</title>
      </Head>

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      <div className="relative z-10 w-full max-w-full md:max-w-[55%]">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors group mb-4">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7 7-7" /></svg>
            Back to Login
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Initialize</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.4em]">Protocol Node Onboarding</p>
          </div>
        </div>

        <div className="glass-card !p-10 !bg-white/70 dark:!bg-white/[0.01] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {step === 'info' ? (
            <form onSubmit={handleInitialize} className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Legal Representative Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className={`premium-input !h-12 !text-sm ${validationErrors.fullName ? 'border-rose-500/50' : ''}`}
                  />
                  {validationErrors.fullName && <p className="text-[10px] text-rose-500 font-bold ml-1">{validationErrors.fullName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Business Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="legal@company.com"
                    className={`premium-input !h-12 !text-sm ${validationErrors.email ? 'border-rose-500/50' : ''}`}
                  />
                  {validationErrors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{validationErrors.email}</p>}
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Organization / Entity Name</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Acme Corp Global"
                    className={`premium-input !h-12 !text-sm ${validationErrors.organization ? 'border-rose-500/50' : ''}`}
                  />
                  {validationErrors.organization && <p className="text-[10px] text-rose-500 font-bold ml-1">{validationErrors.organization}</p>}
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Primary Protocol Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="premium-input !h-12 !text-sm appearance-none cursor-pointer"
                  >
                    <option value="creator">IP Asset Creator (Owner)</option>
                    <option value="buyer">IP Licensee (Buyer)</option>
                    <option value="legal">Legal Representative / Compliance</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  ) : 'Register'}
                </button>
              </div>

              <p className="text-[9px] text-slate-400 font-medium text-center leading-relaxed">
                By initializing, you confirm your authority to represent the organization and agree to the
                <a href="#" className="text-indigo-500 font-bold ml-1">Protocol Governance Agreement</a>.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-slide-up">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Security Verification</h3>
                <p className="text-xs text-slate-500">Enter the verification code sent to <br /><span className="text-indigo-500 font-bold">{formData.email}</span></p>
              </div>

              <div className="flex justify-between gap-2 px-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-full h-14 bg-slate-50 dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/5 rounded-xl text-center text-xl font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Finalize Initialization'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="w-full text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
                >
                  Back to Identification
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Encryption Standard: AES-256-GCM
          </p>
        </div>
      </div>
    </div>
  );
}
