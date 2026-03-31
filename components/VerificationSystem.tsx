import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import QRCode from 'qrcode';

interface VerificationResult {
  isValid: boolean;
  tokenId?: number;
  registrationNumber?: string;
  companyName?: string;
  trademarkName?: string;
  owner?: string;
  verified?: boolean;
  category?: string;
  createdAt?: string;
  ipfsHash?: string;
  qrCodeUrl?: string;
}

export default function VerificationSystem() {
  const { trademarkNFTContract } = useWeb3();
  const [searchType, setSearchType] = useState<'registration' | 'tokenId'>('registration');
  const [searchValue, setSearchValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleVerify = async () => {
    if (!searchValue.trim()) {
      setToast({ message: 'Please enter a value to verify', type: 'error' });
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      // Get contract instance (read-only if no wallet connected)
      let contract = trademarkNFTContract;
      
      if (!contract) {
        // Try to create a read-only contract instance
        if (typeof window !== 'undefined' && window.ethereum) {
          const { getTrademarkNFTContract } = await import('@/utils/contracts');
          contract = getTrademarkNFTContract();
        } else {
          setToast({ message: 'Please install MetaMask to verify trademarks', type: 'error' });
          setIsVerifying(false);
          return;
        }
      }

      let tokenId: number;

      if (searchType === 'registration') {
        // Lookup by registration number
        tokenId = await contract.getTokenIdByRegistration(searchValue);
        
        if (tokenId === 0) {
          setResult({
            isValid: false,
          });
          setToast({ message: 'Registration number not found', type: 'error' });
          setIsVerifying(false);
          return;
        }
      } else {
        // Direct token ID lookup
        tokenId = parseInt(searchValue);
        
        if (isNaN(tokenId) || tokenId <= 0) {
          setToast({ message: 'Invalid token ID', type: 'error' });
          setIsVerifying(false);
          return;
        }
      }

      // Get trademark info from contract
      const trademarkInfo = await contract.getTrademarkInfo(tokenId);
      
      // Generate QR code
      const verificationUrl = `${window.location.origin}/verify?tokenId=${tokenId}`;
      const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });

      setResult({
        isValid: true,
        tokenId: trademarkInfo.tokenId.toNumber ? trademarkInfo.tokenId.toNumber() : Number(trademarkInfo.tokenId),
        registrationNumber: trademarkInfo.registrationNumber,
        companyName: trademarkInfo.companyName,
        trademarkName: trademarkInfo.trademarkName || trademarkInfo.sloganText,
        owner: trademarkInfo.creator,
        verified: trademarkInfo.verified,
        category: trademarkInfo.category,
        createdAt: new Date((trademarkInfo.createdAt.toNumber ? trademarkInfo.createdAt.toNumber() : Number(trademarkInfo.createdAt)) * 1000).toLocaleDateString(),
        ipfsHash: trademarkInfo.ipfsHash,
        qrCodeUrl,
      });

      setToast({ 
        message: trademarkInfo.verified ? 'Trademark verified successfully!' : 'Trademark found but not verified', 
        type: trademarkInfo.verified ? 'success' : 'info' 
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      setResult({
        isValid: false,
      });
      
      let errorMessage = 'Verification failed';
      if (error.message?.includes('could not decode result data')) {
        errorMessage = 'Token ID not found on blockchain';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadQRCode = () => {
    if (!result?.qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `trademark-${result.tokenId}-qr.png`;
    link.href = result.qrCodeUrl;
    link.click();
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        {/* Search Section */}
        <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4">Verify Trademark</h3>
          
          {/* Search Type Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSearchType('registration')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'registration'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Registration Number
            </button>
            <button
              onClick={() => setSearchType('tokenId')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'tokenId'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Token ID
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              placeholder={
                searchType === 'registration'
                  ? 'Enter registration number (e.g., TM001234)'
                  : 'Enter token ID (e.g., 1)'
              }
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isVerifying && (
          <div className="bg-slate-900/70 rounded-2xl p-8 border border-slate-800 text-center">
            <LoadingSpinner text="Verifying trademark on blockchain..." />
          </div>
        )}

        {/* Results Section */}
        {result && !isVerifying && (
          <div className={`bg-slate-900/70 rounded-2xl p-6 border ${
            result.isValid && result.verified
              ? 'border-emerald-500/50'
              : result.isValid
              ? 'border-amber-500/50'
              : 'border-rose-500/50'
          }`}>
            {/* Status Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {result.isValid && result.verified ? (
                  <>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-400">Verified Trademark</h3>
                      <p className="text-sm text-slate-400">Authenticated on blockchain</p>
                    </div>
                  </>
                ) : result.isValid ? (
                  <>
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-400">Pending Verification</h3>
                      <p className="text-sm text-slate-400">Awaiting admin approval</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-rose-400">Not Found</h3>
                      <p className="text-sm text-slate-400">Trademark not registered</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Trademark Details */}
            {result.isValid && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trademark Name</label>
                    <p className="text-lg font-semibold text-white mt-1">{result.trademarkName}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Company</label>
                    <p className="text-lg text-slate-200 mt-1">{result.companyName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Token ID</label>
                      <p className="text-lg font-mono text-sky-400 mt-1">#{result.tokenId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
                      <p className="text-lg text-slate-200 mt-1">{result.category}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registration Number</label>
                    <p className="text-lg font-mono text-slate-200 mt-1">{result.registrationNumber}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Owner Address</label>
                    <p className="text-sm font-mono text-slate-300 mt-1 break-all">{result.owner}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered On</label>
                    <p className="text-lg text-slate-200 mt-1">{result.createdAt}</p>
                  </div>
                </div>

                {/* Right Column - QR Code */}
                <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-xl p-6">
                  {result.qrCodeUrl && (
                    <>
                      <img
                        src={result.qrCodeUrl}
                        alt="Verification QR Code"
                        className="w-64 h-64 rounded-lg bg-white p-4"
                      />
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Scan to verify this trademark
                      </p>
                      <button
                        onClick={downloadQRCode}
                        className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR Code
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
