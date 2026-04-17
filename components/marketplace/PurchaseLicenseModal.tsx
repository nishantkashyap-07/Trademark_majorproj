import { useState } from 'react';
import { ethers } from 'ethers';
import { licenseTrademark } from '@/utils/contracts';
import { useWeb3 } from '@/contexts/Web3Context';
import { Listing } from '@/types';

interface PurchaseLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  trademarkName: string;
  onSuccess?: () => void;
}

export default function PurchaseLicenseModal({
  isOpen,
  onClose,
  listing,
  trademarkName,
  onSuccess
}: PurchaseLicenseModalProps) {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Perpetual Access';
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days >= 365) return `${Math.floor(days / 365)} Year License`;
    if (days >= 30) return `${Math.floor(days / 30)} Month License`;
    return `${days} Day License`;
  };

  const handlePurchase = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!account) throw new Error('Wallet not connected');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      await licenseTrademark(signer, listing.listingId, listing.duration || 0, listing.price);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full !p-8 relative overflow-hidden animate-scale-in">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-2xl font-semibold text-white">License Acquisition</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4 text-center">Intellectual Property Asset</p>
            <h3 className="text-xl font-semibold text-white text-center mb-6">{trademarkName}</h3>
            <div className="flex items-center justify-between py-4 border-y border-white/5">
              <span className="text-xs font-bold text-slate-400">Duration</span>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{formatDuration(listing.duration || 0)}</span>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-bold text-slate-400">Total Capital Flux</span>
              <span className="text-xl font-semibold text-white">{listing.price} ETH</span>
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4">
            <h4 className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">Protocol Entitlements</h4>
            <ul className="space-y-2">
              {['Legal IP Usage Rights', 'Immutable Blockchain Record', 'Encrypted Asset Access'].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                  <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {error && <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 btn-glass !py-4 font-semibold text-xs uppercase tracking-widest">Abort</button>
            <button
              onClick={handlePurchase} disabled={isLoading}
              className="flex-1 btn-premium !py-4 font-semibold text-xs uppercase tracking-widest"
            >
              {isLoading ? 'Executing...' : 'Confirm Acquisition'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
