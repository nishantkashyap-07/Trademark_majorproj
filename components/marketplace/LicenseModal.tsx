import { useState } from 'react';
import { ethers } from 'ethers';
import { createListing } from '@/utils/contracts';
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
      const provider = new ethers.BrowserProvider(window.ethereum);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full !p-8 relative overflow-hidden animate-scale-in">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-2xl font-semibold text-white">Issue License</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="mb-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Asset Target</p>
          <p className="text-white font-semibold">{trademarkName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Price per period (ETH)</label>
            <input
              type="number" step="0.001" min="0.001" value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="premium-input" placeholder="0.05" required
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">License Vector (Duration)</label>
            <div className="grid grid-cols-2 gap-3">
              {LICENSE_DURATIONS.map((opt) => (
                <button
                  key={opt.label} type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`px-4 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${duration === opt.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-4">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed">System automates royalty collection. Owner retains 100% NFT equity during active lease.</p>
          </div>

          {error && <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-glass !py-3 font-semibold text-xs uppercase tracking-widest">Abort</button>
            <button
              type="submit" disabled={isLoading}
              className="flex-1 btn-premium !py-3 font-semibold text-xs uppercase tracking-widest"
            >
              {isLoading ? 'Processing...' : 'Authorize Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
