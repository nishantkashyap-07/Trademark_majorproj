import { useState } from 'react';
import { TrademarkMetadata } from '@/types';
import TrademarkBadge from '@/components/marketplace/TrademarkBadge';

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
    <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !p-8 !border-slate-200 dark:!border-white/10 shadow-sm hover:shadow-lg transition-all duration-500">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Status Insight</h3>
        {verificationResult && (
          <TrademarkBadge
            verified={verificationResult.isValid}
            trademarkId={verificationResult.trademark?.tokenId}
            companyName={verificationResult.trademark?.companyName}
            onClick={() => setShowDetails(!showDetails)}
          />
        )}
      </div>

      <div className="space-y-5 mb-10">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Asset</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{productName}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Proprietor</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{companyName}</span>
        </div>
        {trademarkId && (
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Index</span>
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">#{trademarkId}</span>
          </div>
        )}
        {registrationNumber && (
          <div className="flex justify-between items-center pb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry ID</span>
            <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{registrationNumber}</span>
          </div>
        )}
      </div>

      {!verificationResult ? (
        <button
          onClick={handleVerification}
          disabled={isVerifying}
          className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-white/5 disabled:opacity-50"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
              <span>Validating</span>
            </div>
          ) : (
            'Initiate Verification'
          )}
        </button>
      ) : (
        <div className="space-y-6 animate-slide-up">
          <div className={`p-6 rounded-2xl border ${
            verificationResult.isValid 
              ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' 
              : 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/20'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verificationResult.isValid ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={verificationResult.isValid ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${verificationResult.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {verificationResult.isValid ? 'Authenticity Match' : 'Record Conflict'}
                </span>
                <p className="text-xs font-medium text-slate-500 italic leading-tight mt-0.5">{verificationResult.message}</p>
              </div>
            </div>
          </div>

          {showDetails && verificationResult.trademark && (
            <div className="bg-slate-50 dark:bg-white/[0.04] rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-4 animate-fade-in">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Metadata</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Class</span>
                  <span className="text-slate-700 dark:text-slate-300 italic">{verificationResult.trademark.category}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Birth Date</span>
                  <span className="text-slate-700 dark:text-slate-300">{verificationResult.trademark.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400">Owner Node</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono lowercae">
                    {verificationResult?.owner?.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setVerificationResult(null);
                setShowDetails(false);
              }}
              className="px-6 py-4 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Reset
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}