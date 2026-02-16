import { License } from '@/types';
import Link from 'next/link';

interface LicenseCardProps {
  license: License;
  trademarkName?: string;
  showTrademark?: boolean;
}

export default function LicenseCard({ license, trademarkName, showTrademark = true }: LicenseCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Perpetual';
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days >= 365) return `${Math.floor(days / 365)} Year${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} Month${days >= 60 ? 's' : ''}`;
    return `${days} Day${days > 1 ? 's' : ''}`;
  };

  const isExpired = license.expiresAt > 0 && license.expiresAt < Math.floor(Date.now() / 1000);
  const daysRemaining = license.expiresAt > 0 
    ? Math.max(0, Math.floor((license.expiresAt - Date.now() / 1000) / (24 * 60 * 60)))
    : null;

  return (
    <div className={`bg-gray-900 rounded-xl border-2 p-6 transition-all ${
      isExpired ? 'border-gray-200 opacity-60' : 'border-blue-200 hover:border-blue-400'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {showTrademark && trademarkName && (
            <Link 
              href={`/trademark/${license.tokenId}`}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {trademarkName}
            </Link>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isExpired 
                ? 'bg-gray-100 text-gray-600'
                : license.expiresAt === 0
                ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {isExpired ? 'Expired' : license.expiresAt === 0 ? 'Perpetual' : 'Active'}
            </span>
            <span className="text-sm text-gray-500">
              Token #{license.tokenId}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{license.price} ETH</div>
          <div className="text-xs text-gray-500">License Fee</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Duration</div>
          <div className="font-medium text-gray-900">{formatDuration(license.duration)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Issued</div>
          <div className="font-medium text-gray-900">{formatDate(license.issuedAt)}</div>
        </div>
      </div>

      {license.expiresAt > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">
            {isExpired ? 'Expired On' : 'Expires On'}
          </div>
          <div className="font-medium text-gray-900">{formatDate(license.expiresAt)}</div>
          {!isExpired && daysRemaining !== null && (
            <div className="text-xs text-orange-600 mt-1">
              {daysRemaining === 0 ? 'Expires today' : `${daysRemaining} days remaining`}
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Licensor:</span>
            <span className="ml-2 font-mono text-gray-900">
              {license.licensor.slice(0, 6)}...{license.licensor.slice(-4)}
            </span>
          </div>
          <Link
            href={`/trademark/${license.tokenId}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
