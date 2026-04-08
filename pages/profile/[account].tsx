import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import TrademarkCard from '@/components/marketplace/TrademarkCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RatingDisplay from '@/components/ui/RatingDisplay';
import { TrademarkMetadata } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';

export default function ProfilePage() {
  const router = useRouter();
  const { account: profileAccount } = router.query;
  const { user: currentUser } = useAuth();
  const { account: currentWallet } = useWeb3();
  
  const [trademarks, setTrademarks] = useState<TrademarkMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isOwnProfile = (profileAccount as string)?.toLowerCase() === currentWallet?.toLowerCase();

  useEffect(() => {
    if (profileAccount) {
      loadProfileData();
    }
  }, [profileAccount]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trademarks?creatorAddress=${profileAccount}`);
      const data = await response.json();
      
      if (data.success) {
        setTrademarks(data.data.map((tm: any) => ({
          ...tm,
          sloganText: tm.trademarkName || tm.sloganText,
          createdAt: new Date(tm.createdAt?.seconds ? tm.createdAt.seconds * 1000 : tm.createdAt),
        })));
      } else {
        setError('Failed to load profile assets');
      }
    } catch (err) {
      setError('An error occurred while loading the profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <LoadingSpinner text="Loading profile protocols..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-indigo-500/30">
      <Head>
        <title>Profile | {profileAccount} | TrademarkChain</title>
      </Head>

      <Navbar />

      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Ambient Effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-custom relative z-10">
          {/* Profile Header Card */}
          <div className="glass-card !p-12 mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-all duration-700" />
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              {/* Avatar/Icon */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-1">
                <div className="w-full h-full bg-[#05070a] rounded-full flex items-center justify-center overflow-hidden">
                   <div className="text-5xl font-black text-white">
                     {(profileAccount as string)?.slice(2, 4).toUpperCase()}
                   </div>
                </div>
              </div>

              {/* User Identity */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Creator Profile
                  </h1>
                  {isOwnProfile && (
                    <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Your Profile
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <span className="font-mono text-slate-400 break-all text-sm md:text-lg">
                    {profileAccount}
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(profileAccount as string)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-slate-500 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
                    <p className="text-2xl font-black text-white">{trademarks.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Trust Rating</p>
                    <RatingDisplay creatorAddress={profileAccount as string} size="medium" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Active Provider</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {isOwnProfile ? (
                  <Link href="/dashboard" className="btn-premium">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/marketplace" className="btn-glass">
                    View in Marketplace
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* User's Assets Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-xl font-bold tracking-tight text-white uppercase">Assets Portfolio</h2>
                  <p className="text-sm text-slate-500 font-medium">Intellectual property protocols managed by this user.</p>
               </div>
               <div className="hidden md:block h-px flex-1 bg-white/5 mx-10" />
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Sort: Newest First
               </div>
            </div>

            {trademarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {trademarks.map((tm) => (
                  <TrademarkCard key={tm.tokenId} trademark={tm} />
                ))}
              </div>
            ) : (
              <div className="glass-card !py-24 text-center">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5 text-slate-700">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                 </div>
                 <h3 className="text-2xl font-black mb-2 uppercase">No Assets Detected</h3>
                 <p className="text-slate-500 font-bold max-w-md mx-auto">This node has not registered any intellectual property protocols on the network yet.</p>
              </div>
            )}
          </section>

          {/* Activity Section */}
          <section>
             <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-xl font-bold tracking-tight text-white uppercase">Recent Activity</h2>
                  <p className="text-sm text-slate-500 font-medium">Record of recent network interactions.</p>
               </div>
            </div>

            <div className="glass-card !p-0 overflow-hidden divide-y divide-white/5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-8 flex items-center gap-8 hover:bg-white/[0.01] transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">Asset Protocol Minted</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                       TRADEMARK_REGISTRATION • 0x4f...{item}de • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
              <div className="p-8 text-center bg-white/[0.01]">
                 <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                    Retrieve Full Ledger History
                 </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
