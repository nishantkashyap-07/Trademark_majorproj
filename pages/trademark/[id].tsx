import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LicenseModal from '@/components/LicenseModal';
import PurchaseLicenseModal from '@/components/PurchaseLicenseModal';
import LicenseCard from '@/components/LicenseCard';
import RatingModal from '@/components/RatingModal';
import RatingDisplay from '@/components/RatingDisplay';
import { TrademarkMetadata, Listing, License } from '@/types';
import { useWeb3 } from '@/contexts/Web3Context';
import { getLicensesForToken } from '@/utils/contracts';

export default function TrademarkDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { account, isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'verification' | 'licenses'>('details');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trademark, setTrademark] = useState<TrademarkMetadata | null>(null);
  const [ratingKey, setRatingKey] = useState(0);

  const isOwner = account?.toLowerCase() === trademark?.creatorAddress.toLowerCase();

  useEffect(() => {
    if (id) loadTrademark();
  }, [id]);

  const loadTrademark = async () => {
    setIsLoading(true);
    try {
      let response = await fetch(`/api/trademarks/${id}`);
      let data = await response.json();
      
      if (!data.success) {
        response = await fetch(`/api/trademarks?tokenId=${id}`);
        data = await response.json();
        if (data.success && data.data?.[0]) data = { success: true, data: data.data[0] };
      }
      
      if (data.success && data.data) {
        const trademarkData = {
          ...data.data,
          sloganText: data.data.trademarkName || data.data.sloganText,
          createdAt: new Date(data.data.createdAt?.seconds ? data.data.createdAt.seconds * 1000 : data.data.createdAt),
        };
        setTrademark(trademarkData);
        loadLicenses(trademarkData.tokenId);
      }
    } catch (error) {
      console.error('Error loading trademark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLicenses = async (tokenId: number) => {
    try {
      const licenseData = await getLicensesForToken(tokenId);
      setLicenses(licenseData || []);
    } catch (err) {
      setLicenses([]);
    }
  };

  if (isLoading || !trademark) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#05070a] text-white selection:bg-indigo-500/30">
      <Head>
        <title>{trademark.sloganText} | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-[1fr_450px] gap-12 items-start">
            
            {/* Left Column: Presentation */}
            <div className="space-y-8 animate-slide-up">
               <div className="glass-card !p-0 aspect-video relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                     <div className="text-center">
                        <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 group-hover:scale-110 transition-transform duration-700">
                           <span className="text-6xl font-black text-white">{trademark.sloganText?.charAt(0)}</span>
                        </div>
                        <h2 className="text-4xl font-black mb-4 tracking-tighter">{trademark.sloganText}</h2>
                        <div className="flex items-center justify-center gap-4">
                           <span className="status-badge status-badge-purple !px-4">{trademark.category}</span>
                           {trademark.verified && (
                             <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                               Secured on Polygon
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                  {/* Glass Reflection effect */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
               </div>

               <div className="flex gap-4">
                  <div className="glass-card flex-1">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Protocol ID</p>
                     <p className="text-lg font-black font-mono text-indigo-400">{trademark.registrationNumber}</p>
                  </div>
                  <div className="glass-card flex-1">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mint ID</p>
                     <p className="text-lg font-black text-white">#{trademark.tokenId}</p>
                  </div>
                  <div className="glass-card flex-1">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Royalty</p>
                     <p className="text-lg font-black text-white">{trademark.royaltyPercentage}%</p>
                  </div>
               </div>

               {/* Tabs Content */}
               <div className="glass-card !p-0 overflow-hidden">
                  <div className="flex border-b border-white/5">
                     {['details', 'licenses', 'history', 'verification'].map((tab) => (
                        <button 
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'}`}
                        >
                          {tab}
                        </button>
                     ))}
                  </div>
                  <div className="p-8">
                     {activeTab === 'details' && (
                        <div className="space-y-8 animate-fade-in">
                           <div>
                              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Intellectual Property Narrative</h3>
                              <p className="text-slate-300 leading-relaxed text-lg">{trademark.description || 'No description provided by the creator.'}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                              <div>
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Original Mint Date</h4>
                                 <p className="font-bold text-white">{trademark.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                              <div>
                                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Language Protocol</h4>
                                 <p className="font-bold text-white">English (US)</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'licenses' && (
                        <div className="space-y-6 animate-fade-in">
                           <div className="flex items-center justify-between">
                              <h3 className="text-sm font-black uppercase tracking-widest text-white">License Matrix</h3>
                              {isOwner && <button onClick={() => setShowLicenseModal(true)} className="btn-premium !py-2 !px-4 !text-xs">Issue New License</button>}
                           </div>
                           {licenses.length > 0 ? (
                              <div className="space-y-4">
                                 {licenses.map(l => <LicenseCard key={l.licenseId} license={l} trademarkName={trademark.sloganText} showTrademark={false} />)}
                              </div>
                           ) : (
                              <div className="py-12 text-center text-slate-500 font-bold border-2 border-dashed border-white/5 rounded-3xl">
                                 No active license protocols available for this asset.
                              </div>
                           )}
                        </div>
                     )}

                     {activeTab === 'verification' && (
                        <div className="space-y-8 animate-fade-in">
                           <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-3xl p-8 flex gap-6 items-center">
                              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                              </div>
                              <div>
                                 <p className="text-lg font-black mb-1">On-Chain Authenticity Report</p>
                                 <p className="text-sm text-slate-400">This asset has been cryptographically signed and stored on the immutable ledger.</p>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Network</span>
                                 <span className="text-xs font-black text-white uppercase tracking-widest">Polygon Mainnet</span>
                              </div>
                              <div className="flex justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Transaction Hash</span>
                                 <a href={`https://amoy.polygonscan.com/tx/${trademark.transactionHash}`} className="text-xs font-mono text-indigo-400 hover:text-indigo-300 truncate max-w-[200px]">{trademark.transactionHash || 'NOT_ON_CHAIN'}</a>
                              </div>
                              <div className="flex justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Metadata Standard</span>
                                 <span className="text-xs font-black text-white uppercase tracking-widest">ERC-721 / IPFS</span>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Column: Actions & Meta */}
            <div className="space-y-8 animate-slide-in-right">
               <div className="glass-card">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Registered Creator</h3>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-0.5">
                        <div className="w-full h-full bg-[#05070a] rounded-full flex items-center justify-center">
                           <span className="text-xl font-black text-white">{trademark.companyName?.charAt(0)}</span>
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-lg font-black truncate">{trademark.companyName}</p>
                        <p className="text-xs font-mono text-slate-500 truncate">{trademark.creatorAddress}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between py-6 border-t border-white/5">
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Creator Trust Score</p>
                        <RatingDisplay key={ratingKey} creatorAddress={trademark.creatorAddress} size="medium" showCount={true} />
                     </div>
                     {!isOwner && isConnected && (
                        <button onClick={() => setShowRatingModal(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                           <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </button>
                     )}
                  </div>
               </div>

               <div className="space-y-4">
                  {isOwner ? (
                     <button onClick={() => setShowLicenseModal(true)} className="btn-premium w-full !py-4 flex items-center justify-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        Deploy New License Listing
                     </button>
                  ) : (
                    <button className="btn-premium w-full !py-4">Request Commercial License</button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                     <button className="btn-glass !py-3 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                        Share
                     </button>
                     <button className="btn-glass !py-3 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                        Bookmark
                     </button>
                  </div>
               </div>

               <div className="glass-card bg-amber-500/5 !border-amber-500/20">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Legal Disclaimer</h4>
                  <p className="text-[11px] text-amber-600/70 leading-relaxed font-bold">
                     Blockchain registration provides a proof-of-existence but does not replace national trademark filings. Verify local jurisdictional compliance before commercial deployment.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>

      <LicenseModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        tokenId={trademark.tokenId}
        trademarkName={trademark.sloganText}
        onSuccess={() => loadLicenses(trademark.tokenId)}
      />

      {selectedListing && (
        <PurchaseLicenseModal
          isOpen={showPurchaseModal}
          onClose={() => { setShowPurchaseModal(false); setSelectedListing(null); }}
          listing={selectedListing}
          trademarkName={trademark.sloganText}
          onSuccess={() => loadLicenses(trademark.tokenId)}
        />
      )}

      <RatingModal
        creatorAddress={trademark.creatorAddress}
        trademarkId={trademark.tokenId.toString()}
        trademarkName={trademark.sloganText}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSuccess={() => setRatingKey(prev => prev + 1)}
      />
    </div>
  );
}