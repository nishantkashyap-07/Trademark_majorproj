import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { DEFAULT_CHAIN } from '@/utils/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryGrid from '@/components/CategoryGrid';
import TrademarkCard from '@/components/TrademarkCard';
import { TrademarkMetadata } from '@/types';

import { demoTrademarks, demoStats } from '@/lib/demo-data';

// Use demo data for presentation
const trendingTrademarks = demoTrademarks.slice(0, 4);

export default function Home() {
  const router = useRouter();
  const { account, chainId, isConnected, isLoading, connect, disconnect, switchNetwork } = useWeb3();
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleConnect = async () => {
    try {
      setError('');
      await connect();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isCorrectNetwork = chainId === DEFAULT_CHAIN.chainId;

  return (
    <>
      <Head>
        <title>TrademarkChain - Blockchain Trademark Verification</title>
        <meta name="description" content="Discover, register, and verify trademarks on the blockchain. Secure your brand with decentralized trademark protection." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-os-dark-bg">
        {/* Hero Section - OpenSea Style with Featured Collection */}
        <div className="relative overflow-hidden">
          {/* Featured Banner */}
          <div className="relative h-[400px] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="relative max-w-[1920px] mx-auto px-6 h-full flex items-center">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  Discover, Register & Verify
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-2">
                    Blockchain Trademarks
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  The world's first decentralized trademark verification platform. 
                  Secure your brand with immutable on-chain records.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/marketplace" className="inline-flex items-center px-8 py-3.5 bg-os-dark-accent hover:bg-os-dark-accent-hover text-white text-base font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                    Explore Trademarks
                  </Link>
                  <Link href="/register" className="inline-flex items-center px-8 py-3.5 bg-transparent hover:bg-white hover:bg-opacity-10 text-white text-base font-semibold rounded-xl transition-all border-2 border-white border-opacity-30 hover:border-opacity-50">
                    Register Trademark
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-os-dark-bg-secondary border-y border-os-dark-border">
            <div className="max-w-[1920px] mx-auto px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-os-dark-text">{demoStats.overview.totalTrademarks}</div>
                  <div className="text-sm text-os-dark-text-secondary mt-1">Trademarks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-os-dark-text">{demoStats.overview.verifiedTrademarks}</div>
                  <div className="text-sm text-os-dark-text-secondary mt-1">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-os-dark-text">{demoStats.overview.totalUsers}</div>
                  <div className="text-sm text-os-dark-text-secondary mt-1">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-os-dark-text">{demoStats.overview.totalCategories}</div>
                  <div className="text-sm text-os-dark-text-secondary mt-1">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Trademarks - OpenSea Style */}
        <div className="max-w-[1920px] mx-auto px-6 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-os-dark-text mb-2">
                Trending Trademarks
              </h2>
              <p className="text-base text-os-dark-text-secondary">
                Recently verified and registered trademarks
              </p>
            </div>
            <Link href="/marketplace" className="text-os-dark-accent hover:text-os-dark-accent-hover font-semibold flex items-center transition-colors">
              View all
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingTrademarks.map((trademark) => (
              <TrademarkCard key={trademark.tokenId} trademark={trademark} />
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-os-dark-bg-secondary border-y border-os-dark-border py-16">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-os-dark-text mb-2">
                Browse by Category
              </h2>
              <p className="text-base text-os-dark-text-secondary">
                Explore trademarks across different industries
              </p>
            </div>
            <CategoryGrid />
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-[1920px] mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-os-dark-text mb-4">
              How It Works
            </h2>
            <p className="text-base text-os-dark-text-secondary">
              Three simple steps to protect your brand on the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-os-dark-bg-secondary border border-os-dark-border rounded-2xl p-8 hover:border-os-dark-accent transition-all">
              <div className="w-16 h-16 bg-gradient-opensea rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-os-dark-text mb-3">Register Trademark</h3>
              <p className="text-os-dark-text-secondary">
                Upload your trademark documents and logo. Our system stores them securely on IPFS and mints an NFT as proof of ownership.
              </p>
            </div>

            <div className="bg-os-dark-bg-secondary border border-os-dark-border rounded-2xl p-8 hover:border-os-dark-accent transition-all">
              <div className="w-16 h-16 bg-gradient-opensea rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-os-dark-text mb-3">Blockchain Verification</h3>
              <p className="text-os-dark-text-secondary">
                Your trademark is recorded on Polygon blockchain with immutable ownership records that anyone can verify in real-time.
              </p>
            </div>

            <div className="bg-os-dark-bg-secondary border border-os-dark-border rounded-2xl p-8 hover:border-os-dark-accent transition-all">
              <div className="w-16 h-16 bg-gradient-opensea rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-os-dark-text mb-3">Protect & Display</h3>
              <p className="text-os-dark-text-secondary">
                Display verified badges on your products. Prevent unauthorized usage with automated ownership checks during registration.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Protect Your Brand?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of companies securing their trademarks on the blockchain
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {isConnected ? (
                <>
                  <Link href="/register" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg">
                    Register Your Trademark
                  </Link>
                  <Link href="/dashboard" className="inline-flex items-center px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  </svg>
                  Connect Wallet to Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}