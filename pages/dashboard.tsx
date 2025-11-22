import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { apiClient } from '@/lib/api-client';
import { SloganMetadata } from '@/types';

interface DashboardStats {
  totalTrademarks: number;
  verifiedTrademarks: number;
  pendingTrademarks: number;
  totalUsers: number;
  totalCategories: number;
  verificationRate: string;
  recentActivity: any[];
}

export default function Dashboard() {
  const { account, isConnected, connect } = useWeb3();
  
  const [allTrademarks, setAllTrademarks] = useState<SloganMetadata[]>([]);
  const [userTrademarks, setUserTrademarks] = useState<SloganMetadata[]>([]);
  const [featuredTrademarks, setFeaturedTrademarks] = useState<SloganMetadata[]>([]);
  const [trendingTrademarks, setTrendingTrademarks] = useState<SloganMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState<DashboardStats>({
    totalTrademarks: 0,
    verifiedTrademarks: 0,
    pendingTrademarks: 0,
    totalUsers: 0,
    totalCategories: 0,
    verificationRate: '0',
    recentActivity: [],
  });
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load dashboard data on mount and when account changes
  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [account, isConnected]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    try {
      // Fetch real-time stats from API
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setStats({
          totalTrademarks: statsData.data.overview.totalSlogans || 0,
          verifiedTrademarks: statsData.data.overview.verifiedSlogans || 0,
          pendingTrademarks: (statsData.data.overview.totalSlogans || 0) - (statsData.data.overview.verifiedSlogans || 0),
          totalUsers: statsData.data.overview.totalUsers || 0,
          totalCategories: statsData.data.overview.totalCategories || 0,
          verificationRate: statsData.data.overview.verificationRate || '0',
          recentActivity: statsData.data.recentActivity || [],
        });
      }

      // Fetch all trademarks
      const trademarksRes = await fetch('/api/trademarks');
      const trademarksData = await trademarksRes.json();
      
      if (trademarksData.success && trademarksData.data) {
        const trademarks = trademarksData.data as SloganMetadata[];
        setAllTrademarks(trademarks);
        
        // Filter verified trademarks for featured
        const verified = trademarks.filter(t => t.verified);
        setFeaturedTrademarks(verified.slice(0, 1));
        
        // Sort by views or recent for trending
        const trending = [...trademarks]
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 6);
        setTrendingTrademarks(trending);
        
        // Filter user's trademarks if connected
        if (account) {
          const userTms = trademarks.filter(
            t => t.creatorAddress.toLowerCase() === account.toLowerCase()
          );
          setUserTrademarks(userTms);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      if (!silent) setIsLoading(false);
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
          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase">Total Trademarks</h3>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalTrademarks}</p>
              <p className="text-xs text-green-500">+{stats.pendingTrademarks} pending</p>
            </div>

            <div className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase">Verified</h3>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.verifiedTrademarks}</p>
              <p className="text-xs text-gray-400">{stats.verificationRate}% rate</p>
            </div>

            <div className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase">Active Users</h3>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
              <p className="text-xs text-gray-400">Registered creators</p>
            </div>

            <div className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-400 uppercase">Categories</h3>
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.totalCategories}</p>
              <p className="text-xs text-gray-400">Industry sectors</p>
            </div>
          </div>

          {/* User's Trademarks Section (if connected) */}
          {isConnected && account && userTrademarks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Your Trademarks</h2>
                <Link href="/register" className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                  Register New →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTrademarks.slice(0, 3).map((trademark) => (
                  <Link
                    key={trademark.tokenId}
                    href={`/trademark/${trademark.tokenId}`}
                    className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-4 hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {trademark.sloganText?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{trademark.sloganText}</h3>
                        <p className="text-sm text-gray-400 truncate">{trademark.companyName}</p>
                      </div>
                      {trademark.verified ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded">Verified</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Token #{trademark.tokenId}</span>
                      <span>{trademark.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
                              <p className="text-xs text-gray-500 uppercase mb-1">Token ID</p>
                              <p className="text-white font-bold">#{trademark.tokenId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Royalty</p>
                              <p className="text-white font-bold">{trademark.royaltyPercentage}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Views</p>
                              <p className="text-white font-bold">{trademark.views || 0}</p>
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
                  <div>
                    <h2 className="text-2xl font-bold text-white">Trending Tokens</h2>
                    <p className="text-sm text-gray-400 mt-1">Most viewed in the past 24 hours</p>
                  </div>
                  <button
                    onClick={() => loadDashboardData()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3a3d42] text-white rounded-lg hover:bg-[#4a4d52] transition-all disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm">Refresh</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    <div className="col-span-full text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="text-gray-400 mt-4">Loading real-time data...</p>
                    </div>
                  ) : trendingTrademarks.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-400">No trademarks available yet</p>
                      <Link href="/register" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                        Register First Trademark
                      </Link>
                    </div>
                  ) : (
                    trendingTrademarks.map((trademark, idx) => (
                      <Link
                        key={trademark.tokenId}
                        href={`/trademark/${trademark.tokenId}`}
                        className="bg-[#2f3136] rounded-xl border border-[#3a3d42] p-4 hover:border-[#4a4d52] transition-all block group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                            <p className="text-gray-500 text-xs">Token ID</p>
                            <p className="text-white font-semibold">#{trademark.tokenId}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Views</p>
                            <p className="text-white font-semibold">{trademark.views || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Category</p>
                            <p className="text-white font-semibold text-xs truncate max-w-[80px]">{trademark.category}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#3a3d42]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              Registered {new Date(trademark.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              trademark.verificationStatus === 'verified' 
                                ? 'bg-green-500/10 text-green-500' 
                                : trademark.verificationStatus === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {trademark.verificationStatus}
                            </span>
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
                    <h3 className="text-lg font-bold text-white">Top Collections</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {allTrademarks.slice(0, 8).map((trademark, idx) => (
                      <Link
                        key={trademark.tokenId}
                        href={`/trademark/${trademark.tokenId}`}
                        className="flex items-center gap-3 hover:bg-[#3a3d42] p-2 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-gray-500 text-sm font-medium w-6">{idx + 1}</span>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                              <p className="text-xs text-gray-400 truncate">{trademark.category}</p>
                              <p className="text-xs text-gray-500">#{trademark.tokenId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400 text-base flex-shrink-0">
                          {idx === 0 && '🔥'}
                          {idx === 1 && '⚡'}
                          {idx === 2 && '✨'}
                          {idx === 3 && '💎'}
                          {idx === 4 && '🚀'}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {allTrademarks.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm">No collections yet</p>
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <Link
                      href="/marketplace"
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-xl font-medium hover:bg-blue-700 transition-all"
                    >
                      Explore Marketplace
                    </Link>
                    <Link
                      href="/categories"
                      className="block w-full px-4 py-2 bg-[#3a3d42] text-white text-center rounded-xl font-medium hover:bg-[#4a4d52] transition-all"
                    >
                      Browse Categories
                    </Link>
                  </div>
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
