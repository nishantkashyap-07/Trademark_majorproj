import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import { apiClient } from '@/lib/api-client';

interface PendingTrademark {
  id: string;
  tokenId: number;
  companyName: string;
  trademarkName: string;
  registrationNumber: string;
  category: string;
  creatorAddress: string;
  createdAt: Date;
  ipfsHash: string;
  verified: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { account, isConnected } = useWeb3();
  const [pendingTrademarks, setPendingTrademarks] = useState<PendingTrademark[]>([]);
  const [verifiedTrademarks, setVerifiedTrademarks] = useState<PendingTrademark[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'reports'>('pending');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedTrademark, setSelectedTrademark] = useState<PendingTrademark | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Admin addresses (in production, this should be in environment variables)
  const ADMIN_ADDRESSES = [
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
  ].filter(Boolean);

  const isAdmin = isConnected && account && ADMIN_ADDRESSES.includes(account.toLowerCase());

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    if (isConnected && !isAdmin) {
      setToast({ message: 'Access denied. Admin privileges required.', type: 'error' });
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    loadTrademarks();
    loadReports();
  }, [isConnected, isAdmin, router]);

  const loadTrademarks = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getTrademarks();
      if (response.success && response.data) {
        const trademarks = response.data as PendingTrademark[];
        setPendingTrademarks(trademarks.filter(tm => !tm.verified));
        setVerifiedTrademarks(trademarks.filter(tm => tm.verified));
      }
    } catch (error) {
      console.error('Error loading trademarks:', error);
      setToast({ message: 'Failed to load trademarks', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?adminAddress=${account}&status=pending`);
      const data = await response.json();
      if (data.success) {
        setReports(data.data || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleVerify = async (trademarkId: string, tokenId: number) => {
    try {
      const response = await fetch('/api/admin/verify-trademark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trademarkId, tokenId, adminAddress: account }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Trademark verified successfully!', type: 'success' });
        loadTrademarks();
        setSelectedTrademark(null);
      } else {
        setToast({ message: data.error || 'Verification failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error verifying trademark:', error);
      setToast({ message: 'Failed to verify trademark', type: 'error' });
    }
  };

  const handleReject = async (trademarkId: string) => {
    try {
      const response = await fetch('/api/admin/reject-trademark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trademarkId, adminAddress: account }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Trademark rejected', type: 'info' });
        loadTrademarks();
        setSelectedTrademark(null);
      } else {
        setToast({ message: data.error || 'Rejection failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting trademark:', error);
      setToast({ message: 'Failed to reject trademark', type: 'error' });
    }
  };

  const handleResolveReport = async (reportId: string, status: string, resolution: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, resolution, adminAddress: account }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Report resolved successfully', type: 'success' });
        loadReports();
        setSelectedReport(null);
      } else {
        setToast({ message: data.error || 'Failed to resolve report', type: 'error' });
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      setToast({ message: 'Failed to resolve report', type: 'error' });
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Checking admin access..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - TrademarkChain</title>
      </Head>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage trademark verifications and platform oversight</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingTrademarks.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified</p>
                  <p className="text-3xl font-bold text-green-600">{verifiedTrademarks.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Reports</p>
                  <p className="text-3xl font-bold text-red-600">{reports.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Trademarks</p>
                  <p className="text-3xl font-bold text-blue-600">{pendingTrademarks.length + verifiedTrademarks.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'pending'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Pending Review ({pendingTrademarks.length})
                </button>
                <button
                  onClick={() => setActiveTab('verified')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'verified'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Verified ({verifiedTrademarks.length})
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'reports'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Reports ({reports.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner text="Loading data..." />
              ) : activeTab === 'reports' ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-red-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900 capitalize">{report.type} Report</h3>
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full capitalize">
                              {report.targetType}
                            </span>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full capitalize">
                              {report.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Target ID:</span>
                              <p className="font-mono text-gray-900">{report.targetId}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Reason:</span>
                              <p className="text-gray-900">{report.reason}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Reported:</span>
                              <p className="text-gray-900">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {report.description && (
                            <div className="mt-3">
                              <span className="text-gray-500 text-sm">Description:</span>
                              <p className="text-sm text-gray-900 mt-1">{report.description}</p>
                            </div>
                          )}

                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">Reporter:</span>
                            <p className="font-mono text-sm text-gray-900">
                              {report.reporterAddress?.slice(0, 10)}...{report.reporterAddress?.slice(-8)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reports.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reports</h3>
                      <p className="mt-1 text-sm text-gray-500">All reports have been reviewed</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'pending' ? pendingTrademarks : verifiedTrademarks).map((trademark) => (
                    <div
                      key={trademark.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{trademark.trademarkName}</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              {trademark.category}
                            </span>
                            {trademark.verified && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Company:</span>
                              <p className="font-semibold text-gray-900">{trademark.companyName}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Registration #:</span>
                              <p className="font-mono text-gray-900">{trademark.registrationNumber}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Token ID:</span>
                              <p className="font-mono text-gray-900">#{trademark.tokenId}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <p className="text-gray-900">
                                {new Date(trademark.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">Owner:</span>
                            <p className="font-mono text-sm text-gray-900">
                              {trademark.creatorAddress.slice(0, 10)}...{trademark.creatorAddress.slice(-8)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setSelectedTrademark(trademark)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View Details
                          </button>
                          {!trademark.verified && (
                            <>
                              <button
                                onClick={() => handleVerify(trademark.id, trademark.tokenId)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleReject(trademark.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {(activeTab === 'pending' ? pendingTrademarks : verifiedTrademarks).length === 0 && (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No trademarks</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'pending' ? 'No pending trademarks to review' : 'No verified trademarks yet'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Report</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Report Type</label>
                <p className="text-lg font-semibold text-gray-900 capitalize">{selectedReport.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Type</label>
                  <p className="text-lg text-gray-900 capitalize">{selectedReport.targetType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Target ID</label>
                  <p className="text-lg font-mono text-gray-900">{selectedReport.targetId}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="text-lg text-gray-900">{selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Reporter Address</label>
                <p className="text-sm font-mono text-gray-900 break-all">{selectedReport.reporterAddress}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Reported At</label>
                <p className="text-lg text-gray-900">{new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleResolveReport(selectedReport.id, 'resolved', 'Action taken')}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                >
                  Resolve (Action Taken)
                </button>
                <button
                  onClick={() => handleResolveReport(selectedReport.id, 'dismissed', 'No action needed')}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTrademark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTrademark(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trademark Details</h2>
              <button
                onClick={() => setSelectedTrademark(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Trademark Name</label>
                <p className="text-lg font-semibold text-gray-900">{selectedTrademark.trademarkName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Company Name</label>
                <p className="text-lg text-gray-900">{selectedTrademark.companyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Number</label>
                  <p className="text-lg font-mono text-gray-900">{selectedTrademark.registrationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Token ID</label>
                  <p className="text-lg font-mono text-gray-900">#{selectedTrademark.tokenId}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-lg text-gray-900">{selectedTrademark.category}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Owner Address</label>
                <p className="text-sm font-mono text-gray-900 break-all">{selectedTrademark.creatorAddress}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">IPFS Hash</label>
                <p className="text-sm font-mono text-gray-900 break-all">{selectedTrademark.ipfsHash}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-lg text-gray-900">{new Date(selectedTrademark.createdAt).toLocaleString()}</p>
              </div>

              {!selectedTrademark.verified && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerify(selectedTrademark.id, selectedTrademark.tokenId)}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    Verify Trademark
                  </button>
                  <button
                    onClick={() => handleReject(selectedTrademark.id)}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
