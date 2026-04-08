import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container-custom px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
               </div>
               <span className="font-bold text-white tracking-tight">TrademarkChain</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
               Universal ledger for authenticated brand identities and intellectual property defense on the Polygon network.
            </p>
            <div className="flex gap-4">
               {['twitter', 'github', 'discord'].map(social => (
                 <a key={social} href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-white/40" /> {/* Placeholder for icons */}
                 </a>
               ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Product</h4>
            <ul className="space-y-4">
              {['Assets Index', 'Registry', 'Verify IP', 'Security Notifications'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Universe', 'Governance', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">Status</h4>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Network Live</span>
               </div>
               <p className="text-[10px] text-white/40 leading-relaxed">
                  All systems operational. <br /> Latest Block: #19,402
               </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em]">
            © {currentYear} TrademarkChain Protocol . All Rights Reserved
          </p>
          <div className="flex gap-8">
            <Link href="/terms" className="text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors">Documentation</Link>
            <Link href="/privacy" className="text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors">API Keys</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}