import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/common/Toast';
import SimilarityWarning from '@/components/registry/SimilarityWarning';
import QRCode from 'qrcode';

interface TrademarkForVerification {
  id: string;
  tokenId: number;
  companyName: string;
  trademarkName: string;
  registrationNumber: string;
  category: string;
  creatorAddress: string;
  createdAt: Date;
  ipfsHash: string;
  verified: boolean;
  qrCodeUrl?: string;
}

interface AdminVerificationPanelProps {
  trademark: TrademarkForVerification;
  onVerify: (tokenId: number) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onClose: () => void;
}

export default function AdminVerificationPanel({
  trademark,
  onVerify,
  onReject,
  onClose,
}: AdminVerificationPanelProps) {
  const { trademarkNFTContract, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadBlockchainData();
    generateQRCode();
  }, [trademark]);

  const loadBlockchainData = async () => {
    if (!trademarkNFTContract) return;

    try {
      const info = await trademarkNFTContract.getTrademarkInfo(trademark.tokenId);
      setBlockchainData({
        tokenId: info.tokenId.toNumber(),
        creator: info.creator,
        companyName: info.companyName,
        sloganText: info.sloganText,
        registrationNumber: info.registrationNumber,
        category: info.category,
        verified: info.verified,
        createdAt: new Date(info.createdAt.toNumber() * 1000),
      });
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      const verificationUrl = `${window.location.origin}/verify?tokenId=${trademark.tokenId}`;
      const qrUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await onVerify(trademark.tokenId);
      setToast({ message: 'Trademark verified successfully!', type: 'success' });
      setTimeout(() => onClose(), 2000);
    } catch (error: any) {
      setToast({ message: 'Verification failed: ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setToast({ message: 'Please provide a rejection reason', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await onReject(trademark.id, rejectionReason);
      setToast({ message: 'Trademark rejected', type: 'info' });
      setTimeout(() => onClose(), 2000);
    } catch (error: any) {
      setToast({ message: 'Rejection failed: ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.download = `trademark-${trademark.tokenId}-verification-qr.png`;
    link.href = qrCodeUrl;
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

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Trademark Verification Review</h2>
              <p className="text-sm text-slate-400 mt-1">Token ID: #{trademark.tokenId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-4 border ${
              trademark.verified
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {trademark.verified ? (
                  <>
                    <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-emerald-400">Already Verified</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-amber-400">Pending Verification</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Trademark Details */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trademark Name</label>
                      <p className="text-base font-semibold text-white mt-1">{trademark.trademarkName}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Company Name</label>
                      <p className="text-base text-slate-200 mt-1">{trademark.companyName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
                        <p className="text-base text-slate-200 mt-1">{trademark.category}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Token ID</label>
                        <p className="text-base font-mono text-sky-400 mt-1">#{trademark.tokenId}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registration Number</label>
                      <p className="text-base font-mono text-slate-200 mt-1">{trademark.registrationNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Blockchain Data */}
                {blockchainData && (
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Blockchain Data
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Owner Address</label>
                        <p className="text-sm font-mono text-slate-300 mt-1 break-all">{blockchainData.creator}</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registration Date</label>
                        <p className="text-base text-slate-200 mt-1">{blockchainData.createdAt.toLocaleString()}</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Verification Status</label>
                        <p className={`text-base font-semibold mt-1 ${
                          blockchainData.verified ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {blockchainData.verified ? 'Verified' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* IPFS Data */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    IPFS Storage
                  </h3>
                  
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">IPFS Hash</label>
                    <p className="text-sm font-mono text-slate-300 mt-1 break-all">{trademark.ipfsHash}</p>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 mt-2"
                    >
                      View on IPFS
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Automatic Similarity Check */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Automatic Similarity Check
                  </h3>
                  
                  <SimilarityWarning
                    trademarkName={trademark.trademarkName}
                    companyName={trademark.companyName}
                    ipfsHash={trademark.ipfsHash}
                  />
                </div>
              </div>

              {/* Right Column - QR Code & Actions */}
              <div className="space-y-6">
                {/* QR Code */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">Verification QR Code</h3>
                  
                  {qrCodeUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-xl">
                        <img
                          src={qrCodeUrl}
                          alt="Verification QR Code"
                          className="w-64 h-64"
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Scan to verify trademark authenticity
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
                    </div>
                  ) : (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner text="Generating QR code..." />
                    </div>
                  )}
                </div>

                {/* Verification Checklist */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Verification Checklist</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-sky-600 rounded" />
                      <span className="text-sm text-slate-300">Company name matches registration documents</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-sky-600 rounded" />
                      <span className="text-sm text-slate-300">Registration number is valid and unique</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-sky-600 rounded" />
                      <span className="text-sm text-slate-300">Trademark category is appropriate</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-sky-600 rounded" />
                      <span className="text-sm text-slate-300">IPFS metadata is accessible and valid</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 text-sky-600 rounded" />
                      <span className="text-sm text-slate-300">No duplicate or conflicting trademarks</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                {!trademark.verified && (
                  <div className="space-y-3">
                    <button
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Approve & Verify
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <div 
            className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Reject Trademark Application</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a detailed reason for rejection..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
