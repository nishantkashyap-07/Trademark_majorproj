import { useState } from 'react';
import { TrademarkMetadata } from '@/types';
import TrademarkBadge from './TrademarkBadge';

interface ProductVerificationProps {
  productName: string;
  companyName: string;
  trademarkId?: number;
  registrationNumber?: string;
  onVerificationComplete?: (result: VerificationResult) => void;
}

interface VerificationResult {
  isValid: boolean;
  trademark: TrademarkMetadata | null;
  owner: string | null;
  message: string;
}

export default function ProductVerification({
  productName,
  companyName,
  trademarkId,
  registrationNumber,
  onVerificationComplete,
}: ProductVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleVerification = async () => {
    if (!trademarkId && !registrationNumber) {
      const result: VerificationResult = {
        isValid: false,
        trademark: null,
        owner: null,
        message: 'No trademark information provided for verification',
      };
      setVerificationResult(result);
      onVerificationComplete?.(result);
      return;
    }

    setIsVerifying(true);
    
    try {
      // In a real implementation, this would:
      // 1. Query the smart contract for trademark info
      // 2. Verify ownership and authenticity
      // 3. Check if the company matches the trademark owner
      
      // Mock verification for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate blockchain query
      
      const mockResult: VerificationResult = {
        isValid: true,
        trademark: {
          tokenId: trademarkId || 1,
          creatorAddress: '0x1234...5678',
          companyName: companyName,
          sloganText: productName,
          registrationNumber: registrationNumber || 'SL001234',
          category: 'Technology',
          description: 'Verified blockchain slogan',
          ipfsHash: 'QmExample1',
          royaltyPercentage: 10,
          createdAt: new Date('2024-01-15'),
          transactionHash: '0xabc123',
          verified: true,
          verificationStatus: 'verified',
          language: 'English',
          usageContext: 'Product branding and marketing',
        },
        owner: '0x1234567890123456789012345678901234567890',
        message: 'Slogan verified successfully on blockchain',
      };
      
      setVerificationResult(mockResult);
      onVerificationComplete?.(mockResult);
      
    } catch (error) {
      const errorResult: VerificationResult = {
        isValid: false,
        trademark: null,
        owner: null,
        message: 'Verification failed: Unable to connect to blockchain',
      };
      setVerificationResult(errorResult);
      onVerificationComplete?.(errorResult);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Verification</h3>
        {verificationResult && (
          <TrademarkBadge
            verified={verificationResult.isValid}
            trademarkId={verificationResult.trademark?.tokenId}
            companyName={verificationResult.trademark?.companyName}
            onClick={() => setShowDetails(!showDetails)}
          />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-600">Product:</span>
          <span className="ml-2 text-sm text-gray-900">{productName}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-600">Company:</span>
          <span className="ml-2 text-sm text-gray-900">{companyName}</span>
        </div>
        {trademarkId && (
          <div>
            <span className="text-sm font-medium text-gray-600">Trademark ID:</span>
            <span className="ml-2 text-sm font-mono text-gray-900">#{trademarkId}</span>
          </div>
        )}
        {registrationNumber && (
          <div>
            <span className="text-sm font-medium text-gray-600">Registration:</span>
            <span className="ml-2 text-sm font-mono text-gray-900">{registrationNumber}</span>
          </div>
        )}
      </div>

      {!verificationResult ? (
        <button
          onClick={handleVerification}
          disabled={isVerifying}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying on Blockchain...
            </div>
          ) : (
            'Verify Trademark'
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className={`p-3 rounded-md ${
            verificationResult.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {verificationResult.isValid ? (
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-sm font-medium ${
                verificationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {verificationResult.isValid ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <p className={`text-sm mt-1 ${
              verificationResult.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {verificationResult.message}
            </p>
          </div>

          {showDetails && verificationResult.trademark && (
            <div className="bg-gray-50 rounded-md p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Trademark Details</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Token ID:</span>
                  <span>#{verificationResult.trademark.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{verificationResult.trademark.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered:</span>
                  <span>{verificationResult.trademark.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Owner:</span>
                  <span className="font-mono">
                    {verificationResult.owner?.slice(0, 6)}...{verificationResult.owner?.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => {
                setVerificationResult(null);
                setShowDetails(false);
              }}
              className="flex-1 btn-secondary text-sm"
            >
              Verify Again
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 bg-blue-50 text-blue-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-100 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}