import { useState } from 'react';
import { ethers } from 'ethers';
import { buyTrademark } from '@/utils/contracts';
import { useWeb3 } from '@/contexts/Web3Context';
import { Listing } from '@/types';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  trademarkName: string;
  trademarkId?: string;
  onSuccess?: () => void;
}

export default function BuyModal({ isOpen, onClose, listing, trademarkName, trademarkId, onSuccess }: BuyModalProps) {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBuy = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!account) throw new Error('Wallet not connected');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const hash = await buyTrademark(signer, listing.listingId, listing.price);
      setTxHash(hash);

      // Transfer full platform ownership in the database
      if (trademarkId) {
        try {
          await fetch(`/api/trademarks/${trademarkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ownerId: account })
          });
        } catch (dbErr) {
          console.error("Failed to update database ownership:", dbErr);
        }
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (txHash) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
        <div className="glass-card max-w-md w-full !p-8 relative overflow-hidden animate-scale-in !bg-white dark:!bg-[#0a0c10] !border-slate-200 dark:!border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Ownership Transferred!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">You are now the verified owner of this IP asset on the blockchain.</p>
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank" rel="noopener noreferrer"
            className="block text-[10px] font-mono font-bold text-indigo-500 hover:text-indigo-400 truncate mb-8 transition-colors"
          >
            {txHash}
          </a>
          <button
            onClick={onClose}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full !p-8 relative overflow-hidden animate-scale-in !bg-white dark:!bg-[#0a0c10] !border-slate-200 dark:!border-white/10 shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 dark:bg-teal-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Asset</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Full Ownership Transfer Protocol</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-400 transition-all duration-300 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Asset summary card */}
        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 p-6 mb-6 relative z-10">
          <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-3 text-center">Acquiring IP Asset</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-6 truncate">{trademarkName}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Transaction Type</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest rounded-full">Outright Purchase</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">Sale Price</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{listing.price} <span className="text-sm text-slate-400 dark:text-white/40">MATIC</span></span>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 mb-6 relative z-10">
          <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">You Will Receive</h4>
          <ul className="space-y-2">
            {['Full NFT Ownership Transfer', 'Permanent On-Chain Record', 'IP Usage & Commercial Rights', 'Creator Royalty Protocol Active'].map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-center mb-4 relative z-10">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        )}

        <div className="flex gap-4 relative z-10">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95">Cancel</button>
          <button
            onClick={handleBuy} disabled={isLoading}
            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Confirming...
              </>
            ) : `Buy for ${listing.price} MATIC`}
          </button>
        </div>
      </div>
    </div>
  );
}
