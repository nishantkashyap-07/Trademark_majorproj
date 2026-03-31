import Link from 'next/link';
import { TrademarkMetadata } from '@/types';
import TrademarkBadge from './TrademarkBadge';
import RatingDisplay from './RatingDisplay';
import LicenseAvailableBadge from './LicenseAvailableBadge';

interface TrademarkCardProps {
  trademark: TrademarkMetadata & { id?: string }; // Add optional id field for document ID
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
  showLicenseAvailable?: boolean;
}

export default function TrademarkCard({ trademark, onClick, viewMode = 'grid', showLicenseAvailable = false }: TrademarkCardProps) {
  // Use document ID if available, otherwise fall back to tokenId
  const linkId = trademark.id || trademark.tokenId;
  
  if (viewMode === 'list') {
    return (
      <Link href={`/trademark/${linkId}`}>
        <div
          className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group"
          onClick={onClick}
        >
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-brand rounded-xl blur-lg opacity-20 transition-opacity"></div>
                {(trademark.imageUrl || trademark.ipfsHash) ? (
                  <img 
                    src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                    alt={trademark.sloganText || 'Trademark'}
                    className="relative w-20 h-20 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all border border-gray-700"
                    onError={(e) => {
                      // Fallback to letter if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = document.getElementById(`list-fallback-${trademark.tokenId}`);
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`relative w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all border border-gray-700 ${(trademark.imageUrl || trademark.ipfsHash) ? 'hidden' : ''}`} id={`list-fallback-${trademark.tokenId}`}>
                  <span className="text-3xl font-display font-bold gradient-text">
                    {trademark.sloganText?.charAt(0) || '?'}
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
                  <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {trademark.sloganText || 'Untitled Trademark'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    by <span className="font-semibold text-gray-200">{trademark.companyName || 'Unknown'}</span>
                  </p>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {trademark.description || 'No description available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Info */}
            <div className="flex-shrink-0 text-right">
              <div className="mb-3">
                <span className="text-xs text-gray-400 font-medium">Registered</span>
                <p className="text-sm font-semibold text-white mt-1">
                  {trademark.createdAt ? new Date(trademark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className="w-6 h-6 bg-gradient-brand rounded-lg shadow-sm"></div>
                <span className="text-xs text-gray-300 font-mono font-semibold">
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
    <Link href={`/trademark/${linkId}`}>
      <div
        className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group animate-in"
        onClick={onClick}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
          {(trademark.imageUrl || trademark.ipfsHash) ? (
            <>
              <img 
                src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                alt={trademark.sloganText || 'Trademark'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to letter if image fails to load
                  console.error('Image failed to load:', trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`);
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = document.getElementById(`fallback-${trademark.tokenId}`);
                  if (fallback) fallback.classList.remove('hidden');
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`);
                }}
              />
            </>
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center p-8 ${(trademark.imageUrl || trademark.ipfsHash) ? 'hidden' : ''}`} id={`fallback-${trademark.tokenId}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-brand rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-28 h-28 bg-gray-800 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium group-hover:scale-105 transition-all duration-300 border border-gray-700">
                <span className="text-5xl font-display font-bold gradient-text">
                  {trademark.sloganText?.charAt(0) || '?'}
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

          {/* License Available Badge */}
          {showLicenseAvailable && (
            <div className="absolute top-4 left-4">
              <LicenseAvailableBadge available={true} />
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
          <h3 className="text-lg font-display font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-400 transition-colors">
            {trademark.sloganText || 'Untitled Trademark'}
          </h3>

          {/* Company Name */}
          <p className="text-sm text-gray-400 mb-3 line-clamp-1">
            by <span className="font-semibold text-gray-200">{trademark.companyName || 'Unknown'}</span>
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">Registered</span>
              <span className="text-sm font-semibold text-white mt-0.5">
                {trademark.createdAt ? new Date(trademark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-brand rounded-lg shadow-sm"></div>
              <span className="text-xs text-gray-300 font-mono font-semibold">
                #{trademark.tokenId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}