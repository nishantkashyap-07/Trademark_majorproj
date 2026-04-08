import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AnimatedPage from '@/components/common/AnimatedPage';
import { demoStats } from '@/lib/demo-data';
import { SloganMetadata } from '@/types';

const FloatingNode = ({ name, value, x, y, delay, icon }: { name: string; value: string; x: string; y: string; delay: number; icon?: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1], y: [0, -10, 0] }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
    className="absolute hidden lg:flex items-center gap-3"
    style={{ left: x, top: y }}
  >
    <div className="relative group">
      <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-2 h-2 bg-white/60 rounded-full" />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">{name}</span>
      <span className="text-[8px] font-medium text-white/50 mt-1">{value}</span>
    </div>
    {icon && <div className="ml-2 opacity-50">{icon}</div>}
  </motion.div>
);

const PartnerLogo = ({ name, icon }: { name: string; icon?: string }) => (
  <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-all grayscale hover:grayscale-0 cursor-default px-8">
    <div className="w-6 h-6 bg-white/10 rounded-md" />
    <span className="text-sm font-bold tracking-tighter text-white">{name}</span>
  </div>
);

export default function Home() {
  const { isConnected, connect } = useWeb3();
  const [stats, setStats] = useState(demoStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.data);
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
    <AnimatedPage>
      <div className="bg-black text-white selection:bg-indigo-500/30 min-h-screen relative overflow-hidden flex flex-col">
        <Head>
          <title>TrademarkChain | Professional Blockchain IP Protection</title>
          <meta name="description" content="Secure, verify, and monetize your intellectual property on the Polygon blockchain." />
        </Head>

        {/* Global Navbar */}
        <Navbar />

        <main className="relative pt-20 flex-1">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_0%,transparent_70%)]" />
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          </div>

          {/* Hero Section */}
          <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
            
            {/* Floating Nodes */}
            <FloatingNode name="Cortex" value="20.945" x="15%" y="30%" delay={0} />
            <FloatingNode name="Quant" value="2.945" x="80%" y="35%" delay={1} />
            <FloatingNode name="Aelf" value="18.346" x="12%" y="65%" delay={2} />
            <FloatingNode name="Meeton" value="440" x="82%" y="60%" delay={3} />

            {/* Hero Sub-header Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <Link href="/register" className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/20 rounded-full text-[10px] font-bold text-white/70 hover:bg-white/10 transition-colors group tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Unlock Your Assets Spark!
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8 max-w-5xl leading-[1.1]"
            >
              One-click for <span className="text-white/40">Trademark Defense</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm md:text-lg text-white/60 max-w-2xl mb-12 leading-relaxed font-medium"
            >
              Dive into the IP assets, where innovative blockchain technology <br className="hidden md:block" /> meets brand protection expertise.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Link href="/dashboard" className="btn-pill-primary px-10 py-4 flex items-center gap-2">
                Open App
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="/marketplace" className="btn-pill-secondary px-10 py-4 border-white/20">
                Discover More
              </Link>
            </motion.div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-10 hidden lg:flex items-center gap-4 opacity-70">
              <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
                 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]">02/03 . Scroll down</span>
            </div>

            {/* Horizon Indicator */}
            <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-end gap-2 opacity-70 text-right">
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-indigo-400">IP Horizons</span>
              <div className="flex gap-1 h-1">
                <div className="w-8 bg-white rounded-full" />
                <div className="w-8 bg-white/30 rounded-full" />
                <div className="w-8 bg-white/30 rounded-full" />
              </div>
            </div>
          </section>

          {/* Partner Logos Bar */}
          <section className="py-20 border-t border-white/10 flex flex-col items-center">
             <div className="w-full overflow-hidden relative">
                <div className="flex items-center animate-[scroll_30s_linear_infinite] whitespace-nowrap gap-20">
                   <PartnerLogo name="Vercel" />
                   <PartnerLogo name="Loom" />
                   <PartnerLogo name="Cash App" />
                   <PartnerLogo name="Loops" />
                   <PartnerLogo name="Zapier" />
                   <PartnerLogo name="Ramp" />
                   <PartnerLogo name="Raycast" />
                   {/* Duplicate for infinite loop */}
                   <PartnerLogo name="Vercel" />
                   <PartnerLogo name="Loom" />
                   <PartnerLogo name="Cash App" />
                   <PartnerLogo name="Loops" />
                   <PartnerLogo name="Zapier" />
                   <PartnerLogo name="Ramp" />
                   <PartnerLogo name="Raycast" />
                </div>
                {/* Fade overlays */}
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />
             </div>
          </section>

          {/* Core Features Integration */}
          <section id="features" className="py-32 container-custom relative z-10 border-t border-white/10">
            <div className="grid md:grid-cols-3 gap-12">
               {[
                 { title: 'Secure Protocol', desc: 'Enterprise-grade blockchain infrastructure for intellectual property.' },
                 { title: 'Instant Registry', desc: 'Global trademark verification in milliseconds on the Polygon ledger.' },
                 { title: 'Web3 Monetization', desc: 'Direct licensing and royalty automation for your digital brands.' }
               ].map((f, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: i * 0.1 }}
                   className="group p-8 rounded-3xl bg-white/[0.03] border border-white/[0.1] hover:border-white/30 hover:bg-white/[0.05] transition-all"
                 >
                   <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                     0{i + 1}
                   </div>
                   <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                   <p className="text-sm text-white/50 leading-relaxed font-medium">{f.desc}</p>
                 </motion.div>
               ))}
            </div>
          </section>

          {/* Stats Bar (Condensed) */}
          <section className="py-20 border-y border-white/10">
             <div className="container-custom flex flex-wrap justify-between gap-12 opacity-80">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Total Assets</span>
                   <span className="text-2xl font-bold text-white">{stats.overview.totalTrademarks?.toLocaleString() || '1,280'}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Active Users</span>
                   <span className="text-2xl font-bold text-white">{stats.overview.totalUsers?.toLocaleString() || '429'}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Verified IP</span>
                   <span className="text-2xl font-bold text-white">{stats.overview.verifiedTrademarks?.toLocaleString() || '912'}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Success Rate</span>
                   <span className="text-2xl font-bold text-white">{stats.overview.verificationRate || '99.4'}%</span>
                </div>
             </div>
          </section>

        </main>
        
        <Footer />
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </AnimatedPage>
  );
}
