import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkBadge from '@/components/TrademarkBadge';
import { apiClient } from '@/lib/api-client';

export default function Dashboard() {
  const router = useRouter();
  const { account, isConnected, connect } = useWeb3();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [userTrademarks, setUserTrademarks] = useState<any[]>([]);
  const [marketplaceActivity, setMarketplaceActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTrademarks: 0,
    verifiedTrademarks: 0,
    totalValue: '0.00',
    marketplaceListings: 0,
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
      const [userRes, statsRes] = await Promise.all([
        apiClient.getUser(account),
        apiClient.getStats(),
      ]);

      if (userRes.success && userRes.data) {
        const userData = userRes.data as any;
        setUserTrademarks(userData.trademarks || []);
        setStats({
          totalTrademarks: userData.stats?.totalTrademarks || 0,
          verifiedTrademarks: userData.stats?.verifiedTrademarks || 0,
          totalValue: '0.00',
          marketplaceListings: 0,
        });
      }

      // Load marketplace activity from demo data
      const { demoMarketplaceActivity } = await import('@/lib/demo-data');
      setMarketplaceActivity(demoMarketplaceActivity);
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
        
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="max-w-md w-full bg-gray-50 rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8">
              Access your dashboard and manage your trademarks
            </p>
            <button onClick={connect} className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'trademarks', name: 'My Trademarks', icon: '🏷️' },
    { id: 'marketplace', name: 'Marketplace Activity', icon: '📈' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - TrademarkChain</title>
      </Head>

      <div className="min-h-screen bg-white">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Manage your trademarks and monitor marketplace activity
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="bg-gray-50 rounded-2xl border border-gray-200 p-2">
                <div className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/register"
                    className="block w-full px-4 py-2 bg-gray-900 text-white text-center rounded-xl font-medium hover:bg-gray-800 transition-all"
                  >
                    Register Trademark
                  </Link>
                  <Link
                    href="/marketplace"
                    className="block w-full px-4 py-2 bg-white text-gray-900 text-center rounded-xl font-medium border border-gray-200 hover:border-gray-900 transition-all"
                  >
                    Browse Marketplace
                  </Link>
                  <Link
                    href="/verify"
                    className="block w-full px-4 py-2 bg-white text-gray-900 text-center rounded-xl font-medium border border-gray-200 hover:border-gray-900 transition-all"
                  >
                    Verify Trademark
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalTrademarks}</p>
                      <p className="text-sm text-gray-600">Total Trademarks</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stats.verifiedTrademarks}</p>
                      <p className="text-sm text-gray-600">Verified</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalValue}</p>
                      <p className="text-sm text-gray-600">Portfolio Value (MATIC)</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stats.marketplaceListings}</p>
                      <p className="text-sm text-gray-600">Active Listings</p>
                    </div>
                  </div>

                  {/* Recent Trademarks */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Your Trademarks</h3>
                      <button
                        onClick={() => setActiveTab('trademarks')}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
                      >
                        View all
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : userTrademarks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No trademarks yet</h3>
                        <p className="text-gray-600 mb-6">
                          Register your first trademark to get started
                        </p>
                        <Link
                          href="/register"
                          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                        >
                          Register Trademark
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userTrademarks.slice(0, 5).map((trademark) => (
                          <div
                            key={trademark.id}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-700">
                                  {trademark.trademarkName?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{trademark.trademarkName}</p>
                                <p className="text-sm text-gray-600">{trademark.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {trademark.verified && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Verified
                                </span>
                              )}
                              <Link
                                href={`/trademark/${trademark.id}`}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* My Trademarks Tab */}
              {activeTab === 'trademarks' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">My Trademarks</h2>
                    <Link
                      href="/register"
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                    >
                      Register New
                    </Link>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-20">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                      <p className="mt-4 text-gray-600">Loading trademarks...</p>
                    </div>
                  ) : userTrademarks.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">No trademarks registered</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Start protecting your brand by registering your first trademark on the blockchain
                      </p>
                      <Link
                        href="/register"
                        className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all"
                      >
                        Register Your First Trademark
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userTrademarks.map((trademark) => (
                        <div
                          key={trademark.id}
                          className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all"
                        >
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-4xl font-bold text-gray-700">
                                {trademark.trademarkName?.charAt(0) || '?'}
                              </span>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {trademark.trademarkName}
                              </h3>
                              {trademark.verified && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {trademark.description || 'No description'}
                            </p>

                            <div className="space-y-2 text-xs text-gray-500 mb-4">
                              <div className="flex justify-between">
                                <span>Token ID</span>
                                <span className="font-mono">#{trademark.tokenId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Category</span>
                                <span>{trademark.category}</span>
                              </div>
                            </div>

                            <Link
                              href={`/trademark/${trademark.id}`}
                              className="block w-full px-4 py-2 bg-gray-900 text-white text-center rounded-xl font-medium hover:bg-gray-800 transition-all"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Marketplace Activity Tab */}
              {activeTab === 'marketplace' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Marketplace Activity</h2>
                    <p className="text-gray-600">Recent listings, sales, and verifications</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
                    {marketplaceActivity.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                        <p className="text-gray-600">
                          Marketplace activities will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {marketplaceActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                activity.type === 'listing' ? 'bg-blue-100' :
                                activity.type === 'sale' ? 'bg-green-100' :
                                'bg-purple-100'
                              }`}>
                                {activity.type === 'listing' && (
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                )}
                                {activity.type === 'sale' && (
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                )}
                                {activity.type === 'verification' && (
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {activity.type === 'listing' && 'New Listing'}
                                  {activity.type === 'sale' && 'Sale Completed'}
                                  {activity.type === 'verification' && 'Trademark Verified'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {activity.trademarkName}
                                  {activity.price && ` • ${activity.price}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
