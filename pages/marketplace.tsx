import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import { TrademarkMetadata } from '@/types';
import { TRADEMARK_CATEGORIES } from '@/utils/constants';

import { demoTrademarks } from '@/lib/demo-data';

// Use demo data for presentation
const mockTrademarks = demoTrademarks;

export default function Marketplace() {
  const { isConnected, connect } = useWeb3();
  
  const [trademarks, setTrademarks] = useState<TrademarkMetadata[]>(mockTrademarks);
  const [filteredTrademarks, setFilteredTrademarks] = useState<TrademarkMetadata[]>(mockTrademarks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort trademarks
  useEffect(() => {
    let filtered = [...trademarks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tm =>
        tm.trademarkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tm.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tm.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(tm => tm.category === selectedCategory);
    }

    // Apply verification filter
    if (showVerifiedOnly) {
      filtered = filtered.filter(tm => tm.verified);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.trademarkName.localeCompare(b.trademarkName));
        break;
      case 'company':
        filtered.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
    }

    setFilteredTrademarks(filtered);
  }, [trademarks, searchTerm, selectedCategory, sortBy, showVerifiedOnly]);

  const handleTrademarkClick = (tokenId: number) => {
    // In a real app, this would show trademark details or verification info
    console.log('Trademark clicked:', tokenId);
  };

  return (
    <>
      <Head>
        <title>Explore Trademarks - TrademarkChain</title>
        <meta name="description" content="Browse and verify blockchain-registered trademarks across all industries" />
      </Head>

      <Navbar />

        <main className="min-h-screen bg-white">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Explore Trademarks
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover and verify blockchain-registered trademarks. Each trademark is secured with 
                  immutable on-chain records and IPFS-stored assets.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Trademarks
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, company, or description..."
                    className="input-field pl-10"
                  />
                  <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {TRADEMARK_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Trademark Name</option>
                  <option value="company">Company Name</option>
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show verified only</span>
              </label>
              
              <div className="text-sm text-gray-600">
                Showing {filteredTrademarks.length} of {trademarks.length} trademarks
              </div>
            </div>
          </div>

          {/* Trademark Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading trademarks...</p>
            </div>
          ) : filteredTrademarks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trademarks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTrademarks.map((trademark) => (
                <TrademarkCard key={trademark.tokenId} trademark={trademark} />
              ))}
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Marketplace Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {trademarks.length}
                </div>
                <div className="text-sm text-gray-600">Total Trademarks</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {trademarks.filter(tm => tm.verified).length}
                </div>
                <div className="text-sm text-gray-600">Verified Trademarks</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Set(trademarks.map(tm => tm.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {new Set(trademarks.map(tm => tm.creatorAddress)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Owners</div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How Trademark Verification Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Blockchain Registration
                </h3>
                <p className="text-gray-600">
                  Trademarks are registered as NFTs on Polygon blockchain with immutable ownership records.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  IPFS Storage
                </h3>
                <p className="text-gray-600">
                  Trademark assets and metadata are stored on IPFS for decentralized, permanent access.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Instant Verification
                </h3>
                <p className="text-gray-600">
                  Anyone can instantly verify trademark authenticity and ownership through smart contracts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}