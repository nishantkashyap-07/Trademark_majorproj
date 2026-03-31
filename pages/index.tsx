import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import SplineBackground from '@/components/SplineBackground';
import { demoStats } from '@/lib/demo-data';
import { SloganMetadata } from '@/types';

export default function Home() {
  const { isConnected, connect } = useWeb3();
  const [stats, setStats] = useState(demoStats);
  const [featuredSlogans, setFeaturedSlogans] = useState<SloganMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }

        // Fetch recent trademarks (using limitCount parameter)
        const trademarksRes = await fetch('/api/trademarks?limitCount=8&sortBy=createdAt&order=desc');
        if (trademarksRes.ok) {
          const trademarksData = await trademarksRes.json();
          if (trademarksData.success) {
            setFeaturedSlogans(trademarksData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>TrademarkChain - Blockchain IP Protection</title>
        <meta name="description" content="Decentralized trademark registration and verification on Polygon blockchain with IPFS storage" />
      </Head>

      <div className="min-h-screen bg-gray-950">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white min-h-screen flex items-center">
          {/* Spline 3D Background - Full Visibility */}
          <SplineBackground 
            opacity={100}
            showGradient={true}
            gradientDirection="right"
            gradientOpacity={98}
          />

          {/* Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content - More Prominent */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300 backdrop-blur-md">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  REAL-TIME IP PROTECTION ON POLYGON
                </div>

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                  Own your ideas.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">
                    Prove it on-chain.
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl">
                  TrademarkChain turns your trademarks into verifiable on-chain assets. Register once, prove ownership anywhere, and unlock new revenue through a compliant IP marketplace.
                </p>

                {isConnected ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/register"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition shadow-2xl shadow-blue-600/30 backdrop-blur-sm"
                    >
                      Register Trademark
                    </Link>
                    <Link
                      href="/marketplace"
                      className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg rounded-xl hover:bg-white/20 font-semibold transition border border-white/20"
                    >
                      View Marketplace
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={connect}
                    className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition shadow-2xl shadow-blue-600/30 backdrop-blur-sm"
                  >
                    Connect Wallet to Get Started
                  </button>
                )}

                <div className="flex items-center gap-8 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Audited smart contracts
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full" />
                    IPFS + Polygon powered
                  </div>
                </div>
              </div>

              {/* Right Stats Card - Larger and More Transparent */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Live Snapshot</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {loading ? 'Loading...' : 'Real-time network metrics'}
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-300 font-medium flex items-center gap-2">
                    {!loading && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                    Live
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Registered IP</p>
                        <p className="text-5xl font-bold text-white mb-2">
                          {stats.overview.totalTrademarks || stats.overview.totalSlogans || 0}
                        </p>
                        <p className="text-sm text-gray-400">Trademarks tokenized</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Verified Assets</p>
                        <p className="text-5xl font-bold text-white mb-2">
                          {stats.overview.verifiedTrademarks || stats.overview.verifiedSlogans || 0}
                        </p>
                        <p className="text-sm text-gray-400">On-chain proofs</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Active Users</p>
                        <p className="text-5xl font-bold text-white mb-2">
                          {stats.overview.totalUsers || 0}
                        </p>
                        <p className="text-sm text-gray-400">Creators & buyers</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Verification Rate</p>
                        <p className="text-5xl font-bold text-white mb-2">
                          {stats.overview.verificationRate || '0'}%
                        </p>
                        <p className="text-sm text-gray-400">Instant checks</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10 text-sm text-gray-400">
                      <span>Real-time data from Firebase</span>
                      <span>Polygon • IPFS • EIP-2981</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-950">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">1. Register</h3>
                <p className="text-sm text-gray-400">
                  Upload trademark details. System stores on IPFS and mints ERC-721 NFT on Polygon.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/10 border border-green-600/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">2. Verify</h3>
                <p className="text-sm text-gray-400">
                  Instant blockchain verification. Immutable proof of ownership on-chain.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/10 border border-purple-600/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">3. Trade</h3>
                <p className="text-sm text-gray-400">
                  List on marketplace. Smart contracts handle payments and royalties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Trademarks */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white">Recent Trademarks</h2>
                <p className="text-sm text-gray-400 mt-2">
                  {loading ? 'Loading...' : `${featuredSlogans.length} trademarks available`}
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition flex items-center gap-2"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              </div>
            ) : featuredSlogans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSlogans.map((slogan) => (
                  <TrademarkCard key={slogan.tokenId} trademark={slogan} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Trademarks Yet</h3>
                <p className="text-gray-400 mb-6">Be the first to register a trademark on the blockchain!</p>
                {isConnected && (
                  <Link
                    href="/register"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Register First Trademark
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
