import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import TrademarkCard from '@/components/marketplace/TrademarkCard';
import AnimatedPage from '@/components/common/AnimatedPage';
import { TrademarkMetadata } from '@/types';
import { TRADEMARK_CATEGORIES } from '@/utils/constants';

const CategoryPill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${active
        ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-lg shadow-black/5'
        : 'bg-slate-900/5 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 border border-transparent dark:border-white/10'
      }`}
  >
    {children}
  </button>
);

export default function Marketplace() {
  const router = useRouter();
  const { isConnected } = useWeb3();

  const [trademarks, setTrademarks] = useState<TrademarkMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        setTrademarks(data.data.map((tm: any) => ({
          ...tm,
          title: tm.title || tm.trademarkName || tm.sloganText,
          sloganText: tm.title || tm.trademarkName || tm.sloganText, // Keep for backward compat
          previewUrl: tm.previewUrl || tm.imageUrl,
          imageUrl: tm.previewUrl || tm.imageUrl, // Keep for backward compat
          createdAt: new Date(tm.createdAt?.seconds ? tm.createdAt.seconds * 1000 : tm.createdAt),
        })));
      }
    } catch (error) {
      console.error('Error loading trademarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrademarks = useMemo(() => {
    let filtered = [...trademarks];
    if (searchTerm) {
      filtered = filtered.filter(tm =>
        tm.sloganText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tm.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) filtered = filtered.filter(tm => tm.category === selectedCategory);
    return filtered;
  }, [trademarks, searchTerm, selectedCategory]);

  // Derived pagination data
  const totalPages = Math.ceil(filteredTrademarks.length / itemsPerPage);
  const currentItems = filteredTrademarks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <AnimatedPage>
      <div className="selection:bg-indigo-500/30 min-h-screen relative flex flex-col transition-colors duration-500">
        <Head>
          <title>Assets Index | TrademarkChain</title>
        </Head>

        <Navbar />

        <main className="flex-1 pt-28 pb-20 px-4 md:px-6">
          <div className="max-w-[1400px] mx-auto">

            {/* Minimal Header Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Registry Index</h1>
                <div className="h-5 w-[1px] bg-slate-900/10 dark:bg-white/20 hidden md:block" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 dark:text-white/40 hidden md:block">
                  {filteredTrademarks.length} Protocols Active
                </span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                  <input
                    type="text"
                    className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-full py-2.5 pl-10 pr-4 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                    placeholder="Search across universal index..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="flex items-center bg-slate-900/5 dark:bg-white/5 p-1 rounded-full border border-slate-900/10 dark:border-white/10">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-400 dark:text-white/40'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-400 dark:text-white/40'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
              <CategoryPill active={selectedCategory === ''} onClick={() => setSelectedCategory('')}>All Protocols</CategoryPill>
              {TRADEMARK_CATEGORIES.map(cat => (
                <CategoryPill
                  key={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </CategoryPill>
              ))}
            </div>

            {/* Assets Grid */}
            <div className="min-h-[600px]">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="aspect-[4/5] rounded-[2rem] bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/5 dark:border-white/10 animate-pulse" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {currentItems.length > 0 ? (
                    <motion.div
                      key={currentPage + selectedCategory + searchTerm}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}
                    >
                      {currentItems.map((tm, i) => (
                        <TrademarkCard key={tm.tokenId} trademark={tm} viewMode={viewMode} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-40 text-center border border-slate-900/10 dark:border-white/10 rounded-[2rem] bg-slate-900/5 dark:bg-white/[0.01]"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">Universal Index Empty: No protocols match criteria</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-900/10 dark:border-white/10 disabled:opacity-20 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-full text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white dark:bg-white dark:text-black' : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-900/10 dark:border-white/10 disabled:opacity-20 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>


      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AnimatedPage>
  );
}
