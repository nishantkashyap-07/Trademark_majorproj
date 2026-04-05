import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrademarkCard from '@/components/TrademarkCard';
import SplineBackground from '@/components/SplineBackground';
import { demoStats } from '@/lib/demo-data';
import { SloganMetadata } from '@/types';

export default function Home() {
  const { isConnected, connect } = useWeb3();
  const [stats, setStats] = useState(demoStats);
  const [featuredSlogans, setFeaturedSlogans] = useState<SloganMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.data);
        }
        const trademarksRes = await fetch('/api/trademarks?limitCount=8&sortBy=createdAt&order=desc');
        if (trademarksRes.ok) {
          const trademarksData = await trademarksRes.json();
          if (trademarksData.success) setFeaturedSlogans(trademarksData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#05070a] text-white selection:bg-indigo-500/30 selection:text-white">
      <Head>
        <title>TrademarkChain | Professional Blockchain IP Protection</title>
        <meta name="description" content="Secure, verify, and monetize your intellectual property on the Polygon blockchain." />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-80">
            <SplineBackground opacity={80} showGradient={true} gradientDirection="bottom" gradientOpacity={90} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05070a]/50 to-[#05070a]" />
          </div>

          <div className="container-custom relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 py-32">
            {/* Left Content */}
            <div className="flex-1 max-w-4xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-400 mb-8 animate-slide-up tracking-widest uppercase italic">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Universal Protocol Infrastructure
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 animate-slide-up leading-[0.85] uppercase italic">
                Secure Your <br />
                <span className="text-gradient">Digital Legacy.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 animate-slide-up leading-relaxed font-bold mx-auto lg:mx-0">
                TrademarkChain is the definitive protocol for intellectual property. We turn intangible ideas into verifiable, liquid on-chain assets with institutional security.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
                {isConnected ? (
                  <>
                    <Link href="/register" className="btn-premium !py-5 !px-12">Register Asset</Link>
                    <Link href="/marketplace" className="btn-glass !py-5 !px-12">Explore Index</Link>
                  </>
                ) : (
                  <button onClick={connect} className="btn-premium !py-5 !px-12">Sync Identity to Start</button>
                )}
              </div>

              <div className="mt-20 flex items-center justify-center lg:justify-start gap-10 opacity-30">
                <p className="text-[10px] font-black font-mono text-slate-500 tracking-[0.3em] uppercase">Secured by Matrix</p>
                <div className="flex gap-8">
                  <span className="text-xs font-black text-slate-300 tracking-tighter uppercase italic">Polygon</span>
                  <span className="text-xs font-black text-slate-300 tracking-tighter uppercase italic">IPFS</span>
                  <span className="text-xs font-black text-slate-300 tracking-tighter uppercase italic">FirewallV2</span>
                </div>
              </div>
            </div>

            {/* Right: Floating Stats Card */}
            <div className="hidden lg:block w-[400px] flex-shrink-0 animate-slide-in-right">
              <div className="glass-card hover-glow border-indigo-500/20 bg-indigo-500/[0.02]">
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Node Activity</h3>
                  <div className="status-badge status-badge-success !px-2 !py-0.5 !text-[10px]">LIVE_FEED</div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Assets</p>
                    <p className="text-4xl font-black text-white">{stats.overview.totalTrademarks || '1,280'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
                    <p className="text-4xl font-black text-white">{stats.overview.totalUsers || '429'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Validated IP</p>
                    <p className="text-4xl font-black text-indigo-400">{stats.overview.verifiedTrademarks || '912'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trust Index</p>
                    <p className="text-4xl font-black text-cyan-400">{stats.overview.verificationRate || 99.4}%</p>
                  </div>
                </div>

                <div className="mt-10 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                   <p className="text-[10px] font-black text-indigo-300/60 leading-relaxed uppercase tracking-tighter">
                     TRADEMARK_CHAIN_PROTOCOL_V.1.0 // MULTI_SIG_VERIFIED // POLYGON_SYNC_READY
                   </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-40 bg-[#05070a]">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-24">
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 block">Core Engine</span>
               <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">Built for Creators</h2>
               <p className="text-slate-400 text-lg font-bold">A seamless workflow from registration to monetization, powered by decentralized institutional infrastructure.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                { title: 'On-Chain Proof', desc: 'Immutable evidence of IP ownership stored directly on the Polygon blockchain with IPFS metadata support.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', color: 'indigo' },
                { title: 'Instant Verity', desc: 'Global verification in milliseconds. Allow anyone to verify your assets without third-party intermediaries.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'cyan' },
                { title: 'IP Liquidity', desc: 'Direct monetization of trademarks through licensing and direct sales. Automated royalties for every trade.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'indigo' }
              ].map((f, i) => (
                <div key={i} className="glass-card hover-glow group !p-10">
                  <div className={`w-16 h-16 bg-${f.color}-500/10 border border-${f.color}-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <svg className={`w-8 h-8 text-${f.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon}/></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-bold text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Grid */}
        <section className="py-40 bg-[#05070a]/50 relative">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter italic">Recent Nodes</h2>
                <p className="text-slate-400 font-bold">Discover the latest intellectual property assets synchronized to the universal ledger.</p>
              </div>
              <Link href="/marketplace" className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-3 border border-indigo-400/20 px-6 py-3 rounded-xl hover:bg-indigo-400/10 active:scale-95 group">
                Access Marketplace Index
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-40">
                <div className="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : featuredSlogans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredSlogans.map((s, i) => (
                  <div key={s.tokenId} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}><TrademarkCard trademark={s} /></div>
                ))}
              </div>
            ) : (
              <div className="glass-card py-32 text-center border-dashed border-white/10">
                 <h3 className="text-2xl font-black mb-4 uppercase tracking-widest text-slate-500">Registry Quiet...</h3>
                 <Link href="/register" className="btn-premium">Initialize First Token</Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 container-custom">
           <div className="relative glass-card bg-gradient-to-br from-indigo-900 via-indigo-600 to-indigo-900 !p-16 md:!p-32 text-center border-white/20 shadow-[0_0_100px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-10 transition-opacity duration-1000" />
              <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter uppercase italic leading-[0.85]">Evolve Your <br /> IP DNA.</h2>
              <p className="text-indigo-100 text-lg md:text-2xl max-w-2xl mx-auto mb-16 font-bold">Join the sovereign businesses securing their identity on the blockchain.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                 <Link href="/register" className="btn-glass !bg-white !text-indigo-600 !px-12 hover:scale-110">Initialize IP</Link>
                 <Link href="/verify" className="btn-glass !border-white/40 !px-12 hover:scale-110">Sync & Verify</Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
