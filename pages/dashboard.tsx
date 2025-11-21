import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { apiClient } from '@/lib/api-client';

export default function Dashboard() {
  const { account, isConnected, connect } = useWeb3();
  
  const [userTrademarks, setUserTrademarks] = useState<any[]>([]);
  const [featuredTrademarks, setFeaturedTrademarks] = useState<any[]>([]);
  const [trendingTrademarks, setTrendingTrademarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({
    totalTrademarks: 0,
    verifiedTrademarks: 0,
    floorPrice: '0.03',
    totalVolume: '5,555',
  });

  useEffect(() => {
    if (isConnected && account) {
      loadDashboardData();
    }
  }, [isConnected, account]);

  const loadDashboardData = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      const [userRes] = await Promise.all([
        apiClient.getUser(account),
      ]);

      if (userRes.success && userRes.data) {
        const userData = userRes.data as any;
        setUserTrademarks(userData.trademarks || []);
        setStats({
          totalTrademarks: userData.stats?.totalTrademarks || 0,
          verifiedTrademarks: userData.stats?.verifiedTrademarks || 0,
          floorPrice: '0.03',
          totalVolume: '5,555',
        });
      }

      // Load demo data
      const { demoTrademarks } = await import('@/lib/demo-data');
      setFeaturedTrademarks(demoTrademarks.slice(0, 1));
      setTrendingTrademarks(demoTrademarks.slice(1, 7));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Dashboard - TrademarkChain</title>
        </Head>
        
        <div className="min-h-screen bg-[#202225] flex items-center justify-center">
          <div className="max-w-md w-full bg-[#2f3136] rounded-2xl border border-[#3a3d42] p-10 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8">
              Access your dashboard and manage your trademarks
            </p>
            <button onClick={connect} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - TrademarkChain</title>
      </Head>

      <div className="min-h-screen bg-[#202225]">
        {/* Header */}
        <header className="bg-[#2f3136] border-b border-[#3a3d42] sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold text-white">
                  SloganChain
                </Link>
                
                {/* Search Bar */}
                <div className="hidden md:block">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search SloganChain"
                      className="w-[400px] bg-[#202225] text-white placeholder-gray-500 px-4 py-2.5 pl-10 rounded-xl border border-[#3a3d42] focus:border-blue-500 focus:outline-none"
                    />
                    <svg className="absolute left-3 top-3 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-sm font-medium">Connect Wallet</span>
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {account?.slice(2, 4).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-[#2f3136] border-b border-[#3a3d42]">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="flex items-center gap-1 overflow-x-auto">
              {['All', 'Gaming', 'Art', 'PFPs', 'More'].map((tab, idx) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    idx === 0 
                      ? 'text-white border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
              
              {/* Filter Icons */}
              <div className="ml-auto flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-[#3a3d42] transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#3a3d42]' : 'hover:bg-[#3a3d42]'}`}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#3a3d42]' : 'hover:bg-[#3a3d42]'}`}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Featured Collection */}
              {featuredTrademarks.length > 0 && (
                <div className="mb-8">
                  {featuredTrademarks.map((trademark) => (
                    <div key={trademark.tokenId} className="relative bg-[#2f3136] rounded-2xl overflow-hidden border border-[#3a3d42] hover:border-[#4a4d52] transition-all">
                      <div className="flex flex-col lg:flex-row">
                        {/* Image Section */}
                        <div className="lg:w-1/2 aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-gray-700 to-gray-900 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <span className="text-6xl font-bold text-white">
                                {trademark.sloganText?.charAt(0) || '?'}
                              </span>
                            </div>
                          </div>
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2f3136] via-transparent to-transparent"></div>
                        </div>

                        {/* Info Section */}
                        <div className="lg:w-1/2 p-8">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {trademark.companyName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-white">{trademark.sloganText}</h2>
                              <p className="text-sm text-gray-400">By {trademark.companyName}</p>
                            </div>
                            {trademark.verified && (
                              <svg className="w-6 h-6 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-4 mb-6">
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Mint Price</p>
                              <p className="text-white font-bold">{stats.floorPrice} ETH</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Total Items</p>
                              <p className="text-white font-bold">{stats.totalVolume}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Mint Starts In</p>
                              <p className="text-white font-bold">00:09:35:20</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Category</p>
                              <p className="text-white font-bold">{trademark.category}</p>
                            </div>
                          </div>

                          <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                            {trademark.description || 'Blockchain-verified trademark with immutable ownership records and decentralized asset storage.'}
                          </p>

                          <Link
                            href={`/trademark/${trademark.tokenId}`}
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                          >
                            View Collection
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trending Tokens Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Trending Tokens</h2>
                  <p className="text-sm text-gray-400">Largest price change in the past day</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : trendingTrademarks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No trending tokens available</p>
                    </div>
                  ) : (
                    trendingTrademarks.map((trademark, idx) => (
                      <Link
                        key={trademark.tokenId}
                        href={`/trademark/${trademark.tokenId}`}
                        className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-4 hover:border-[#4a4d52] transition-all block"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg font-bold">
                              {trademark.sloganText?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-semibold truncate">{trademark.companyName}</h3>
                              {trademark.verified && (
                                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 truncate">{trademark.sloganText}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Floor</p>
                            <p className="text-white font-semibold">{(0.03 + idx * 0.01).toFixed(2)} ETH</p>
                          </div>
                          <div className={`px-2 py-1 rounded ${
                            idx % 2 === 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {idx % 2 === 0 ? '+' : '-'}{(Math.random() * 10 + 1).toFixed(1)}%
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Collections Sidebar */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-[#2f3136] rounded-2xl border border-[#3a3d42] p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Collection</h3>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-white text-sm">1d</button>
                      <button className="text-white text-sm font-semibold">7d</button>
                      <button className="text-gray-400 hover:text-white text-sm">30d</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {trendingTrademarks.slice(0, 7).map((trademark, idx) => (
                      <Link
                        key={trademark.tokenId}
                        href={`/trademark/${trademark.tokenId}`}
                        className="flex items-center gap-3 hover:bg-[#3a3d42] p-2 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {trademark.companyName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-white text-sm font-medium truncate">{trademark.companyName}</p>
                            {trademark.verified && (
                              <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">{(0.03 + idx * 0.01).toFixed(2)} ETH</p>
                            <p className={`text-xs ${idx % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {idx % 2 === 0 ? '+' : '-'}{(Math.random() * 5 + 0.5).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs">
                          {idx === 0 && '🔥'}
                          {idx === 1 && '⚡'}
                          {idx === 2 && '✨'}
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/marketplace"
                    className="block w-full mt-6 px-4 py-2 bg-[#3a3d42] text-white text-center rounded-xl font-medium hover:bg-[#4a4d52] transition-all"
                  >
                    View All Collections
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#2f3136] border-t border-[#3a3d42] mt-16">
          <div className="max-w-[1920px] mx-auto px-6 py-8">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <p>© 2024 TrademarkChain. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/support" className="hover:text-white transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
