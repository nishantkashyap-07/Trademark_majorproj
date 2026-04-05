import Link from 'next/link';
import { TrademarkMetadata } from '@/types';
import RatingDisplay from './RatingDisplay';

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
          className="glass-card !p-4 group flex items-center gap-6 hover:shadow-indigo-500/10 cursor-pointer"
          onClick={onClick}
        >
          {/* Icon/Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            {(trademark.imageUrl || trademark.ipfsHash) ? (
              <img 
                src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                alt={trademark.sloganText || 'Trademark'}
                className="relative w-full h-full rounded-2xl object-cover border border-white/10 group-hover:border-indigo-500/50 transition-all z-10"
              />
            ) : (
              <div className="relative w-full h-full bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-indigo-500/50 transition-all z-10">
                <span className="text-3xl font-black text-gradient">
                  {trademark.sloganText?.charAt(0) || '?'}
                </span>
              </div>
            )}
            {trademark.verified && (
              <div className="absolute -top-2 -right-2 z-20 bg-indigo-600 rounded-full p-1 shadow-lg border border-white/20">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="status-badge status-badge-purple uppercase !px-2 !py-0.5 !text-[10px] tracking-wider">
                {trademark.category}
              </span>
              {showLicenseAvailable && (
                <span className="status-badge status-badge-blue uppercase !px-2 !py-0.5 !text-[10px] tracking-wider">
                  LICENSABLE
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">
              {trademark.sloganText || 'Untitled Asset'}
            </h3>
            <p className="text-sm text-slate-400">
              by <span className="text-slate-200 font-bold">{trademark.companyName || 'Unknown Corp'}</span>
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">MINTED ID</p>
            <p className="text-lg font-black text-white font-mono">#{trademark.tokenId}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/trademark/${linkId}`}>
      <div
        className="glass-card !p-0 group cursor-pointer border-transparent hover:border-indigo-500/30 overflow-hidden"
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Backdrop Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent z-10" />
          
          {(trademark.imageUrl || trademark.ipfsHash) ? (
            <img 
              src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
              alt={trademark.sloganText || 'Trademark'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
               <span className="text-6xl font-black text-white/10 select-none">
                 {trademark.sloganText?.charAt(0) || '?'}
               </span>
            </div>
          )}

          {/* Badges Overlays */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
             <span className="status-badge bg-black/40 border-white/10 text-white backdrop-blur-xl !px-3 font-mono text-[10px]">
               #{trademark.tokenId}
             </span>
          </div>

          {trademark.verified && (
            <div className="absolute top-4 right-4 z-20">
               <div className="flex h-8 w-8 items-center justify-center bg-indigo-600 rounded-xl shadow-2xl border border-white/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-3">
             <span className="status-badge status-badge-purple !py-0.5">
               {trademark.category}
             </span>
             <RatingDisplay 
                creatorAddress={trademark.creatorAddress} 
                size="small"
                showCount={false}
              />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {trademark.sloganText || 'Untitled Asset'}
          </h3>
          
          <p className="text-sm text-slate-400 mb-6">
            by <span className="text-slate-200 font-bold">{trademark.companyName || 'Unknown Corp'}</span>
          </p>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MINT DATE</span>
                <span className="text-xs font-bold text-white mt-1">
                  {trademark.createdAt ? new Date(trademark.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
             </div>
             
             <button className="flex items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:bg-indigo-600 transition-all">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
}