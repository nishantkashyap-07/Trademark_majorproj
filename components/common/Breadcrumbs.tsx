import Link from 'next/link';
import { useRouter } from 'next/router';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter(segment => segment);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Protocols', href: '/' }
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    if (segment.startsWith('[')) return;
    const label = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    breadcrumbs.push({ label, href: currentPath });
  });

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 mb-10 overflow-x-auto whitespace-nowrap py-2" aria-label="Tracking">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          {index > 0 && (
            <div className="w-1 h-1 bg-white/10 rounded-full mx-1" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest hover:text-white transition-colors px-2 py-1">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
