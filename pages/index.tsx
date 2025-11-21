import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { demoSlogans, demoStats } from '@/lib/demo-data';

export default function Home() {
  const { isConnected, connect } = useWeb3();
  const [stats] = useState(demoStats);
  const [featuredSlogans] = useState(demoSlogans.slice(0, 8));

  return (
    <>
      <Head>
        <title>SloganChain - Enterprise Blockchain IP Protection Platform</title>
        <meta name="description" content="Enterprise-grade platform for registering, verifying, and trading slogans as intellectual property NFTs on Polygon blockchain with IPFS storage" />
      </Head>

      <KeyboardShortcuts />

      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-32">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-block mb-8 px-8 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full">
                <span className="text-sm font-semibold tracking-wide">ENTERPRISE BLOCKCHAIN IP PROTECTION</span>
              </div>
              <p>Heheh</p>
              
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                Protect Your Brand
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-3">
                  With Blockchain Technology
                </span>
              </h1>
              
              <p className="text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
                Professional-grade platform for registering, verifying, and managing slogans as NFT-based intellectual property. 
                Leveraging Polygon blockchain for immutable ownership records, IPFS for decentralized storage, and smart contracts for automated royalty distribution.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                {isConnected ? (
                  <>
                    <Link href="/register" className="px-12 py-5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl text-lg">
                      Register Slogan
                    </Link>
                    <Link href="/marketplace" className="px-12 py-5 bg-transparent text-white rounded-xl font-bold border-2 border-white hover:bg-white hover:text-gray-900 transition-all text-lg">
                      Explore Marketplace
                    </Link>
                  </>
                ) : (
                  <button onClick={connect} className="px-12 py-5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl text-lg">
                    Connect Wallet to Begin
                  </button>
                )}
              </div>

              {/* Platform Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="text-5xl font-bold mb-3">{stats.overview.totalSlogans}</div>
                  <div className="text-sm text-gray-300 font-medium">Registered Slogans</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="text-5xl font-bold mb-3">{stats.overview.verifiedSlogans}</div>
                  <div className="text-sm text-gray-300 font-medium">Verified Assets</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="text-5xl font-bold mb-3">{stats.overview.totalUsers}</div>
                  <div className="text-sm text-gray-300 font-medium">Active Users</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="text-5xl font-bold mb-3">{stats.overview.verificationRate}%</div>
                  <div className="text-sm text-gray-300 font-medium">Verification Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                  Enterprise-Grade IP Management System
                </h2>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Built on cutting-edge blockchain technology with comprehensive features for intellectual property protection, 
                  verification, and monetization. Our platform combines security, transparency, and efficiency.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-10 mb-20">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-10 shadow-lg">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-5">Blockchain Security</h3>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    Immutable ownership records on Polygon blockchain ensure permanent, tamper-proof verification. 
                    Each slogan is minted as an ERC-721 NFT with complete metadata and provenance tracking.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Immutable Records</p>
                        <p className="text-sm text-gray-600">Permanent on-chain ownership proof</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Smart Contract Automation</p>
                        <p className="text-sm text-gray-600">Automated verification and transfers</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Transparent History</p>
                        <p className="text-sm text-gray-600">Complete transaction audit trail</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-10 shadow-lg">
                  <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-5">IPFS Storage</h3>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    Decentralized storage on IPFS ensures permanent availability of trademark assets and metadata. 
                    Content-addressed storage guarantees data integrity and censorship resistance.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Decentralized Storage</p>
                        <p className="text-sm text-gray-600">No single point of failure</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Content Addressing</p>
                        <p className="text-sm text-gray-600">Cryptographic verification of data</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Permanent Availability</p>
                        <p className="text-sm text-gray-600">Assets remain accessible forever</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-10 shadow-lg">
                  <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-5">NFT Marketplace</h3>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    ERC-721 NFTs with ERC-2981 royalty standard enable secure ownership transfer and automated royalty distribution. 
                    Built-in marketplace for trading intellectual property rights.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Transferable Rights</p>
                        <p className="text-sm text-gray-600">Secure ownership transfers</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Automated Royalties</p>
                        <p className="text-sm text-gray-600">ERC-2981 standard implementation</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Marketplace Integration</p>
                        <p className="text-sm text-gray-600">Built-in trading platform</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Slogans */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Slogans</h2>
                  <p className="text-lg text-gray-600">Recently registered and verified intellectual property</p>
                </div>
                <Link href="/marketplace" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSlogans.map((slogan) => (
                  <TrademarkCard key={slogan.tokenId} trademark={slogan} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                  Comprehensive Feature Set
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Everything you need to protect, manage, and monetize your intellectual property
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Registration System</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Streamlined registration process with multi-step verification, file upload support, and instant blockchain minting.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Verification</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Real-time verification system allowing anyone to verify trademark authenticity and ownership through blockchain queries.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Marketplace Trading</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Integrated marketplace for buying, selling, and licensing intellectual property with automated royalty distribution.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Comprehensive dashboard with portfolio tracking, market analytics, and detailed transaction history.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Contracts</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Audited smart contracts handling registration, transfers, and royalty payments with complete transparency.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">API Integration</h3>
                  <p className="text-gray-600 leading-relaxed">
                    RESTful API for integrating trademark verification into your existing applications and workflows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-bold mb-6">Technical Specifications</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Built with industry-leading technologies and best practices
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <h3 className="text-2xl font-bold mb-4">Blockchain</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Polygon Network</li>
                    <li>• ERC-721 NFT Standard</li>
                    <li>• ERC-2981 Royalties</li>
                    <li>• Solidity Smart Contracts</li>
                    <li>• Hardhat Development</li>
                  </ul>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <h3 className="text-2xl font-bold mb-4">Storage</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li>• IPFS Decentralized Storage</li>
                    <li>• Pinata Cloud Service</li>
                    <li>• Content Addressing</li>
                    <li>• Metadata Standards</li>
                    <li>• Asset Permanence</li>
                  </ul>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <h3 className="text-2xl font-bold mb-4">Frontend</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Next.js Framework</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Ethers.js Integration</li>
                    <li>• Responsive Design</li>
                  </ul>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                  <h3 className="text-2xl font-bold mb-4">Backend</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li>• Firebase Database</li>
                    <li>• RESTful API</li>
                    <li>• Real-time Sync</li>
                    <li>• Authentication</li>
                    <li>• Cloud Functions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl md:text-6xl font-bold mb-8">
                Ready to Protect Your Brand?
              </h2>
              <p className="text-2xl mb-12 text-gray-100">
                Join thousands of businesses securing their intellectual property on the blockchain
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/register" className="px-12 py-5 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-2xl text-lg">
                  Register Your Slogan
                </Link>
                <Link href="/marketplace" className="px-12 py-5 bg-transparent text-white rounded-xl font-bold border-2 border-white hover:bg-white hover:text-purple-600 transition-all text-lg">
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
