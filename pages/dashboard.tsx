import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { SloganMetadata } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface DashboardStats {
  totalTrademarks: number;
  verifiedTrademarks: number;
  pendingTrademarks: number;
  totalUsers: number;
  totalCategories: number;
  verificationRate: string;
  recentActivity: any[];
}

export default function Dashboard() {
  const { account, isConnected, connect } = useWeb3();
  
  const [allTrademarks, setAllTrademarks] = useState<SloganMetadata[]>([]);
  const [userTrademarks, setUserTrademarks] = useState<SloganMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTrademarks: 0,
    verifiedTrademarks: 0,
    pendingTrademarks: 0,
    totalUsers: 0,
    totalCategories: 0,
    verificationRate: '0',
    recentActivity: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, [account, isConnected]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [statsRes, trademarksRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trademarks')
      ]);
      
      const statsData = await statsRes.json();
      const trademarksData = await trademarksRes.json();
      
      if (statsData.success) {
        setStats({
          totalTrademarks: statsData.data.overview.totalSlogans || 0,
          verifiedTrademarks: statsData.data.overview.verifiedSlogans || 0,
          pendingTrademarks: (statsData.data.overview.totalSlogans || 0) - (statsData.data.overview.verifiedSlogans || 0),
          totalUsers: statsData.data.overview.totalUsers || 0,
          totalCategories: statsData.data.overview.totalCategories || 0,
          verificationRate: statsData.data.overview.verificationRate || '0',
          recentActivity: statsData.data.recentActivity || [],
        });
      }

      if (trademarksData.success && trademarksData.data) {
        const trademarks = trademarksData.data.map((tm: any) => ({
          ...tm,
          sloganText: tm.trademarkName || tm.sloganText,
          createdAt: new Date(tm.createdAt?.seconds ? tm.createdAt.seconds * 1000 : tm.createdAt),
        })) as SloganMetadata[];
        
        setAllTrademarks(trademarks);
        if (account) {
          setUserTrademarks(trademarks.filter(t => t.creatorAddress.toLowerCase() === account.toLowerCase()));
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center p-12">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-3xl font-black mb-4">Command Center</h1>
          <p className="text-slate-400 mb-10">Access your portfolio and real-time protocol metrics by connecting your wallet.</p>
          <button onClick={connect} className="btn-premium w-full !py-4">Authorize Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <Head>
        <title>Dashboard | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-custom relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[10px] font-black text-slate-500 mb-4 tracking-widest uppercase">
                Active Node: {account?.slice(0, 10)}...
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">Command Center</h1>
              <p className="text-slate-400">Manage your digital assets and monitor global protocol growth.</p>
            </div>
            <div className="flex gap-4">
               <button onClick={() => loadDashboardData()} className="btn-glass flex items-center gap-2">
                 <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                 Sync Data
               </button>
               <Link href="/register" className="btn-premium">Register New Asset</Link>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Network Assets', value: stats.totalTrademarks, sub: `+${stats.pendingTrademarks} Pending`, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'blue' },
              { label: 'Validated IP', value: stats.verifiedTrademarks, sub: `${stats.verificationRate}% Rate`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
              { label: 'Protocol Nodes', value: stats.totalUsers, sub: 'Global Creators', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'purple' },
              { label: 'Market Vectors', value: stats.totalCategories, sub: 'Industry Sectors', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'orange' }
            ].map((s, i) => (
              <div key={i} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{s.label}</p>
                  <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon}/></svg>
                  </div>
                </div>
                <h3 className="text-4xl font-black mb-1">{s.value}</h3>
                <p className={`text-xs font-bold text-${s.color}-500/70`}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_350px] gap-12">
            {/* Left: User Assets */}
            <div className="space-y-12">
               <section>
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-black">Your Portfolio</h2>
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{userTrademarks.length} Assets Found</span>
                  </div>
                  
                  {userTrademarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userTrademarks.map((tm, idx) => (
                        <Link key={tm.tokenId} href={`/trademark/${tm.tokenId}`} className="glass-card group hover:!border-indigo-500/50 transition-all duration-300">
                           <div className="flex gap-6">
                              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                 <span className="text-3xl font-black text-white">{tm.sloganText?.charAt(0)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-black truncate">{tm.sloganText}</h3>
                                    {tm.verified && <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
                                 </div>
                                 <p className="text-xs font-bold text-slate-500 mb-4">{tm.companyName}</p>
                                 <div className="flex items-center gap-3">
                                    <span className="status-badge status-badge-purple !py-0 !px-2 text-[9px] uppercase tracking-tighter">{tm.category}</span>
                                    <span className={`status-badge !py-0 !px-2 text-[9px] uppercase tracking-tighter ${tm.verified ? 'status-badge-blue' : 'status-badge-amber'}`}>
                                       {tm.verified ? 'On-Chain Verified' : 'Auth Pending'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card py-20 text-center">
                       <p className="text-slate-500 font-bold mb-6">No assets registered under this wallet address.</p>
                       <Link href="/register" className="btn-premium">Register New IP</Link>
                    </div>
                  )}
               </section>

               {/* Activity Log */}
               <section>
                  <h2 className="text-2xl font-black mb-8">Protocol Activity</h2>
                  <div className="glass-card !p-0 overflow-hidden">
                     <div className="divide-y divide-white/5">
                        {stats.recentActivity.map((act, i) => (
                           <div key={i} className="flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-colors">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-400">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-white mb-0.5">{act.details || 'System event recorded'}</p>
                                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span className="text-indigo-400">{act.type}</span>
                                    <span>•</span>
                                    <span>{new Date(act.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            </div>

            {/* Right Sidebar: Market Stats */}
            <div className="space-y-8 lg:order-2">
               <div className="glass-card">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Market Trends</h3>
                  <div className="space-y-6">
                     {allTrademarks.slice(0, 5).map((tm, idx) => (
                        <Link key={tm.tokenId} href={`/trademark/${tm.tokenId}`} className="flex items-center gap-4 group">
                           <div className="w-8 text-[10px] font-black text-slate-600">0{idx + 1}</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate group-hover:text-indigo-400 transition-colors">{tm.sloganText}</p>
                              <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{tm.category}</p>
                           </div>
                           <div className="text-xs font-black text-slate-400">{tm.views || 0}V</div>
                        </Link>
                     ))}
                  </div>
                  <Link href="/marketplace" className="btn-glass w-full mt-10 !py-2 text-center text-xs">Explore All Assets</Link>
               </div>

               <div className="glass-card bg-indigo-600/5 !border-indigo-600/20">
                  <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Security Status</h3>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Protocol Operational</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                     Your assets are protected by decentralized IPFS storage and immutably registered on the Polygon blockchain. Metadata is cryptographically signed.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
