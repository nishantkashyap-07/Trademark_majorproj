import { useState } from 'react';

interface TrademarkBadgeProps {
  verified: boolean;
  trademarkId?: number;
  companyName?: string;
  onClick?: () => void;
}

export default function TrademarkBadge({ 
  verified, 
  trademarkId, 
  companyName,
  onClick 
}: TrademarkBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!verified) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Unverified
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="trademark-badge hover:bg-green-200 transition-colors duration-200 cursor-pointer"
      >
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Verified Trademark
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
          <div className="text-center">
            <div className="font-medium">Blockchain Verified</div>
            {companyName && <div className="text-gray-300">by {companyName}</div>}
            {trademarkId && <div className="text-gray-400">ID: #{trademarkId}</div>}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}