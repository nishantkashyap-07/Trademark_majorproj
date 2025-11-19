import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkBadge from '@/components/TrademarkBadge';
import { TrademarkMetadata } from '@/types';

// Mock trademark data
const mockTrademark: TrademarkMetadata = {
  tokenId: 1,
  creatorAddress: '0x1234567890123456789012345678901234567890',
  companyName: 'TechCorp Inc.',
  trademarkName: 'TechLogo',
  registrationNumber: 'TM001234',
  category: 'Technology',
  description: 'Innovative technology company logo and brand identity representing cutting-edge solutions in the digital space. This trademark encompasses our complete visual identity including logo, wordmark, and brand colors.',
  ipfsHash: 'QmExample1',
  royaltyPercentage: 10,
  createdAt: new Date('2024-01-15'),
  transactionHash: '0xabc123def456789',
  verified: true,
};

export default function TrademarkDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'verification'>('details');

  const trademark = mockTrademark; // In real app, fetch based on id

  return (
    <>
      <Head>
        <title>{trademark.trademarkName} - TrademarkChain</title>
        <meta name="description" content={trademark.description} />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/marketplace" className="hover:text-blue-600">Marketplace</Link>
            <span>/</span>
            <span className="text-gray-900">{trademark.trademarkName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-12">
                  <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-8xl font-bold text-blue-600">
                      {trademark.trademarkName.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="font-medium">Share</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="font-medium">Save</span>
                </button>
              </div>
            </div>

            {/* Right Column - Details */}
            <div>
              {/* Header */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Link href={`/marketplace?category=${trademark.category}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        {trademark.category}
                      </Link>
                      <TrademarkBadge
                        verified={trademark.verified}
                        trademarkId={trademark.tokenId}
                        companyName={trademark.companyName}
                      />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {trademark.trademarkName}
                    </h1>
                    <p className="text-lg text-gray-600">
                      by {trademark.companyName}
                    </p>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Owned by</div>
                    <div className="font-mono text-sm font-medium text-gray-900">
                      {trademark.creatorAddress.slice(0, 10)}...{trademark.creatorAddress.slice(-8)}
                    </div>
                  </div>
                  <button className="ml-auto p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'history'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab('verification')}
                    className={`flex-1 px-6 py-4 font-medium transition-colors ${
                      activeTab === 'verification'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Verification
                  </button>
                </div>

                <div className="p-6">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                        <p className="text-gray-900">{trademark.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Registration Number</h3>
                          <p className="font-mono text-gray-900">{trademark.registrationNumber}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Token ID</h3>
                          <p className="font-mono text-gray-900">#{trademark.tokenId}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Royalty</h3>
                          <p className="text-gray-900">{trademark.royaltyPercentage}%</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Registered</h3>
                          <p className="text-gray-900">{trademark.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">IPFS Hash</h3>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm text-gray-900 flex-1 truncate">{trademark.ipfsHash}</p>
                          <a
                            href={`https://ipfs.io/ipfs/${trademark.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">Trademark Registered</span>
                            <span className="text-sm text-gray-500">{trademark.createdAt.toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Registered by {trademark.creatorAddress.slice(0, 10)}...
                          </p>
                        </div>
                      </div>

                      {trademark.verified && (
                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">Trademark Verified</span>
                              <span className="text-sm text-gray-500">2 days ago</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Verified by TrademarkChain
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Tab */}
                  {activeTab === 'verification' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold text-green-900">Blockchain Verified</span>
                        </div>
                        <p className="text-sm text-green-800">
                          This trademark is registered on Polygon blockchain and verified by smart contract.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Blockchain Details</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Contract Address</span>
                            <a href="#" className="text-sm font-mono text-blue-600 hover:text-blue-700">
                              0x1234...5678
                            </a>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Token Standard</span>
                            <span className="text-sm font-medium text-gray-900">ERC-721</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Blockchain</span>
                            <span className="text-sm font-medium text-gray-900">Polygon</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Transaction Hash</span>
                            <a href="#" className="text-sm font-mono text-blue-600 hover:text-blue-700">
                              {trademark.transactionHash.slice(0, 10)}...
                            </a>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                        View on Polygonscan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}