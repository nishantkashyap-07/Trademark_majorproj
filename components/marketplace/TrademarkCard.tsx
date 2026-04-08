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
          className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 group flex items-center gap-6 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
          onClick={onClick}
        >
          {/* Icon/Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            {(trademark.imageUrl || trademark.ipfsHash) ? (
              <img 
                src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                alt={trademark.sloganText || 'Trademark'}
                className="relative w-full h-full rounded-2xl object-cover border border-white/5 group-hover:border-white/20 transition-all z-10"
              />
            ) : (
              <div className="relative w-full h-full bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-white/20 transition-all z-10">
                <span className="text-3xl font-bold text-white/20">
                  {trademark.sloganText?.charAt(0) || '?'}
                </span>
              </div>
            )}
            {trademark.verified && (
              <div className="absolute -top-1 -right-1 z-20 bg-emerald-500 rounded-full p-1 shadow-xl border border-black">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-full">
                {trademark.category}
              </span>
              {showLicenseAvailable && (
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 rounded-full">
                  LICENSABLE
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">
              {trademark.sloganText || 'Untitled Asset'}
            </h3>
            <p className="text-sm text-white/40">
              by <span className="text-white/80 font-medium">{trademark.companyName || 'Unknown Corp'}</span>
            </p>
          </div>

          <div className="text-right flex-shrink-0 pr-4">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">REG_ID</p>
            <p className="text-lg font-bold text-white font-mono">#{trademark.tokenId}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/trademark/${linkId}`}>
      <div
        className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
        onClick={onClick}
      >
        <div className="relative aspect-[4/5] overflow-hidden p-3 pb-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          
          {(trademark.imageUrl || trademark.ipfsHash) ? (
            <img 
              src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
              alt={trademark.sloganText || 'Trademark'}
              className="w-full h-full object-cover rounded-[2rem] border border-white/5 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
               <span className="text-5xl font-bold text-white/10 select-none">
                 {trademark.sloganText?.charAt(0) || '?'}
               </span>
            </div>
          )}

          {/* Badges Overlays */}
          <div className="absolute top-6 left-6 z-20">
             <span className="px-3 py-1 bg-black/60 border border-white/10 rounded-full text-[10px] font-mono text-white/60 backdrop-blur-md">
               #{trademark.tokenId}
             </span>
          </div>

          {trademark.verified && (
            <div className="absolute top-6 right-6 z-20">
               <div className="w-8 h-8 flex items-center justify-center bg-emerald-500 rounded-full shadow-2xl border border-black animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2.5 py-1 bg-white/5 rounded-full">
               {trademark.category}
             </span>
             <RatingDisplay 
                creatorAddress={trademark.creatorAddress} 
                size="small"
                showCount={false}
              />
          </div>
          
          <h3 className="text-xl font-medium text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {trademark.sloganText || 'Untitled Asset'}
          </h3>
          
          <p className="text-sm text-white/40 mb-8">
            by <span className="text-white/80 font-medium">{trademark.companyName || 'Unknown Corp'}</span>
          </p>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">RECORDED</span>
                <span className="text-xs font-bold text-white/60 mt-1">
                  {trademark.createdAt ? new Date(trademark.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
             </div>
             
             <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
