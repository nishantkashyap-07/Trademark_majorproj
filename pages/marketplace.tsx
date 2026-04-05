import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import { TrademarkMetadata } from '@/types';
import { TRADEMARK_CATEGORIES } from '@/utils/constants';

export default function Marketplace() {
  const router = useRouter();
  const { isConnected } = useWeb3();
  
  const [trademarks, setTrademarks] = useState<TrademarkMetadata[]>([]);
  const [filteredTrademarks, setFilteredTrademarks] = useState<TrademarkMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadTrademarks();
  }, []);

  useEffect(() => {
    if (router.query.search) setSearchTerm(router.query.search as string);
    if (router.query.category) setSelectedCategory(router.query.category as string);
  }, [router.query]);

  const loadTrademarks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trademarks?limitCount=100');
      const data = await response.json();
      if (data.success && data.data) {
        const trademarksData = data.data.map((tm: any) => ({
          ...tm,
          sloganText: tm.trademarkName || tm.sloganText,
          createdAt: new Date(tm.createdAt?.seconds ? tm.createdAt.seconds * 1000 : tm.createdAt),
        }));
        setTrademarks(trademarksData);
      }
    } catch (error) {
      console.error('Error loading trademarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...trademarks];
    if (searchTerm) {
      filtered = filtered.filter(tm =>
        tm.sloganText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tm.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) filtered = filtered.filter(tm => tm.category === selectedCategory);
    if (showVerifiedOnly) filtered = filtered.filter(tm => tm.verified);

    switch (sortBy) {
      case 'newest': filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
      case 'oldest': filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); break;
      case 'name': filtered.sort((a, b) => a.sloganText.localeCompare(b.sloganText)); break;
    }
    setFilteredTrademarks(filtered);
  }, [trademarks, searchTerm, selectedCategory, sortBy, showVerifiedOnly]);

  return (
    <div className="bg-[#05070a] selection:bg-indigo-500/30">
      <Head>
        <title>Marketplace | TrademarkChain Protocol</title>
      </Head>

      <Navbar />

      <main className="min-h-screen pt-32 pb-20 overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 mb-4 tracking-widest uppercase">
                Global Asset Discovery
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4">IP Marketplace</h1>
              <p className="text-slate-400 text-lg">Explore and verify authentic intellectual property assets registered on the universal ledger.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="glass-card !p-2 flex items-center gap-1 rounded-2xl">
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                 </button>
                 <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
                 </button>
              </div>
              <Link href="/register" className="btn-premium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                Register Asset
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-start">
             <div className="lg:order-2 space-y-8 animate-slide-in-right">
                <div className="glass-card !p-6">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Search Registry</h3>
                   <div className="relative">
                      <input 
                        type="text" 
                        className="premium-input !pl-12" 
                        placeholder="Name, ID, Owner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   </div>
                </div>

                <div className="glass-card !p-6">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Categories</h3>
                   <div className="space-y-2">
                      <button 
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === '' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'}`}
                      >
                        All Assets
                      </button>
                      {TRADEMARK_CATEGORIES.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="glass-card !p-6">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Verification</h3>
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                         <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={showVerifiedOnly}
                          onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                         />
                         <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Verified Only</span>
                   </label>
                </div>
             </div>

             <div className="lg:order-1 animate-slide-up">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="glass-card aspect-[4/3] animate-pulse bg-white/5" />
                     ))}
                  </div>
                ) : filteredTrademarks.length > 0 ? (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-6"}>
                    {filteredTrademarks.map((tm, i) => (
                      <div key={tm.tokenId} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                        <TrademarkCard trademark={tm} viewMode={viewMode} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card py-32 text-center">
                     <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                     </div>
                     <h3 className="text-2xl font-black mb-2">No Assets Found</h3>
                     <p className="text-slate-400 mb-8">Try adjusting your filters or search terms for the registry.</p>
                     <button onClick={() => {setSearchTerm(''); setSelectedCategory(''); setShowVerifiedOnly(false);}} className="btn-glass">Clear All Filters</button>
                  </div>
                )}

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-12 opacity-50">
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Inventory</p>
                      <p className="text-lg font-black text-white">{filteredTrademarks.length}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated</p>
                      <p className="text-lg font-black text-indigo-400">{filteredTrademarks.filter(tm => tm.verified).length}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Registry Nodes</p>
                      <p className="text-lg font-black text-white">POLYGON_MAINNET</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}