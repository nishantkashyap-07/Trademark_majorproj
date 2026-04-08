interface LicenseAvailableBadgeProps {
  available: boolean;
  count?: number;
}

export default function LicenseAvailableBadge({ available, count }: LicenseAvailableBadgeProps) {
  if (!available) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full">
      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-xs font-semibold text-purple-700">
        {count && count > 0 ? `${count} License${count > 1 ? 's' : ''} Available` : 'Available for License'}
      </span>
    </div>
  );
}
