import Link from 'next/link';
import { TrademarkMetadata } from '@/types';
import RatingDisplay from '@/components/ui/RatingDisplay';

interface TrademarkCardProps {
  trademark: TrademarkMetadata & { id?: string };
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
  showLicenseAvailable?: boolean;
}

export default function TrademarkCard({ trademark, onClick, viewMode = 'grid', showLicenseAvailable = false }: TrademarkCardProps) {
  const linkId = trademark.id || trademark.tokenId;
  
  if (viewMode === 'list') {
    return (
      <Link href={`/trademark/${linkId}`}>
        <div
          className="bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/5 rounded-[2rem] p-4 group flex items-center gap-6 hover:bg-slate-900/10 dark:hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
          onClick={onClick}
        >
          {/* Icon/Image */}
          <div className="relative w-28 h-28 flex-shrink-0 p-2 bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-100 dark:border-white/10">
            {(trademark.imageUrl || trademark.ipfsHash) ? (
              <img 
                src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                alt={trademark.sloganText || 'Trademark'}
                className="w-full h-full rounded-2xl object-contain transition-all"
              />
            ) : (
              <div className="w-full h-full bg-slate-50 dark:bg-white/[0.02] rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-300 dark:text-white/10 uppercase">
                  {trademark.sloganText?.charAt(0) || '?'}
                </span>
              </div>
            )}
            {trademark.verified && (
              <div className="absolute -top-2 -right-2 z-20 bg-emerald-500 rounded-full p-1 shadow-lg border-2 border-white dark:border-slate-900">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">
                {trademark.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {trademark.sloganText || 'Untitled Asset'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
              by <span className="text-slate-900 dark:text-slate-200 font-bold">{trademark.companyName || 'Unknown Corp'}</span>
            </p>
          </div>

          <div className="text-right flex-shrink-0 pr-4">
            <p className="text-[10px] font-bold text-slate-300 dark:text-white/10 uppercase tracking-widest mb-1">Index</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white font-mono opacity-80">#{trademark.tokenId}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/trademark/${linkId}`}>
      <div
        className="bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:bg-slate-900/[0.08] dark:hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10"
        onClick={onClick}
      >
        <div className="relative aspect-square p-5">
          <div className="w-full h-full bg-slate-50 dark:bg-white/[0.03] rounded-[2rem] overflow-hidden flex items-center justify-center p-8 border border-slate-100 dark:border-white/5 group-hover:border-indigo-500/20 transition-all duration-500">
            {(trademark.imageUrl || trademark.ipfsHash) ? (
              <img 
                src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                alt={trademark.sloganText || 'Trademark'}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold text-slate-200 dark:text-white/10 select-none">
                  {trademark.sloganText?.charAt(0) || '?'}
                </span>
                <span className="text-[8px] font-bold text-slate-300 dark:text-white/5 uppercase tracking-[0.3em] mt-2">No Visual</span>
              </div>
            )}
          </div>

          {/* Badges Overlays */}
          <div className="absolute top-8 left-8 z-20">
             <span className="px-2.5 py-1 bg-white/80 dark:bg-black/40 border border-slate-100 dark:border-white/10 rounded-full text-[9px] font-bold font-mono text-slate-500 dark:text-white/60 backdrop-blur-md shadow-sm">
               #{trademark.tokenId}
             </span>
          </div>

          {trademark.verified && (
            <div className="absolute top-8 right-8 z-20">
               <div className="w-7 h-7 flex items-center justify-center bg-emerald-500 rounded-full shadow-lg border-2 border-white dark:border-slate-800 transition-transform group-hover:rotate-12">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
               </div>
            </div>
          )}
        </div>

        <div className="px-7 pb-8 pt-2 relative">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[9px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.15em] px-2.5 py-1 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
                {trademark.category}
             </span>
             <RatingDisplay 
                creatorAddress={trademark.creatorAddress} 
                size="small"
                showCount={false}
              />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
            {trademark.sloganText || 'Untitled'}
          </h3>
          
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-8 font-medium italic">
            by <span className="text-slate-800 dark:text-slate-200 font-bold tracking-tight">{trademark.companyName || 'Unknown Corp'}</span>
          </p>

          <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-300 dark:text-white/10 uppercase tracking-[0.2em]">RECORDED</span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-white/60 mt-1">
                  {trademark.createdAt ? new Date(trademark.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
             </div>
             
             <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black shadow-lg shadow-black/5 dark:shadow-white/5 group-hover:scale-110 active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
