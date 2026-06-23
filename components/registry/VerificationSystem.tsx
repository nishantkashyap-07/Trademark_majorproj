import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/common/Toast';
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

      // Fetch from DB to get the IP-Guard verification status
      // (The smart contract sets verified=false by default until an admin signs it, 
      // but our platform auto-verifies 'clear' assets off-chain)
      let isVerified = trademarkInfo.verified;
      try {
        const dbRes = await fetch(`/api/trademarks?blockchainTokenId=${tokenId}`);
        const dbData = await dbRes.json();
        if (dbData.success && dbData.data?.length > 0) {
          isVerified = dbData.data[0].verified || trademarkInfo.verified;
        }
      } catch (e) {
        console.error('Failed to sync DB verification status:', e);
      }

      // Generate QR code
      const contractAddress = process.env.NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS || '';
      const verificationUrl = contractAddress 
        ? `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`
        : `${window.location.origin}/verify?tokenId=${tokenId}`;
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
        verified: isVerified,
        category: trademarkInfo.category,
        createdAt: new Date((trademarkInfo.createdAt.toNumber ? trademarkInfo.createdAt.toNumber() : Number(trademarkInfo.createdAt)) * 1000).toLocaleDateString(),
        ipfsHash: trademarkInfo.ipfsHash,
        qrCodeUrl,
      });

      setToast({
        message: isVerified ? 'Trademark verified successfully!' : 'Trademark found but not verified',
        type: isVerified ? 'success' : 'info'
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

      <div className="w-full space-y-8 animate-fade-in">
        {/* Search Interface */}
        <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !p-8 md:!p-10 !border-slate-200 dark:!border-white/10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Trace Product History</h2>
              <p className="text-sm text-slate-500 font-medium">Verify through our decentralized ledger using the registration ID or digital protocol index.</p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit mx-auto">
                {[
                  { id: 'registration', label: 'Registration ID' },
                  { id: 'tokenId', label: 'Protocol Index' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSearchType(type.id as any)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${searchType === type.id
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder={searchType === 'registration' ? "Enter registration number..." : "Enter numeric token ID..."}
                    className="premium-input !h-14 !pl-14 font-medium"
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Searching</span>
                    </div>
                  ) : 'Verify now'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Report */}
        {result && !isVerifying && (
          <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !p-0 overflow-hidden !border-slate-200 dark:!border-white/10 shadow-2xl animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Authenticity Certificate */}
              <div className="p-12 space-y-10">
                <div className="flex items-center justify-between">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${result.isValid && result.verified
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                      : result.isValid
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                    }`}>
                    {result.isValid && result.verified ? '✓ Official Authentic' : result.isValid ? '⚠ Verification Pending' : '✕ Record Conflict'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Live</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Product / Slogan</h3>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {result.isValid ? result.trademarkName : 'Unregistered Asset'}
                  </p>
                </div>

                {result.isValid && (
                  <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Company</p>
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200">{result.companyName}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Industry Class</p>
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200">{result.category}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Index Index</p>
                      <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">#{result.tokenId}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Registry ID</p>
                      <p className="text-base font-mono font-bold text-slate-700 dark:text-slate-200">{result.registrationNumber}</p>
                    </div>
                  </div>
                )}

                {result.isValid && (
                  <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Verified Proprietor</p>
                    <p className="text-xs font-mono text-slate-500 truncate group relative">
                      {result.owner}
                    </p>
                  </div>
                )}
              </div>

              {/* Digital Proof */}
              <div className="bg-slate-50 dark:bg-white/[0.02] p-12 flex flex-col items-center justify-center border-l border-slate-200 dark:border-white/10">
                {result.isValid ? (
                  <div className="w-full max-w-[280px] space-y-8 flex flex-col items-center">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 transition-transform duration-500 hover:scale-[1.02]">
                      <img
                        src={result.qrCodeUrl}
                        alt="Verification QR Code"
                        className="w-48 h-48 opacity-90"
                      />
                    </div>
                    <div className="text-center space-y-6 w-full">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Cryptographic QR Index</p>
                      <button
                        onClick={downloadQRCode}
                        className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl"
                      >
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Certificate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-slate-800 dark:text-white">Record Conflict</h3>
                       <p className="text-sm text-slate-500 max-w-[240px] mx-auto">This identifier does not match any official registry entry in the blockchain protocol.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
