import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import LoadingSpinner from '@/components/LoadingSpinner';
import { TrademarkMetadata } from '@/types';
import { TRADEMARK_CATEGORIES } from '@/utils/constants';

import { demoTrademarks } from '@/lib/demo-data';

// Use demo data for presentation
const mockTrademarks = demoTrademarks;

export default function Marketplace() {
  const router = useRouter();
  const { isConnected, connect } = useWeb3();
  
  const [trademarks, setTrademarks] = useState<TrademarkMetadata[]>(mockTrademarks);
  const [filteredTrademarks, setFilteredTrademarks] = useState<TrademarkMetadata[]>(mockTrademarks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get search query from URL
  useEffect(() => {
    if (router.query.search) {
      setSearchTerm(router.query.search as string);
    }
    if (router.query.category) {
      setSelectedCategory(router.query.category as string);
    }
  }, [router.query]);

  // Filter and sort trademarks
  useEffect(() => {
    let filtered = [...trademarks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tm =>
        tm.sloganText.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        filtered.sort((a, b) => a.sloganText.localeCompare(b.sloganText));
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
          
          <Breadcrumbs />

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

            {/* Additional Filters and View Toggle */}
            <div className="flex items-center justify-between">
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

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Trademark Grid/List */}
          {isLoading ? (
            <LoadingSpinner text="Loading trademarks..." />
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
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredTrademarks.map((trademark) => (
                <TrademarkCard key={trademark.tokenId} trademark={trademark} viewMode={viewMode} />
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

          {/* Advanced Filtering Options */}
          <div className="mt-16 bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Advanced Search & Filtering
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Date Range
                </label>
                <div className="flex gap-2">
                  <input type="date" className="input-field flex-1" placeholder="From" />
                  <input type="date" className="input-field flex-1" placeholder="To" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select className="input-field">
                  <option value="">All Status</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Verification</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Type
                </label>
                <select className="input-field">
                  <option value="">All Owners</option>
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}