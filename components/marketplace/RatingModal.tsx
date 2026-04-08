import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

interface RatingModalProps {
  creatorAddress: string;
  trademarkId: string;
  trademarkName: string;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RatingModal({ 
  creatorAddress, 
  trademarkId, 
  trademarkName, 
  onClose, 
  onSuccess 
}: RatingModalProps) {
  const { account } = useWeb3();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return setError('Wallet connection required');
    if (rating === 0) return setError('Selection required');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorAddress: creatorAddress.toLowerCase(),
          trademarkId,
          rating,
          review: review.trim(),
          reviewerAddress: account.toLowerCase(),
        }),
      });
      const data = await response.json();
      if (data.success) { onSuccess?.(); onClose(); }
      else setError(data.error || 'Submission failed');
    } catch { setError('Network discrepancy'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-card max-w-md w-full !p-8 animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white">Trust Calibration</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>

        <div className="mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Entity</p>
           <p className="text-white font-black truncate">{trademarkName}</p>
           <p className="text-[10px] font-mono text-slate-600 truncate mt-1">Node: {creatorAddress}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Sentiment Score</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star} type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-125"
                >
                  <svg className={`w-10 h-10 ${star <= (hoveredRating || rating) ? 'text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/10'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Optional Narrative</label>
            <textarea
              value={review} onChange={(e) => setReview(e.target.value)} rows={3}
              className="premium-input !bg-white/[0.01] resize-none" placeholder="Provide context for this calibration..." maxLength={500}
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 btn-glass !py-3 font-black text-xs uppercase tracking-widest">Abort</button>
            <button 
              type="submit" disabled={isSubmitting || rating === 0}
              className="flex-1 btn-premium !py-3 font-black text-xs uppercase tracking-widest"
            >
              {isSubmitting ? 'Syncing...' : 'Submit Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
