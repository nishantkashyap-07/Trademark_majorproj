import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LicenseCard from '@/components/LicenseCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import LoadingSpinner from '@/components/LoadingSpinner';
import { License } from '@/types';
import { getLicensesForToken, getOwnerTrademarks } from '@/utils/contracts';

export default function LicensesPage() {
  const { account, isConnected, connect } = useWeb3();
  const [myLicenses, setMyLicenses] = useState<License[]>([]);
  const [grantedLicenses, setGrantedLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'purchased' | 'granted'>('purchased');

  useEffect(() => {
    if (isConnected && account) {
      loadLicenses();
    }
  }, [isConnected, account]);

  const loadLicenses = async () => {
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Get user's owned trademarks
      const ownedTokenIds = await getOwnerTrademarks(account);
      
      // Get all licenses for owned trademarks
      const allGrantedLicenses: License[] = [];
      for (const tokenId of ownedTokenIds) {
        const licenses = await getLicensesForToken(tokenId);
        allGrantedLicenses.push(...licenses);
      }
      
      // Filter licenses granted by this user
      const granted = allGrantedLicenses.filter(
        (license) => license.licensor.toLowerCase() === account.toLowerCase()
      );
      setGrantedLicenses(granted);
      
      // Get licenses purchased by this user
      // We need to check all tokens - in production, this would be indexed
      const purchased = allGrantedLicenses.filter(
        (license) => license.licensee.toLowerCase() === account.toLowerCase()
      );
      setMyLicenses(purchased);
      
    } catch (error) {
      console.error('Error loading licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>My Licenses - TrademarkChain</title>
        </Head>

        <Navbar />

        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view and manage your licenses
            </p>
            <button onClick={connect} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
              Connect Wallet
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Licenses - TrademarkChain</title>
        <meta name="description" content="Manage your trademark licenses" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                My Licenses
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Manage your purchased licenses and track licenses you've granted to others
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Purchased Licenses</p>
                  <p className="text-3xl font-bold text-gray-900">{myLicenses.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Granted Licenses</p>
                  <p className="text-3xl font-bold text-gray-900">{grantedLicenses.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Licenses</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {[...myLicenses, ...grantedLicenses].filter(l => l.active && (l.expiresAt === 0 || l.expiresAt > Date.now() / 1000)).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('purchased')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'purchased'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Purchased Licenses
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {myLicenses.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('granted')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'granted'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Granted Licenses
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                  {grantedLicenses.length}
                </span>
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <LoadingSpinner text="Loading licenses..." />
          ) : (
            <div>
              {activeTab === 'purchased' && (
                <div>
                  {myLicenses.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-gray-200">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No licenses purchased yet</h3>
                      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Browse the marketplace to find trademarks available for licensing
                      </p>
                      <Link
                        href="/marketplace"
                        className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                      >
                        Browse Marketplace
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myLicenses.map((license) => (
                        <LicenseCard
                          key={`${license.tokenId}-${license.licenseId}`}
                          license={license}
                          trademarkName={`Trademark #${license.tokenId}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'granted' && (
                <div>
                  {grantedLicenses.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-gray-200">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No licenses granted yet</h3>
                      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Create license listings for your trademarks to start earning
                      </p>
                      <Link
                        href="/dashboard"
                        className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {grantedLicenses.map((license) => (
                        <LicenseCard
                          key={`${license.tokenId}-${license.licenseId}`}
                          license={license}
                          trademarkName={`Trademark #${license.tokenId}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Trademark Licensing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">For Licensees</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Use trademarks without buying the NFT</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Blockchain-verified license records</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Flexible terms and durations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Transferable license rights</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">For Licensors</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Retain NFT ownership while earning</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Multiple licenses from same trademark</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Set your own pricing and terms</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Automatic payment distribution</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
