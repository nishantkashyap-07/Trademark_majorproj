import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';
import AdminVerificationPanel from '@/components/AdminVerificationPanel';
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
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'reports' | 'history'>('pending');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedTrademark, setSelectedTrademark] = useState<PendingTrademark | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [selectedTrademarks, setSelectedTrademarks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'normal' | 'low'>('all');
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);

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
    loadVerificationHistory();
  }, [isConnected, isAdmin, router]);

  const loadVerificationHistory = async () => {
    try {
      const response = await fetch(`/api/admin/verification-history?adminAddress=${account}`);
      const data = await response.json();
      if (data.success) {
        setVerificationHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error loading verification history:', error);
    }
  };

  const toggleTrademarkSelection = (id: string) => {
    const newSelection = new Set(selectedTrademarks);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedTrademarks(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const selectAll = () => {
    const allIds = new Set(pendingTrademarks.map(tm => tm.id));
    setSelectedTrademarks(allIds);
    setShowBulkActions(true);
  };

  const clearSelection = () => {
    setSelectedTrademarks(new Set());
    setShowBulkActions(false);
  };

  const handleBulkVerify = async () => {
    if (selectedTrademarks.size === 0) return;
    
    setIsLoading(true);
    try {
      const promises = Array.from(selectedTrademarks).map(async (id) => {
        const tm = pendingTrademarks.find(t => t.id === id);
        if (tm) {
          await handleVerify(id, tm.tokenId);
        }
      });
      
      await Promise.all(promises);
      setToast({ message: `${selectedTrademarks.size} trademarks verified successfully!`, type: 'success' });
      clearSelection();
      await loadTrademarks();
    } catch (error) {
      setToast({ message: 'Bulk verification failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTrademarks.size === 0) return;
    
    const reason = prompt('Enter rejection reason for all selected trademarks:');
    if (!reason) return;
    
    setIsLoading(true);
    try {
      const promises = Array.from(selectedTrademarks).map(async (id) => {
        await handleReject(id, reason);
      });
      
      await Promise.all(promises);
      setToast({ message: `${selectedTrademarks.size} trademarks rejected`, type: 'info' });
      clearSelection();
      await loadTrademarks();
    } catch (error) {
      setToast({ message: 'Bulk rejection failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

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
        await loadTrademarks();
        setSelectedTrademark(null);
      } else {
        setToast({ message: data.error || 'Verification failed', type: 'error' });
      }
    } catch (error) {
      console.error('Error verifying trademark:', error);
      setToast({ message: 'Failed to verify trademark', type: 'error' });
    }
  };

  const handleReject = async (trademarkId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/reject-trademark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trademarkId, reason, adminAddress: account }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({ message: 'Trademark rejected', type: 'info' });
        await loadTrademarks();
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

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="mb-8 bg-indigo-600 rounded-2xl p-4 shadow-lg animate-slide-down">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">{selectedTrademarks.size} selected</span>
                  <div className="h-6 w-px bg-white/20" />
                  <button
                    onClick={handleBulkVerify}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    ✓ Approve All
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    ✗ Reject All
                  </button>
                </div>
                <button
                  onClick={clearSelection}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Actions</p>
                  <p className="text-3xl font-bold text-purple-600">{verificationHistory.filter(h => {
                    const today = new Date().toDateString();
                    const historyDate = new Date(h.timestamp?.seconds * 1000).toDateString();
                    return today === historyDate;
                  }).length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'pending'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pending Review ({pendingTrademarks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('verified')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'verified'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Verified ({verifiedTrademarks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'reports'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reports ({reports.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'history'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    History ({verificationHistory.length})
                  </button>
                </div>
                
                {activeTab === 'pending' && pendingTrademarks.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Select All
                    </button>
                    {selectedTrademarks.size > 0 && (
                      <button
                        onClick={clearSelection}
                        className="px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner text="Loading data..." />
              ) : activeTab === 'history' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Verification History</h3>
                  {verificationHistory.length > 0 ? (
                    <div className="space-y-3">
                      {verificationHistory.map((history, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            history.action === 'verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {history.action === 'verified' ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {history.action === 'verified' ? 'Approved' : 'Rejected'} - {history.trademarkName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Token ID: #{history.tokenId} • {new Date(history.timestamp?.seconds * 1000).toLocaleString()}
                            </p>
                            {history.reason && (
                              <p className="text-xs text-gray-500 mt-1">Reason: {history.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No history yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Verification actions will appear here</p>
                    </div>
                  )}
                </div>
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
                      className={`bg-gray-50 rounded-xl p-6 border transition-all ${
                        selectedTrademarks.has(trademark.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {activeTab === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedTrademarks.has(trademark.id)}
                            onChange={() => toggleTrademarkSelection(trademark.id)}
                            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                        )}
                        <div className="flex-1">
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
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                  Normal Priority
                                </span>
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
                                Review & Verify
                              </button>
                            </div>
                          </div>
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

      {/* Verification Panel Modal */}
      {selectedTrademark && (
        <AdminVerificationPanel
          trademark={selectedTrademark}
          onVerify={async (tokenId) => {
            await handleVerify(selectedTrademark.id, tokenId);
          }}
          onReject={async (id, reason) => {
            await handleReject(id, reason);
          }}
          onClose={() => setSelectedTrademark(null)}
        />
      )}
    </>
  );
}
