import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="transition-colors duration-500 border-t py-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
      <div className="container-custom px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
               <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
               </div>
               <span className="font-bold tracking-tight text-slate-900 dark:text-white">TrademarkChain</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
               Universal ledger for authenticated brand identities and intellectual property defense on the Polygon network.
            </p>
            <div className="flex gap-4">
               {['twitter', 'github', 'discord'].map(social => (
                 <a key={social} href="#" className="w-8 h-8 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 flex items-center justify-center hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-slate-900/40 dark:bg-white/40 rounded-sm" /> 
                 </a>
               ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-primary)' }}>Product</h4>
            <ul className="space-y-4">
              {['Assets Index', 'Registry', 'Verify IP', 'Security Notifications'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm transition-colors hover:text-indigo-500" style={{ color: 'var(--text-secondary)' }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-primary)' }}>Company</h4>
            <ul className="space-y-4">
              {['About Universe', 'Governance', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm transition-colors hover:text-indigo-500" style={{ color: 'var(--text-secondary)' }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--text-primary)' }}>Status</h4>
            <div className="p-4 rounded-2xl border bg-slate-900/5 dark:bg-white/5" style={{ borderColor: 'var(--glass-border)' }}>
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Network Live</span>
               </div>
               <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  All systems operational. <br /> Latest Block: #19,402
               </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            © {currentYear} TrademarkChain Protocol . All Rights Reserved
          </p>
          <div className="flex gap-8">
            <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-indigo-500" style={{ color: 'var(--text-muted)' }}>Documentation</Link>
            <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-indigo-500" style={{ color: 'var(--text-muted)' }}>API Keys</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}