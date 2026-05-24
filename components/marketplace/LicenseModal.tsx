import { useState } from 'react';
import { ethers } from 'ethers';
import { createListing, getStaticProvider } from '@/utils/contracts';
import { useWeb3 } from '@/contexts/Web3Context';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  trademarkName: string;
  onSuccess?: () => void;
}

const LICENSE_DURATIONS = [
  { label: '1 Month', value: 30 * 24 * 60 * 60 },
  { label: '3 Months', value: 90 * 24 * 60 * 60 },
  { label: '6 Months', value: 180 * 24 * 60 * 60 },
  { label: '1 Year', value: 365 * 24 * 60 * 60 },
];

export default function LicenseModal({ isOpen, onClose, tokenId, trademarkName, onSuccess }: LicenseModalProps) {
  const { account } = useWeb3();
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState(30 * 24 * 60 * 60);
  const [listingExpiry, setListingExpiry] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!account) throw new Error('Wallet not connected');
      const provider = getStaticProvider();
      const signer = await provider.getSigner();
      const { trademarkNFT, marketplace } = await import('@/utils/contracts').then(m => m.getContracts(signer));
      const owner = await trademarkNFT.ownerOf(tokenId);
      if (owner.toLowerCase() !== account.toLowerCase()) throw new Error('Ownership verification failed');

      const isApproved = await trademarkNFT.isApprovedForAll(account, await marketplace.getAddress());
      if (!isApproved) {
        const approveTx = await trademarkNFT.setApprovalForAll(await marketplace.getAddress(), true);
        await approveTx.wait();
      }

      await createListing(signer, {
        tokenId,
        price,
        isLicense: true,
        duration,
        expiresAt: listingExpiry > 0 ? Math.floor(Date.now() / 1000) + (listingExpiry * 24 * 60 * 60) : 0,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full !p-8 relative overflow-hidden animate-scale-in !bg-white dark:!bg-[#0a0c10] !border-slate-200 dark:!border-white/10 shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 dark:bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Issue License</h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] mt-1">Acquisition Protocol Configuration</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-400 transition-all duration-300 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
             <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Asset ID</p>
             <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">#{tokenId}</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
             <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Target Identity</p>
             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{trademarkName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1 mb-2.5 block">Subscription Premium (MATIC)</label>
            <div className="relative group">
               <input
                 type="number" step="0.001" min="0.001" max="1000000" value={price}
                 onKeyDown={(e) => {
                   if (['e', 'E', '+', '-'].includes(e.key)) {
                     e.preventDefault();
                   }
                 }}
                 onChange={(e) => {
                   const val = parseFloat(e.target.value);
                   if (val > 1000000) setPrice('1000000');
                   else setPrice(e.target.value);
                 }}
                 className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all appearance-none"
                 placeholder="0.00" required
                 style={{ MozAppearance: 'textfield' }}
               />
               <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest pointer-events-none">MATIC</div>
            </div>
          </div>

          <style jsx>{`
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}</style>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1 mb-2.5 block">Access Duration</label>
            <div className="grid grid-cols-2 gap-3">
              {LICENSE_DURATIONS.map((opt) => (
                <button
                  key={opt.label} type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`px-4 py-3.5 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${duration === opt.value 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'bg-slate-50 dark:bg-white/[0.03] border-transparent text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[10px] font-bold text-amber-600/80 dark:text-amber-500/60 leading-relaxed uppercase tracking-wider">
               System automates royalty distribution. Owner retains full NFT equity during active lease protocol.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-center animate-shake">
               <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95">Abort</button>
            <button
              type="submit" disabled={isLoading}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : 'Authorize Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
