import { useState } from 'react';
import { createListing, getStaticProvider } from '@/utils/contracts';
import { useWeb3 } from '@/contexts/Web3Context';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  trademarkName: string;
  onSuccess?: () => void;
}

export default function SellModal({ isOpen, onClose, tokenId, trademarkName, onSuccess }: SellModalProps) {
  const { account } = useWeb3();
  const [price, setPrice] = useState('');
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

      // Verify the token actually exists on-chain before doing anything
      let owner: string;
      try {
        owner = await trademarkNFT.ownerOf(tokenId);
      } catch (contractErr: any) {
        const msg = contractErr?.reason || contractErr?.message || '';
        if (msg.includes('invalid token ID') || msg.includes('nonexistent token') || msg.includes('ERC721')) {
          throw new Error(
            'This asset was registered in offline/dev mode and has no on-chain NFT. Only assets minted on the blockchain can be listed for sale.'
          );
        }
        throw contractErr;
      }

      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error('You are not the on-chain owner of this NFT.');
      }

      // Approve marketplace to transfer NFT on sale
      const isApproved = await trademarkNFT.isApprovedForAll(account, await marketplace.getAddress());
      if (!isApproved) {
        const approveTx = await trademarkNFT.setApprovalForAll(await marketplace.getAddress(), true);
        await approveTx.wait();
      }

      // Create a sale listing (isLicense = false, duration = 0)
      await createListing(signer, {
        tokenId,
        price,
        isLicense: false,
        duration: 0,
        expiresAt: listingExpiry > 0 ? Math.floor(Date.now() / 1000) + listingExpiry * 24 * 60 * 60 : 0,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Listing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full !p-8 relative overflow-hidden animate-scale-in !bg-white dark:!bg-[#0a0c10] !border-slate-200 dark:!border-white/10 shadow-2xl">
        {/* Glow effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 dark:bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">List for Sale</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Transfer Full Ownership Protocol</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-400 transition-all duration-300 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Asset info */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Asset ID</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">#{tokenId}</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Identity</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{trademarkName}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-6 relative z-10 flex gap-3">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[10px] font-bold text-red-500/80 leading-relaxed uppercase tracking-wider">
            Outright sale permanently transfers full NFT ownership. You will lose all rights to this IP asset upon purchase.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Price */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1 mb-2.5 block">Sale Price (MATIC)</label>
            <div className="relative group">
              <input
                type="number" step="0.001" min="0.001" max="1000000"
                value={price}
                onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPrice(val > 1000000 ? '1000000' : e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-white/10 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-all appearance-none"
                placeholder="0.00" required
                style={{ MozAppearance: 'textfield' }}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 uppercase tracking-widest pointer-events-none">MATIC</div>
            </div>
          </div>

          {/* Listing Expiry */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1 mb-2.5 block">Listing Expiry</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '7 Days', value: 7 },
                { label: '30 Days', value: 30 },
                { label: '90 Days', value: 90 },
              ].map((opt) => (
                <button
                  key={opt.label} type="button"
                  onClick={() => setListingExpiry(opt.value)}
                  className={`px-4 py-3.5 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${listingExpiry === opt.value
                    ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20'
                    : 'bg-slate-50 dark:bg-white/[0.03] border-transparent text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-center">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95">Abort</button>
            <button
              type="submit" disabled={isLoading}
              className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : 'List for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
