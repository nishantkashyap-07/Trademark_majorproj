import { useState } from 'react';
import { ethers } from 'ethers';
import { createListing } from '@/utils/contracts';
import { useWeb3 } from '@/contexts/Web3Context';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  trademarkName: string;
  onSuccess?: () => void;
}

const LICENSE_DURATIONS = [
  { label: '1 Month', value: 30 * 24 * 60 * 60 },
  { label: '3 Months', value: 90 * 24 * 60 * 60 },
  { label: '6 Months', value: 180 * 24 * 60 * 60 },
  { label: '1 Year', value: 365 * 24 * 60 * 60 },
  { label: 'Perpetual', value: 0 },
];

export default function LicenseModal({ isOpen, onClose, tokenId, trademarkName, onSuccess }: LicenseModalProps) {
  const { account } = useWeb3();
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState(30 * 24 * 60 * 60); // Default 1 month
  const [listingExpiry, setListingExpiry] = useState(30); // Days
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const expiresAt = listingExpiry > 0 
        ? Math.floor(Date.now() / 1000) + (listingExpiry * 24 * 60 * 60)
        : 0;

      await createListing(signer, {
        tokenId,
        price,
        isLicense: true,
        duration,
        expiresAt,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error creating license listing:', err);
      setError(err.message || 'Failed to create license listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create License Listing</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>{trademarkName}</strong> will be available for licensing. You retain ownership while others can use it for the specified duration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Price (ETH) *
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="0.1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Price per license period
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Duration *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LICENSE_DURATIONS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setDuration(option.value)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    duration === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {duration === 0 
                ? 'Perpetual license - never expires' 
                : `License valid for ${Math.floor(duration / (24 * 60 * 60))} days`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Expiry (Days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={listingExpiry}
              onChange={(e) => setListingExpiry(Number(e.target.value))}
              className="input-field"
              placeholder="30"
            />
            <p className="text-xs text-gray-500 mt-1">
              How long this listing stays active (0 = never expires)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Marketplace fee: 2.5% • You keep ownership of the NFT
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
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
