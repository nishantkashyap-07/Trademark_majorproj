import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import LicenseModal from '@/components/marketplace/LicenseModal';
import PurchaseLicenseModal from '@/components/marketplace/PurchaseLicenseModal';
import SellModal from '@/components/marketplace/SellModal';
import BuyModal from '@/components/marketplace/BuyModal';
import LicenseCard from '@/components/marketplace/LicenseCard';
import { TrademarkMetadata, Listing, License } from '@/types';
import { useWeb3 } from '@/contexts/Web3Context';
import { getLicensesForToken } from '@/utils/contracts';
import Footer from '@/components/common/Footer';

export default function TrademarkDetail() {
   const router = useRouter();
   const { id } = router.query;
   const { account, isConnected } = useWeb3();
   const [activeTab, setActiveTab] = useState<'details' | 'history' | 'verification' | 'licenses'>('details');
   const [showLicenseModal, setShowLicenseModal] = useState(false);
   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
   const [showSellModal, setShowSellModal] = useState(false);
   const [showBuyModal, setShowBuyModal] = useState(false);
   const [showRatingModal, setShowRatingModal] = useState(false);
   const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
   const [selectedSaleListing, setSelectedSaleListing] = useState<Listing | null>(null);
   const [licenses, setLicenses] = useState<License[]>([]);
   const [activeListings, setActiveListings] = useState<Listing[]>([]);
   const [activeSaleListings, setActiveSaleListings] = useState<Listing[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [trademark, setTrademark] = useState<TrademarkMetadata | null>(null);
   const [ratingKey, setRatingKey] = useState(0);

   const isOwner = account?.toLowerCase() === (trademark?.ownerId || trademark?.creatorAddress)?.toLowerCase();

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
               title: data.data.title || data.data.trademarkName || data.data.sloganText,
               sloganText: data.data.title || data.data.trademarkName || data.data.sloganText, // compat
               previewUrl: data.data.previewUrl || data.data.imageUrl,
               imageUrl: data.data.previewUrl || data.data.imageUrl, // compat
               blockchainTokenId: data.data.blockchainTokenId || data.data.tokenId,
               createdAt: new Date(data.data.createdAt?.seconds ? data.data.createdAt.seconds * 1000 : data.data.createdAt),
            };
            setTrademark(trademarkData);
            const tokenId = trademarkData.blockchainTokenId || trademarkData.tokenId;
            loadLicenses(tokenId);
            loadActiveListings(tokenId);
         }
      } catch (error) {
         console.error('Error loading trademark:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const loadLicenses = async (tokenId: number) => {
      try {
         const { getLicensesForToken } = await import('@/utils/contracts');
         const licenseData = await getLicensesForToken(tokenId);
         setLicenses(licenseData || []);
      } catch (err) {
         setLicenses([]);
      }
   };

   const loadActiveListings = async (tokenId: number) => {
      try {
         const { getActiveListingsForToken, getListingInfo } = await import('@/utils/contracts');
         const listingIds = await getActiveListingsForToken(tokenId);
         
         const listingsData = await Promise.all(
            listingIds.map(async (lid) => {
               const info = await getListingInfo(lid);
               return info;
            })
         );
         
         // Separate license listings from sale listings
         setActiveListings(listingsData.filter(l => l.isLicense && l.active));
         setActiveSaleListings(listingsData.filter(l => !l.isLicense && l.active));
      } catch (err) {
         console.error('Error loading listings:', err);
         setActiveListings([]);
         setActiveSaleListings([]);
      }
   };

   const scrollToLicenses = () => {
      setActiveTab('licenses');
      const element = document.getElementById('trademark-tabs');
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
   };

   const handlePurchaseClick = (listing: Listing) => {
      setSelectedListing(listing);
      setShowPurchaseModal(true);
   };

   const handleBuyClick = (listing: Listing) => {
      setSelectedSaleListing(listing);
      setShowBuyModal(true);
   };

   if (isLoading || !trademark) {
      return (
         <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
         </div>
      );
   }

   return (
      <div className="min-h-screen flex flex-col transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
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
                     <div className="glass-card !p-0 aspect-video relative group overflow-hidden !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
                           <div className="w-full h-full flex flex-col md:flex-row items-center gap-12">
                              {/* Box-inside-box image design */}
                              <div className="w-full md:w-1/2 aspect-square flex-shrink-0 p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center justify-center relative overflow-hidden group/img">
                                 {trademark.imageUrl || trademark.ipfsHash ? (
                                    <img
                                       src={trademark.imageUrl || `https://gateway.pinata.cloud/ipfs/${trademark.ipfsHash}`}
                                       className="w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-110 drop-shadow-2xl"
                                       alt="Identity Asset"
                                    />
                                 ) : (
                                    <span className="text-8xl font-bold text-slate-200 dark:text-white/5 select-none uppercase">{trademark.sloganText?.charAt(0)}</span>
                                 )}
                              </div>

                              <div className="flex-1 text-center md:text-left">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-6 tracking-widest uppercase">
                                    Asset Registry Identification
                                 </div>
                                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                                    {trademark.sloganText}
                                 </h2>
                                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200 dark:border-white/10">
                                       {trademark.category}
                                    </span>
                                    {trademark.verified && (
                                       <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                          On-Chain Authenticated
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 hover:!translate-y-0">
                           <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Protocol Reference</p>
                           <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{trademark.registrationNumber}</p>
                        </div>
                        <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 hover:!translate-y-0">
                           <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Registry ID</p>
                           <p className="text-xl font-bold text-slate-900 dark:text-white">#{trademark.blockchainTokenId || trademark.tokenId || '...'}</p>
                        </div>
                        <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 hover:!translate-y-0">
                           <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Secondary Royalty</p>
                           <p className="text-xl font-bold text-slate-900 dark:text-white">{trademark.royaltyPercentage}%</p>
                        </div>
                     </div>

                     {/* Tabs Content */}
                     <div id="trademark-tabs" className="glass-card !p-0 overflow-hidden !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 shadow-xl">
                        <div className="flex border-b border-slate-100 dark:border-white/5">
                           {['details', 'licenses', 'history', 'verification'].map((tab) => (
                              <button
                                 key={tab}
                                 onClick={() => setActiveTab(tab as any)}
                                 className={`flex-1 py-5 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
                              >
                                 {tab}
                              </button>
                           ))}
                        </div>
                        <div className="p-8">
                           {activeTab === 'details' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] mb-4">Intellectual Property Narrative</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium">{trademark.description || 'No description provided by the creator.'}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                    <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                                       <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Original Registration</h4>
                                       <p className="font-bold text-slate-900 dark:text-white">{trademark.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                                       <h4 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Identity Language</h4>
                                       <p className="font-bold text-slate-900 dark:text-white">Global Standard (English)</p>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {activeTab === 'licenses' && (
                              <div className="space-y-10 animate-fade-in">

                                 {/* ── Sale Listings Section ── */}
                                 <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                       <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">For Sale — Full Ownership</h3>
                                       {isOwner && <button onClick={() => setShowSellModal(true)} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20">List for Sale</button>}
                                    </div>
                                    {activeSaleListings.length > 0 ? (
                                       <div className="grid grid-cols-1 gap-4">
                                          {activeSaleListings.map(listing => (
                                             <div key={listing.listingId} className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-amber-500/10 transition-all">
                                                <div className="flex items-center gap-6">
                                                   <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                   </div>
                                                   <div>
                                                      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Outright Purchase</p>
                                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Full NFT ownership transferred on purchase</p>
                                                   </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                   <div className="text-right">
                                                      <p className="text-lg font-bold text-slate-900 dark:text-white">{listing.price} MATIC</p>
                                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sale Price</p>
                                                   </div>
                                                   {!isOwner && (
                                                      <button
                                                         onClick={() => handleBuyClick(listing)}
                                                         className="px-8 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl"
                                                      >
                                                         Buy Now
                                                      </button>
                                                   )}
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    ) : (
                                       <div className="py-10 text-center border-2 border-dashed border-amber-200 dark:border-amber-500/10 rounded-[2.5rem] bg-amber-50/50 dark:bg-amber-500/[0.02]">
                                          <p className="text-sm font-medium text-slate-400">This asset is not currently listed for sale.</p>
                                       </div>
                                    )}
                                 </div>

                                 {/* ── License Listings Section ── */}
                                 <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center justify-between">
                                       <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Available Licenses</h3>
                                       {isOwner && <button onClick={() => setShowLicenseModal(true)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">Provision New License</button>}
                                    </div>
                                    
                                    {activeListings.length > 0 ? (
                                       <div className="grid grid-cols-1 gap-4">
                                          {activeListings.map(listing => (
                                             <div key={listing.listingId} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.05] transition-all">
                                                <div className="flex items-center gap-6">
                                                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                   </div>
                                                   <div>
                                                      <p className="text-sm font-bold text-white uppercase tracking-widest">{listing.duration === 0 ? 'Perpetual Access' : `${Math.floor(listing.duration! / (24 * 60 * 60))} Day License`}</p>
                                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Acquire usage rights for commercial protocol</p>
                                                   </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                   <div className="text-right">
                                                      <p className="text-lg font-bold text-white">{listing.price} ETH</p>
                                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Fee</p>
                                                   </div>
                                                   {!isOwner && (
                                                      <button 
                                                         onClick={() => handlePurchaseClick(listing)}
                                                         className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                                                      >
                                                         Acquire
                                                      </button>
                                                   )}
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    ) : (
                                       <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.01]">
                                          <p className="text-sm font-medium text-slate-400">No available license protocols found for this asset.</p>
                                       </div>
                                    )}
                                 </div>

                                 {/* Issued Licenses Section */}
                                 <div className="space-y-6 pt-10 border-t border-white/5">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Registry of Issued Licenses</h3>
                                    {licenses.length > 0 ? (
                                       <div className="space-y-4">
                                          {licenses.map(l => <LicenseCard key={l.licenseId} license={l} trademarkName={trademark.sloganText} showTrademark={false} />)}
                                       </div>
                                    ) : (
                                       <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-slate-50/50 dark:bg-white/[0.01]">
                                          <p className="text-sm font-medium text-slate-400">No licenses have been issued for this asset identity yet.</p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}

                           {activeTab === 'verification' && (
                              <div className="space-y-8 animate-fade-in">
                                 <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 flex gap-6 items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <div>
                                       <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">Authenticity Protocol Verified</p>
                                       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">This asset identity is permanently hashed and recorded on the Polygon network.</p>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 gap-4">
                                    <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Distributed Ledger</span>
                                       <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Polygon Amoy Testnet</span>
                                    </div>
                                    <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">Registry Hash</span>
                                       <a href={`https://amoy.polygonscan.com/tx/${trademark.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[240px]">{trademark.transactionHash || 'NOT_ON_CHAIN'}</a>
                                    </div>
                                    <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">IPFS Metadata Identifier</span>
                                       <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-white/60 truncate max-w-[200px]">{trademark.ipfsHash}</span>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Actions & Meta */}
                  <div className="space-y-8 animate-slide-in-right">
                     <div className="glass-card !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 shadow-xl">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] mb-8">Registered Identity Holder</h3>
                        <div className="flex items-center gap-5 mb-10">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg">
                              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[0.9rem] flex items-center justify-center">
                                 <span className="text-2xl font-bold text-slate-900 dark:text-white">{trademark.companyName?.charAt(0)}</span>
                              </div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xl font-bold text-slate-900 dark:text-white truncate tracking-tight">{trademark.companyName}</p>
                              <p className="text-[10px] font-bold font-mono text-slate-400 dark:text-white/20 truncate mt-1">{trademark.creatorAddress}</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between py-6 border-t border-slate-100 dark:border-white/5">
                           <div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest mb-2">Confidence Score</p>
                           </div>
                           {!isOwner && isConnected && (
                              <button
                                 onClick={() => setShowRatingModal(true)}
                                 className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all border border-slate-100 dark:border-white/5 group/rate"
                              >
                                 <svg className="w-6 h-6 text-slate-300 dark:text-white/20 group-hover/rate:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              </button>
                           )}
                        </div>
                     </div>

                     <div className="space-y-4">
                         {isOwner ? (
                            <>
                               <button onClick={() => setShowSellModal(true)} className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Sell Asset
                               </button>
                               <button onClick={() => setShowLicenseModal(true)} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                  Provision License Access
                               </button>
                            </>
                         ) : (
                            <button onClick={scrollToLicenses} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95">View Listings</button>
                         )}
                        <div className="grid grid-cols-2 gap-4">
                           <button className="py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center gap-3">
                              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                              Share
                           </button>
                           <button className="py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border border-slate-100 dark:border-white/5 flex items-center justify-center gap-3">
                              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                              Bookmark
                           </button>
                        </div>
                     </div>

                     <div className="glass-card !bg-amber-500/5 !border-amber-500/20 shadow-sm">
                        <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           Regulatory Protocol
                        </h4>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-500/60 leading-relaxed font-semibold italic">
                           This decentralized record serves as cryptographic proof-of-existence. It maintains a permanent audit trail but does not supersede statutory jurisdictional requirements. Verified protocols should be used in conjunction with local counsel for full commercial protection.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </main>

         <Footer />

         <LicenseModal
            isOpen={showLicenseModal}
            onClose={() => setShowLicenseModal(false)}
            tokenId={(trademark.blockchainTokenId || trademark.tokenId) as number}
            trademarkName={trademark.sloganText}
            onSuccess={() => {
               const tokenId = (trademark.blockchainTokenId || trademark.tokenId) as number;
               loadLicenses(tokenId);
               loadActiveListings(tokenId);
            }}
         />

         <SellModal
            isOpen={showSellModal}
            onClose={() => setShowSellModal(false)}
            tokenId={(trademark.blockchainTokenId || trademark.tokenId) as number}
            trademarkName={trademark.sloganText}
            onSuccess={() => {
               const tokenId = (trademark.blockchainTokenId || trademark.tokenId) as number;
               loadActiveListings(tokenId);
            }}
         />

         {selectedListing && (
            <PurchaseLicenseModal
               isOpen={showPurchaseModal}
               onClose={() => { setShowPurchaseModal(false); setSelectedListing(null); }}
               listing={selectedListing}
               trademarkName={trademark.sloganText}
               onSuccess={() => {
                  const tokenId = (trademark.blockchainTokenId || trademark.tokenId) as number;
                  loadLicenses(tokenId);
                  loadActiveListings(tokenId);
               }}
            />
         )}

         {selectedSaleListing && (
            <BuyModal
               isOpen={showBuyModal}
               onClose={() => { setShowBuyModal(false); setSelectedSaleListing(null); }}
               listing={selectedSaleListing}
               trademarkName={trademark.sloganText}
               trademarkId={trademark.id}
               onSuccess={() => {
                  const tokenId = (trademark.blockchainTokenId || trademark.tokenId) as number;
                  loadActiveListings(tokenId);
                  loadTrademark(); // Reload to update "isOwner" state and UI buttons
               }}
            />
         )}
      </div>
   );
}