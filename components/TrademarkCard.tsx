import Link from 'next/link';
import { TrademarkMetadata } from '@/types';
import TrademarkBadge from './TrademarkBadge';
import RatingDisplay from './RatingDisplay';

interface TrademarkCardProps {
  trademark: TrademarkMetadata;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
}

export default function TrademarkCard({ trademark, onClick, viewMode = 'grid' }: TrademarkCardProps) {
  if (viewMode === 'list') {
    return (
      <Link href={`/trademark/${trademark.tokenId}`}>
        <div
          className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
          onClick={onClick}
        >
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-brand rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all border border-gray-700">
                  <span className="text-3xl font-display font-bold gradient-text">
                    {trademark.sloganText.charAt(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge badge-info text-xs">
                      {trademark.category}
                    </span>
                    {trademark.verified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {trademark.sloganText}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    by <span className="font-semibold">{trademark.companyName}</span>
                  </p>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    {trademark.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Info */}
            <div className="flex-shrink-0 text-right">
              <div className="mb-3">
                <span className="text-xs text-neutral-500 font-medium">Registered</span>
                <p className="text-sm font-semibold text-neutral-900 mt-1">
                  {trademark.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="w-6 h-6 bg-gradient-brand rounded-lg shadow-sm"></div>
                <span className="text-xs text-neutral-500 font-mono font-semibold">
                  #{trademark.tokenId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/trademark/${trademark.tokenId}`}>
      <div
        className="card-hover group animate-in"
        onClick={onClick}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-brand rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-28 h-28 bg-gray-800 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium group-hover:scale-105 transition-all duration-300 border border-gray-700">
                <span className="text-5xl font-display font-bold gradient-text">
                  {trademark.sloganText.charAt(0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Verified Badge Overlay */}
          {trademark.verified && (
            <div className="absolute top-4 right-4">
              <div className="bg-gray-900 rounded-full p-2 shadow-medium border border-emerald-600/30">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="badge badge-info text-xs">
              {trademark.category}
            </span>
          </div>

          {/* Slogan Text */}
          <h3 className="text-lg font-display font-bold text-neutral-900 mb-1 truncate group-hover:text-brand-600 transition-colors">
            {trademark.sloganText}
          </h3>

          {/* Company Name */}
          <p className="text-sm text-neutral-600 mb-2 truncate">
            by <span className="font-semibold">{trademark.companyName}</span>
          </p>

          {/* Creator Rating */}
          <div className="mb-4">
            <RatingDisplay 
              creatorAddress={trademark.creatorAddress} 
              size="small"
              showCount={false}
            />
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 font-medium">Registered</span>
              <span className="text-sm font-semibold text-neutral-900 mt-0.5">
                {trademark.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-brand rounded-lg shadow-sm"></div>
              <span className="text-xs text-neutral-500 font-mono font-semibold">
                #{trademark.tokenId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}