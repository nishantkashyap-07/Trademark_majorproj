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
        <title>Marketplace - SloganChain</title>
        <meta
          name="description"
          content="Browse and verify blockchain-registered trademarks secured on Polygon with IPFS-backed assets."
        />
      </Head>

      <Navbar />

        <main className="min-h-screen bg-white">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gray-950 text-white py-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-transparent blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/30 via-cyan-400/10 to-transparent blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gray-400">
                    Marketplace
                  </p>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
                    Explore on-chain trademarks
                  </h1>
                  <p className="max-w-xl text-sm md:text-base text-gray-300">
                    Discover IP assets registered on SloganChain. Every listing is backed by verifiable Polygon
                    ownership and IPFS-stored content.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 text-xs text-gray-300 md:items-end">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live demo data – no gas required
                  </div>
                  <div className="flex flex-wrap gap-3 md:justify-end">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                      Polygon • ERC-721 • EIP-2981
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-gray-200">
                      IPFS-backed assets
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-6xl px-4 py-10">
          
          <Breadcrumbs />

          {/* Filters and Search */}
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
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
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show verified only</span>
                </label>
                
                <div className="text-xs text-gray-500">
                  Showing {filteredTrademarks.length} of {trademarks.length} trademarks
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

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
          <section className="mt-14 rounded-2xl border border-gray-200 bg-white px-6 py-6 text-sm text-gray-800">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">
                  Marketplace Snapshot
                </p>
                <p className="text-sm text-gray-600">
                  High-level metrics from the current demo dataset.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 mb-1">Total Trademarks</p>
                <p className="text-xl font-semibold text-gray-900">{trademarks.length}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 mb-1">Verified</p>
                <p className="text-xl font-semibold text-gray-900">{trademarks.filter(tm => tm.verified).length}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 mb-1">Categories</p>
                <p className="text-xl font-semibold text-gray-900">{new Set(trademarks.map(tm => tm.category)).size}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 mb-1">Unique Owners</p>
                <p className="text-xl font-semibold text-gray-900">{new Set(trademarks.map(tm => tm.creatorAddress)).size}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}