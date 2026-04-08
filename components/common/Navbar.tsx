import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import WalletModal from '@/components/auth/WalletModal';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { account, isConnected, disconnect } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Assets', href: '/marketplace' },
    { name: 'Register', href: '/register' },
    { name: 'Verify', href: '/verify' },
    { name: 'Disputes', href: '/disputes' },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-[100] transition-all duration-500">
      <div className="container-custom flex justify-center">
        <div className={`flex items-center gap-4 transition-all duration-500 rounded-full px-6 py-2 ${
          scrolled 
            ? 'glass-card !bg-black/60 !p-2 !rounded-full border-white/10 shadow-2xl' 
            : 'bg-white/5 border border-white/5 backdrop-blur-md'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 px-3">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
             </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-pill ${router.pathname === item.href ? 'nav-pill-active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/verify" className="nav-pill flex items-center gap-2 group">
               Protection
               <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.47 4.34-2.85 8.23-7 9.5V11.99H5V6.3l7-3.11v8.8z"/></svg>
            </Link>
          </div>

          <div className="w-[1px] h-4 bg-white/10 mx-2 hidden lg:block" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
             {!isAuthenticated ? (
               <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white px-4 py-2 transition-colors">
                  Create Account
               </Link>
             ) : (
               <div className="flex items-center gap-2">
                 <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                 </Link>
                 <button onClick={logout} className="p-1 text-white/40 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                 </button>
               </div>
             )}
             
             {isConnected ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 hidden md:flex">
                   <span className="text-[10px] font-mono text-white/60">{account?.slice(0, 4)}...{account?.slice(-4)}</span>
                   <button onClick={disconnect} className="p-0.5 text-white/40 hover:text-red-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
             ) : (
                <button onClick={() => setShowWalletModal(true)} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9"/></svg>
                </button>
             )}

             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="lg:hidden w-8 h-8 flex items-center justify-center"
             >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full mt-4 left-6 right-6 lg:hidden glass-card !p-4 border-white/10 shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </nav>
  );
}