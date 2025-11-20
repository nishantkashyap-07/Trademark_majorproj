import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // ? - Show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(true);
      }

      // Escape - Close help
      if (e.key === 'Escape') {
        setShowHelp(false);
      }

      // G then H - Go to home
      if (e.key === 'g') {
        const nextKey = (event: KeyboardEvent) => {
          if (event.key === 'h') router.push('/');
          if (event.key === 'm') router.push('/marketplace');
          if (event.key === 'd') router.push('/dashboard');
          if (event.key === 'r') router.push('/register');
          window.removeEventListener('keydown', nextKey);
        };
        window.addEventListener('keydown', nextKey);
        setTimeout(() => window.removeEventListener('keydown', nextKey), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={() => setShowHelp(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Navigation</h3>
            <div className="space-y-2">
              <ShortcutItem keys={['G', 'H']} description="Go to Home" />
              <ShortcutItem keys={['G', 'M']} description="Go to Marketplace" />
              <ShortcutItem keys={['G', 'D']} description="Go to Dashboard" />
              <ShortcutItem keys={['G', 'R']} description="Go to Register" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Actions</h3>
            <div className="space-y-2">
              <ShortcutItem keys={['⌘', 'K']} description="Focus Search" />
              <ShortcutItem keys={['?']} description="Show Keyboard Shortcuts" />
              <ShortcutItem keys={['Esc']} description="Close Modals" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">?</kbd> anytime to see these shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcutItem({ keys, description }: { keys: string[], description: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index}>
            <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="mx-1 text-gray-400">then</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
