import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import { demoSlogans, demoStats } from '@/lib/demo-data';

export default function Home() {
  const { isConnected, connect } = useWeb3();
  const [stats] = useState(demoStats);
  const [featuredSlogans] = useState(demoSlogans.slice(0, 8));

  return (
    <>
      <Head>
        <title>TrademarkChain - Blockchain IP Protection</title>
        <meta name="description" content="Decentralized trademark registration and verification on Polygon blockchain with IPFS storage" />
      </Head>

      <div className="min-h-screen bg-gray-950">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white py-24">
          <div className="relative max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-xs text-blue-400 mb-6">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  REAL-TIME IP PROTECTION ON POLYGON
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Own your ideas.
                  <br />
                  <span className="text-blue-400">Prove it on-chain.</span>
                </h1>

                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                  TrademarkChain turns your trademarks into verifiable on-chain assets. Register once, prove ownership anywhere, and unlock new revenue through a compliant IP marketplace.
                </p>

                {isConnected ? (
                  <div className="flex gap-4">
                    <Link
                      href="/register"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-600/20"
                    >
                      Register Trademark
                    </Link>
                    <Link
                      href="/marketplace"
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium transition border border-gray-700"
                    >
                      View Marketplace
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={connect}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-600/20"
                  >
                    Connect Wallet to Get Started
                  </button>
                )}

                <div className="flex items-center gap-6 mt-8 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Audited smart contracts
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    IPFS + Polygon powered
                  </div>
                </div>
              </div>

              {/* Right Stats Card */}
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Snapshot</p>
                    <p className="text-xs text-gray-500 mt-1">Demo network metrics</p>
                  </div>
                  <span className="px-3 py-1 bg-green-600/10 border border-green-600/20 rounded-full text-xs text-green-400">
                    Testnet
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-950/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Registered IP</p>
                    <p className="text-3xl font-bold text-white">{stats.overview.totalSlogans}</p>
                    <p className="text-xs text-gray-500 mt-1">Trademarks tokenized</p>
                  </div>
                  <div className="bg-gray-950/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Verified Assets</p>
                    <p className="text-3xl font-bold text-white">{stats.overview.verifiedSlogans}</p>
                    <p className="text-xs text-gray-500 mt-1">On-chain proofs</p>
                  </div>
                  <div className="bg-gray-950/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Users</p>
                    <p className="text-3xl font-bold text-white">{stats.overview.totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1">Creators & buyers</p>
                  </div>
                  <div className="bg-gray-950/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Verification Rate</p>
                    <p className="text-3xl font-bold text-white">{stats.overview.verificationRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">Instant checks</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800 text-xs text-gray-500">
                  <span>Academic project demo</span>
                  <span>Polygon • IPFS • EIP-2981</span>
                </div>
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
              <h2 className="text-3xl font-bold text-white">Recent Trademarks</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSlogans.map((slogan) => (
                <TrademarkCard key={slogan.tokenId} trademark={slogan} />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
