import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import { useTheme } from '@/contexts/ThemeContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/common/Toast';
import AdminVerificationPanel from '@/components/dashboard/AdminVerificationPanel';
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
  const { setTheme } = useTheme();
  
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
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);

  const isDevMode = process.env.NEXT_PUBLIC_ADMIN_DEV_MODE === 'true';
  const MOCK_ADMIN_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Default Hardhat account 0

  // Admin addresses
  const ADMIN_ADDRESSES = [
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
    MOCK_ADMIN_ADDRESS.toLowerCase()
  ].filter(Boolean);

  const effectiveAccount = isDevMode ? (account || MOCK_ADMIN_ADDRESS) : account;
  const isAdmin = isDevMode || (isConnected && account && ADMIN_ADDRESSES.includes(account.toLowerCase()));

  // Force Light Theme
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  // Sync tab with URL
  useEffect(() => {
    if (router.query.tab && ['pending', 'verified', 'reports', 'history'].includes(router.query.tab as string)) {
      setActiveTab(router.query.tab as any);
    }
  }, [router.query.tab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    router.push({ pathname: '/admin', query: { tab } }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (!isDevMode && !isConnected) {
      router.push('/');
      return;
    }

    if (!isDevMode && isConnected && !isAdmin) {
      setToast({ message: 'Access denied. Admin privileges required.', type: 'error' });
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    loadData();
  }, [isConnected, isAdmin, router, isDevMode]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadTrademarks(),
      loadReports(),
      loadVerificationHistory()
    ]);
    setIsLoading(false);
  };

  const loadVerificationHistory = async () => {
    try {
      const response = await fetch(`/api/admin/verification-history?adminAddress=${effectiveAccount}`);
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
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?adminAddress=${effectiveAccount}&status=pending`);
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
        body: JSON.stringify({ trademarkId, tokenId, adminAddress: effectiveAccount }),
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
        body: JSON.stringify({ trademarkId, reason, adminAddress: effectiveAccount }),
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
        body: JSON.stringify({ reportId, status, resolution, adminAddress: effectiveAccount }),
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

  if (!isAdmin && !isDevMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Checking admin access..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Head>
        <title>Admin Panel | TrademarkChain</title>
      </Head>

      {/* Simplified Admin Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tight text-gray-900">ADMIN <span className="text-blue-600">CONSOLE</span></span>
            {isDevMode && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded border border-yellow-200">
                Dev Mode Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Account</span>
              <span className="text-xs font-mono text-gray-900">{effectiveAccount?.slice(0, 6)}...{effectiveAccount?.slice(-4)}</span>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
            >
              Exit to App
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">System management and verification workflow</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: pendingTrademarks.length, color: 'border-orange-500' },
            { label: 'Verified Total', value: verifiedTrademarks.length, color: 'border-green-500' },
            { label: 'Active Reports', value: reports.length, color: 'border-red-500' },
            { label: 'Total Assets', value: pendingTrademarks.length + verifiedTrademarks.length, color: 'border-blue-500' }
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-5 border-l-4 ${stat.color} border border-gray-100 shadow-sm rounded-sm`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs Control */}
        <div className="border border-gray-200 rounded-sm overflow-hidden mb-6 bg-white shadow-sm">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: 'pending', label: 'Pending Review', count: pendingTrademarks.length },
              { id: 'verified', label: 'Verified Assets', count: verifiedTrademarks.length },
              { id: 'reports', label: 'Incidents & Reports', count: reports.length },
              { id: 'history', label: 'System Logs', count: verificationHistory.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-r border-gray-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-b-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner text="Refreshing data..." />
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                {showBulkActions && activeTab === 'pending' && (
                  <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-sm">
                    <span className="text-sm font-semibold text-blue-800">{selectedTrademarks.size} items selected</span>
                    <div className="flex gap-2">
                       <button onClick={handleBulkVerify} className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded">Approve Selected</button>
                       <button onClick={handleBulkReject} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">Reject Selected</button>
                       <button onClick={clearSelection} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Content Area Rendering */}
                {activeTab === 'pending' || activeTab === 'verified' ? (
                   <div className="space-y-4">
                      {(activeTab === 'pending' ? pendingTrademarks : verifiedTrademarks).map((tm) => (
                        <div key={tm.id} className="group border border-gray-200 p-4 hover:border-gray-400 transition-colors bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                               {activeTab === 'pending' && (
                                 <input 
                                  type="checkbox" 
                                  checked={selectedTrademarks.has(tm.id)}
                                  onChange={() => toggleTrademarkSelection(tm.id)}
                                  className="mt-1.5"
                                 />
                               )}
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{tm.trademarkName}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded">{tm.category}</span>
                                  </div>
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-8 text-xs text-gray-600">
                                    <p><span className="text-gray-400 uppercase font-semibold text-[9px]">Entity:</span> {tm.companyName}</p>
                                    <p><span className="text-gray-400 uppercase font-semibold text-[9px]">Token ID:</span> #{tm.tokenId}</p>
                                    <p><span className="text-gray-400 uppercase font-semibold text-[9px]">Reg #:</span> {tm.registrationNumber}</p>
                                    <p><span className="text-gray-400 uppercase font-semibold text-[9px]">Created:</span> {new Date(tm.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <p className="mt-2 text-[10px] font-mono text-gray-400">Owner: {tm.creatorAddress}</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => setSelectedTrademark(tm)}
                              className="px-4 py-2 text-xs font-bold border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all rounded-sm uppercase tracking-widest"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                      {(activeTab === 'pending' ? pendingTrademarks : verifiedTrademarks).length === 0 && (
                        <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300">
                           <p className="text-gray-500 text-sm">No items found in this category.</p>
                        </div>
                      )}
                   </div>
                ) : activeTab === 'reports' ? (
                  <div className="space-y-4">
                     {reports.map((report) => (
                        <div key={report.id} className="border border-red-100 p-4 bg-red-50/30">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h3 className="font-bold text-red-900 capitalize">{report.type} Infringement Report</h3>
                                 <p className="text-xs text-gray-600 mt-1">{report.reason}</p>
                                 <div className="mt-2 text-[10px] font-mono text-gray-500">
                                    Target ID: {report.targetId} • Platform: {report.targetType}
                                 </div>
                              </div>
                              <button 
                                onClick={() => setSelectedReport(report)}
                                className="px-4 py-2 bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-700 hover:text-white transition-colors"
                              >
                                RESOLVE
                              </button>
                           </div>
                        </div>
                     ))}
                     {reports.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300">
                           <p className="text-gray-500 text-sm">No pending incident reports.</p>
                        </div>
                     )}
                  </div>
                ) : (
                  <div className="space-y-2">
                     {verificationHistory.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 text-xs text-gray-600">
                           <div className="flex items-center gap-4">
                              <span className={`w-2 h-2 rounded-full ${h.action === 'verified' ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="font-bold text-gray-900 uppercase min-w-[80px]">{h.action}</span>
                              <span className="font-medium">{h.trademarkName} (ID: #{h.tokenId})</span>
                           </div>
                           <span className="text-gray-400">{new Date(h.timestamp?.seconds * 1000).toLocaleString()}</span>
                        </div>
                     ))}
                     {verificationHistory.length === 0 && (
                        <div className="text-center py-20">
                           <p className="text-gray-400 text-sm italic">Application transaction logs are empty.</p>
                        </div>
                     )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Simplified Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-xl p-8 shadow-2xl rounded-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Incident Review</h2>
            <div className="space-y-4 mb-8">
               <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-gray-50 p-2 border border-gray-100">
                     <p className="text-gray-400 mb-1">TYPE</p>
                     <p className="font-bold">{selectedReport.type}</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-gray-100">
                     <p className="text-gray-400 mb-1">TARGET</p>
                     <p className="font-bold">{selectedReport.targetType}</p>
                  </div>
               </div>
               <div className="bg-gray-50 p-3 border border-gray-100 text-sm">
                  <p className="text-gray-400 text-[10px] mb-2 font-bold uppercase">Incident Description</p>
                  <p className="text-gray-700">{selectedReport.reason}</p>
                  {selectedReport.description && <p className="mt-2 text-gray-600 italic">"{selectedReport.description}"</p>}
               </div>
               <div className="text-[10px] text-gray-400 font-mono">
                  REPORTED BY: {selectedReport.reporterAddress}
               </div>
            </div>
            <div className="flex gap-2">
               <button 
                  onClick={() => handleResolveReport(selectedReport.id, 'resolved', 'Infringement confirmed; action taken')}
                  className="flex-1 py-3 bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-sm"
               >
                  Verify & Take Action
               </button>
               <button 
                  onClick={() => handleResolveReport(selectedReport.id, 'dismissed', 'False report; no action needed')}
                  className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold text-xs uppercase tracking-widest border border-gray-200 rounded-sm"
               >
                  Dismiss Report
               </button>
               <button onClick={() => setSelectedReport(null)} className="px-4 py-3 bg-white text-gray-400 font-bold text-xs">CLOSE</button>
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
    </div>
  );
}
