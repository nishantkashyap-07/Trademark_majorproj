import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/common/Toast';
import SimilarityWarning from '@/components/registry/SimilarityWarning';
import QRCode from 'qrcode';

interface TrademarkForVerification {
  id: string;
  tokenId: number;
  blockchainTokenId?: number;
  companyName: string;
  trademarkName: string;
  title?: string;
  registrationNumber: string;
  category: string;
  creatorAddress: string;
  ownerId?: string;
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

  const effectiveTokenId = trademark.blockchainTokenId || trademark.tokenId;
  const effectiveTrademarkName = trademark.title || trademark.trademarkName;
  const effectiveCreatorAddress = trademark.ownerId || trademark.creatorAddress;

  useEffect(() => {
    loadBlockchainData();
    generateQRCode();
  }, [trademark]);

  const loadBlockchainData = async () => {
    if (!trademarkNFTContract || !effectiveTokenId) return;

    try {
      const info = await trademarkNFTContract.getTrademarkInfo(effectiveTokenId);
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
      const verificationUrl = `${window.location.origin}/verify?tokenId=${effectiveTokenId}`;
      const qrUrl = await QRCode.toDataURL(verificationUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
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
      await onVerify(effectiveTokenId);
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
    link.download = `trademark-${effectiveTokenId}-verification-qr.png`;
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

      <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white border border-gray-200 max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl rounded-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Voucher & Integrity Review</h2>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Verification Queue • Token ID: #{effectiveTokenId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Simple Status Banner */}
            <div className={`p-4 border ${
              trademark.verified
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-orange-50 border-orange-200 text-orange-800'
            } text-xs font-bold uppercase tracking-widest flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${trademark.verified ? 'bg-green-600' : 'bg-orange-600 animate-pulse'}`} />
              {trademark.verified ? 'State: Verified on Registry' : 'State: Pending Inspection'}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column - Details */}
              <div className="space-y-8">
                {/* Data Fields */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-900 uppercase border-b border-gray-900 pb-2">Technical Specification</h3>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trademark String</label>
                      <p className="text-sm font-bold text-gray-900">{effectiveTrademarkName}</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity Name</label>
                      <p className="text-sm text-gray-700">{trademark.companyName}</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classification</label>
                      <p className="text-sm text-gray-700">{trademark.category}</p>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference ID</label>
                      <p className="text-sm font-mono text-gray-900">{trademark.registrationNumber}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proprietor Address</label>
                    <p className="text-[10px] font-mono text-gray-500 mt-1 break-all bg-gray-50 p-2 border border-gray-100">{blockchainData?.creator || effectiveCreatorAddress}</p>
                  </div>
                </div>

                {/* Similarity Analysis */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase border-b border-gray-900 pb-2">Conflict Analysis</h3>
                  <div className="bg-gray-50 p-1 border border-gray-200">
                    <SimilarityWarning
                      trademarkName={effectiveTrademarkName}
                      companyName={trademark.companyName}
                      ipfsHash={trademark.ipfsHash}
                    />
                  </div>
                </div>

                {/* IPFS Pointer */}
                <div className="bg-white border border-gray-100 p-4">
                  <h4 className="text-[10px] font-black text-gray-900 uppercase mb-2">Immutable Metadata Pointer</h4>
                  <p className="text-[10px] font-mono text-gray-400 break-all">{trademark.ipfsHash}</p>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-[10px] font-bold text-blue-600 hover:underline uppercase"
                  >
                    View Source Protocol Data &rarr;
                  </a>
                </div>
              </div>

              {/* Right Column - QR & Actions */}
              <div className="space-y-8">
                {/* QR Section */}
                <div className="border border-gray-200 bg-gray-50 p-6 flex flex-col items-center">
                  <h3 className="text-[10px] font-black text-gray-900 uppercase mb-4 tracking-widest">Verification Token QR</h3>
                  {qrCodeUrl ? (
                    <>
                      <div className="bg-white p-2 border border-gray-200">
                        <img
                          src={qrCodeUrl}
                          alt="Verification QR Code"
                          className="w-48 h-48 grayscale hover:grayscale-0 transition-all cursor-crosshair"
                        />
                      </div>
                      <button
                        onClick={downloadQRCode}
                        className="mt-4 text-[10px] font-bold text-gray-500 hover:text-gray-900 uppercase flex items-center gap-2 border-b border-transparent hover:border-gray-900 pb-0.5"
                      >
                        Download Asset Stamp
                      </button>
                    </>
                  ) : (
                    <LoadingSpinner text="Processing Code Generator..." />
                  )}
                </div>

                {/* Verification Checkpoints */}
                <div className="p-6 border border-gray-100 bg-white">
                  <h3 className="text-[10px] font-black text-gray-900 uppercase mb-4 tracking-widest underline decoration-gray-200 underline-offset-8">Inspection Checklist</h3>
                  <div className="space-y-3">
                    {[
                      'Entity legitimacy confirmed',
                      'Registration ID sequence valid',
                      'Classification mapping accurate',
                      'Metadata hash integrity verified',
                      'Conflict analysis clearance'
                    ].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-3 h-3 text-black rounded-none border-gray-300 focus:ring-0" />
                        <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-900 uppercase">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Final Determination */}
                {!trademark.verified && (
                  <div className="space-y-2 pt-4">
                    <button
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="w-full py-4 bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Processing Determination...' : 'Commit Approval to Registry'}
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isLoading}
                      className="w-full py-4 border border-gray-200 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      Issue Rejection Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Intent Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-gray-900 w-full max-w-md p-8 shadow-2xl rounded-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase mb-6 tracking-tight">Rejection Justification</h3>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explicitate technical grounds for rejection..."
              rows={5}
              className="w-full p-4 bg-gray-50 border border-gray-200 text-sm font-medium focus:outline-none focus:border-red-500 mb-6 placeholder-gray-300"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading || !rejectionReason.trim()}
                className="flex-1 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
