import { useState } from 'react';
import { ethers } from 'ethers';
import { licenseTrademark } from '@/utils/contracts';
import { useWeb3 } from '@/contexts/Web3Context';
import { Listing } from '@/types';

interface PurchaseLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  trademarkName: string;
  onSuccess?: () => void;
}

export default function PurchaseLicenseModal({ 
  isOpen, 
  onClose, 
  listing, 
  trademarkName,
  onSuccess 
}: PurchaseLicenseModalProps) {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'Perpetual';
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days >= 365) return `${Math.floor(days / 365)} Year${days >= 730 ? 's' : ''}`;
    if (days >= 30) return `${Math.floor(days / 30)} Month${days >= 60 ? 's' : ''}`;
    return `${days} Day${days > 1 ? 's' : ''}`;
  };

  const handlePurchase = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      await licenseTrademark(
        signer,
        listing.listingId,
        listing.duration || 0,
        listing.price
      );

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error purchasing license:', err);
      setError(err.message || 'Failed to purchase license');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Purchase License</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">{trademarkName}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">License Duration:</span>
                <span className="font-medium text-gray-900">{formatDuration(listing.duration || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-blue-600">{listing.price} ETH</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1">What you get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Legal right to use this trademark</li>
                  <li>• Blockchain-verified license record</li>
                  <li>• {listing.duration === 0 ? 'Lifetime access' : `Access for ${formatDuration(listing.duration || 0)}`}</li>
                  <li>• Transferable license rights</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  This transaction cannot be reversed. Make sure you understand the license terms.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : `Purchase for ${listing.price} ETH`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
