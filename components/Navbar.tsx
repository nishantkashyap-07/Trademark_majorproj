import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '@/contexts/Web3Context';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const router = useRouter();
  const { account, isConnected, connect, disconnect } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Register IP', href: '/register' },
    { name: 'Verify IP', href: '/verify' },
  ];

  const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase();
  const isAdmin = account && ADMIN_ADDRESS && account.toLowerCase() === ADMIN_ADDRESS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? 'py-3 bg-[#05070a]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-indigo-500/5' 
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 gap-8">
          {/* Left Side: Logo + Nav */}
          <div className="flex items-center gap-8 lg:gap-12 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-105">
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-none uppercase italic">TrademarkChain</span>
                <span className="text-[8px] font-black text-indigo-400 tracking-[0.3em] uppercase mt-1">Universal Protocol</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                    router.pathname === item.href
                      ? 'text-indigo-400 bg-indigo-400/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Middle: Search Bar (Centered in available space) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registry index..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all group-hover:bg-white/[0.05]"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isAdmin && (
               <Link href="/admin" className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 hover:bg-amber-500/20 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-2a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
               </Link>
            )}
            
            {isConnected ? (
              <>
                <NotificationBell />
                <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </Link>
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-slate-200 font-mono hidden xl:inline">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                  <button onClick={disconnect} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={connect}
                className="btn-premium !px-6 !py-2.5 !text-xs !rounded-xl"
              >
                Sync Wallet
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 glass-card !p-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}