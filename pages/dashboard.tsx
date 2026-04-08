import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { SloganMetadata } from '@/types';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

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
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { account, isConnected } = useWeb3();
  
  const [allTrademarks, setAllTrademarks] = useState<SloganMetadata[]>([]);
  const [userTrademarks, setUserTrademarks] = useState<SloganMetadata[]>([]);
  const [filteredTrademarks, setFilteredTrademarks] = useState<SloganMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
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
  }, [account, isConnected, user]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    applyFilters();
  }, [userTrademarks, searchQuery, filterStatus, sortBy]);

  const applyFilters = () => {
    let filtered = [...userTrademarks];
    
    // Search filter
    
    if (searchQuery) {
      filtered = filtered.filter(tm => 
        tm.sloganText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tm.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tm.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tm => 
        filterStatus === 'verified' ? tm.verified : !tm.verified
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return (a.sloganText || '').localeCompare(b.sloganText || '');
      }
    });
    
    setFilteredTrademarks(filtered);
  };

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
        // Filter by user email or wallet address
        if (user) {
          const userAddress = account?.toLowerCase() || user.email.toLowerCase();
          setUserTrademarks(trademarks.filter(t => 
            t.creatorAddress.toLowerCase() === userAddress ||
            t.creatorAddress.toLowerCase() === account?.toLowerCase()
          ));
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <Head>
        <title>Dashboard | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-custom relative z-10">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-[10px] font-black text-slate-500 mb-4 tracking-widest uppercase">
                {isConnected && account ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Active Node: {account.slice(0, 6)}...{account.slice(-4)}</span>
                  </div>
                ) : (
                  <span>Session: {user?.email}</span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white">
                Dashboard Overview
              </h1>
              <p className="text-slate-400 font-medium max-w-xl text-sm leading-relaxed">
                Manage your digital assets and monitor global protocol growth.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
               <button 
                 onClick={() => loadDashboardData()} 
                 className="btn-glass flex items-center gap-3 !px-6"
                 disabled={isLoading}
               >
                 <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                 </svg>
                 {isLoading ? 'Syncing...' : 'Sync Protocol'}
               </button>
               {isConnected && account && (
                 <Link href={`/profile/${account}`} className="btn-glass !border-indigo-500/30 !text-indigo-400 hover:!bg-indigo-500/10 flex items-center gap-2 !px-6">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Public Profile
                 </Link>
               )}
               <Link href="/register" className="btn-premium !px-8 flex items-center gap-2 group">
                  <span>Register Asset</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
               </Link>
            </div>
          </div>

          {/* Core Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Asset Portfolio', value: userTrademarks.length, sub: `${userTrademarks.filter(t => t.verified).length} Validated`, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'indigo' },
              { label: 'Network Supply', value: stats.totalTrademarks, sub: `+${stats.pendingTrademarks} Queue`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'blue' },
              { label: 'Protocol Integrity', value: `${stats.verificationRate}%`, sub: `${stats.verifiedTrademarks} Verified`, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'green' },
              { label: 'Validator Nodes', value: stats.totalUsers, sub: 'Active Creators', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'purple' }
            ].map((s, i) => (
              <div key={i} className="glass-card !p-8 relative overflow-hidden group animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-${s.color}-500/10 transition-all duration-700`} />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{s.label}</span>
                  <div className={`w-10 h-10 rounded-xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400 border border-${s.color}-500/20`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon}/></svg>
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-black mb-1 group-hover:scale-105 origin-left transition-transform duration-500">{s.value}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest text-${s.color}-500/60`}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Asset Management Section */}
            <div className="space-y-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
               <section>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                     <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Your Assets</h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredTrademarks.length} Protocols Active</span>
                     </div>
                     
                     <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500">
                             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                           </div>
                           <input
                              type="text"
                              placeholder="Search protocols..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                           />
                        </div>
                        
                        <div className="flex gap-2">
                          <select
                             value={filterStatus}
                             onChange={(e) => setFilterStatus(e.target.value as any)}
                             className="px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 focus:outline-none focus:border-indigo-500/50 transition-colors"
                          >
                             <option value="all" className="bg-[#05070a]">All</option>
                             <option value="verified" className="bg-[#05070a]">Verified</option>
                             <option value="pending" className="bg-[#05070a]">Pending</option>
                          </select>
                          
                          <select
                             value={sortBy}
                             onChange={(e) => setSortBy(e.target.value as any)}
                             className="px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 focus:outline-none focus:border-indigo-500/50 transition-colors"
                          >
                             <option value="newest" className="bg-[#05070a]">Newest</option>
                             <option value="oldest" className="bg-[#05070a]">Oldest</option>
                             <option value="name" className="bg-[#05070a]">A-Z</option>
                          </select>
                        </div>
                     </div>
                  </div>
                  
                  {filteredTrademarks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredTrademarks.map((tm, idx) => (
                        <div key={tm.tokenId} className="glass-card group hover:!border-indigo-500/30 transition-all duration-500 !p-6 relative overflow-hidden backdrop-blur-xl">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                           
                           <Link href={`/trademark/${tm.tokenId}`} className="flex gap-6 relative z-10">
                              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:rotate-3 transition-all duration-500">
                                 <span className="text-3xl font-black text-white">{tm.sloganText?.charAt(0)}</span>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-black truncate group-hover:text-indigo-400 transition-colors">{tm.sloganText}</h3>
                                    {tm.verified && (
                                      <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                      </div>
                                    )}
                                 </div>
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 truncate">{tm.companyName}</p>
                                 <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400">{tm.category}</span>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${tm.verified ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                       {tm.verified ? 'Protocol Confirmed' : 'Sync Pending'}
                                    </span>
                                 </div>
                              </div>
                           </Link>
                           
                           {/* Action Interface */}
                           <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                              <Link 
                                 href={`/trademark/${tm.tokenId}`}
                                 className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center transition-all"
                                 title="Execute Review"
                              >
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                 </svg>
                              </Link>
                              <button 
                                 onClick={() => {
                                    const url = `${window.location.origin}/verify?tokenId=${tm.tokenId}`;
                                    navigator.clipboard.writeText(url);
                                 }}
                                 className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center transition-all"
                                 title="Copy Node URI"
                              >
                                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                 </svg>
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : userTrademarks.length > 0 ? (
                    <div className="glass-card !py-24 text-center border-dashed border-white/10">
                       <p className="text-slate-500 font-bold mb-4 uppercase tracking-widest text-xs">No encryption protocols match your filters</p>
                       <button 
                          onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all"
                       >
                          Reset Filters
                       </button>
                    </div>
                  ) : (
                    <div className="glass-card !py-32 text-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                       <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10">
                          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                       </div>
                       <div className="relative z-10">
                         <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter">Empty Repository</h3>
                         <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto text-sm leading-relaxed">System has not detected any intellectual property protocols associated with this node.</p>
                         <Link href="/register" className="btn-premium !px-10">Initialize First Registration</Link>
                       </div>
                    </div>
                  )}
               </section>

               {/* Activity Ledger Section */}
               <section className="animate-slide-up" style={{ animationDelay: '500ms' }}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Activity Log</span>
                  </div>
                  
                  <div className="glass-card !p-0 overflow-hidden backdrop-blur-3xl border-white/5">
                     {stats.recentActivity.filter(act => 
                        act.userAddress?.toLowerCase() === account?.toLowerCase()
                     ).length > 0 ? (
                        <div className="divide-y divide-white/[0.02]">
                           {stats.recentActivity
                              .filter(act => act.userAddress?.toLowerCase() === account?.toLowerCase())
                              .slice(0, 8)
                              .map((act, i) => (
                              <div key={i} className="flex items-center gap-6 p-8 hover:bg-white/[0.01] transition-all group">
                                 <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0 text-slate-600 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-500">{act.details || 'System event recorded'}</p>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                       <span className="text-indigo-500/70">{act.type}</span>
                                       <div className="w-1 h-1 bg-white/10 rounded-full" />
                                       <span>{new Date(act.timestamp?.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                 </div>
                                 <div className="flex-shrink-0 hidden sm:block">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l-3-3m0 0l3-3m-3 3h8M3.333 19.333h17.334"/></svg>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="p-20 text-center">
                           <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No transaction history detected</p>
                        </div>
                     )}
                     
                     <div className="p-6 bg-white/[0.01] text-center border-t border-white/5">
                        <button className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] hover:text-white transition-colors">
                           Expand Complete Execution Ledger
                        </button>
                     </div>
                  </div>
               </section>
            </div>

            {/* Terminal Sidebar: Threat Monitoring & Market Intelligence */}
            <div className="space-y-8 animate-slide-in-right" style={{ animationDelay: '600ms' }}>
               <div className="glass-card relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-8 flex items-center justify-between">
                    Market Intelligence
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  </h3>
                  <div className="space-y-8">
                     {allTrademarks.slice(0, 6).map((tm, idx) => (
                        <Link key={tm.tokenId} href={`/trademark/${tm.tokenId}`} className="flex items-center gap-6 group">
                           <div className="w-6 text-[10px] font-black text-slate-700 font-mono">0{idx + 1}</div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate text-slate-300 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{tm.sloganText}</p>
                              <p className="text-[9px] font-black uppercase text-slate-600 tracking-tighter mt-0.5">{tm.category}</p>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-mono text-slate-500">{(tm.views || 100 + idx * 42)}V</span>
                              <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500/40" style={{ width: `${Math.min(90, 30 + idx * 10)}%` }} />
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
                  <Link href="/marketplace" className="btn-glass w-full mt-12 !py-3 text-center !text-[10px] font-black uppercase tracking-widest hover:!bg-white hover:!text-black transition-all">
                    Access Marketplace Matrix
                  </Link>
               </div>

               <div className="glass-card bg-indigo-600/5 !border-indigo-600/20 relative group">
                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Security Protocol
                  </h3>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Operational</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium relative z-10">
                    Your assets are decentralized via <span className="text-white">IPFS protocols</span> and immutably secured on the <span className="text-white">Polygon Layer-2</span> settlement layer. Transactional metadata is cryptographically hashed for permanent validation.
                  </p>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border border-black flex items-center justify-center text-[8px] font-black text-white">0x</div>
                        ))}
                     </div>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">9+ Global Nodes Active</span>
                  </div>
               </div>
               
               <div className="glass-card !bg-amber-500/5 !border-amber-500/20">
                  <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    Compliance Alert
                  </h3>
                  <p className="text-[11px] text-amber-600/70 font-bold leading-relaxed">
                    Ensure all your IP assets are synchronized with local jurisdictional registries. Blockchain records provide immutable proof of existence but do not bypass regional legal filings.
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
