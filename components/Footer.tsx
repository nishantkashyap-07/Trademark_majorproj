import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-[#05070a] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TrademarkChain</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The world's most advanced blockchain trademark ecosystem. Protect, verify, and monetize your IP assets with decentralized trust.
            </p>
            <div className="flex items-center gap-4">
              {['twitter', 'github', 'discord'].map((social) => (
                <div key={social} className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all cursor-pointer text-slate-400 hover:text-indigo-400">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current mask-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Marketplace', 'Register IP', 'Verification', 'Categories'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              {['Documentation', 'Developer API', 'Smart Contracts', 'Security Audit'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-400 mb-4">Get the latest on IP protection and blockchain trends.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <button className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500 capitalize">
            Built with ❤️ on Polygon • IPFS • EIP-2981
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
            <p className="text-xs text-slate-400 font-mono">© 2024 TrademarkChain</p>
          </div>
        </div>
      </div>
    </footer>
  );
}