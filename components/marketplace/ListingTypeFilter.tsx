interface ListingTypeFilterProps {
  value: 'all' | 'sale' | 'license';
  onChange: (value: 'all' | 'sale' | 'license') => void;
}

export default function ListingTypeFilter({ value, onChange }: ListingTypeFilterProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('all')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          value === 'all'
            ? 'bg-white shadow-sm text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onChange('sale')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          value === 'sale'
            ? 'bg-white shadow-sm text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        For Sale
      </button>
      <button
        onClick={() => onChange('license')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          value === 'license'
            ? 'bg-white shadow-sm text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        For License
      </button>
    </div>
  );
}
