import Link from 'next/link';

interface Category {
  name: string;
  icon: string;
  count: number;
  color: string;
}

const categories: Category[] = [
  { name: 'Technology', icon: '💻', count: 1234, color: 'from-blue-400 to-blue-600' },
  { name: 'Fashion & Apparel', icon: '👕', count: 856, color: 'from-pink-400 to-pink-600' },
  { name: 'Food & Beverage', icon: '🍔', count: 642, color: 'from-orange-400 to-orange-600' },
  { name: 'Healthcare', icon: '⚕️', count: 523, color: 'from-green-400 to-green-600' },
  { name: 'Automotive', icon: '🚗', count: 412, color: 'from-red-400 to-red-600' },
  { name: 'Entertainment', icon: '🎬', count: 789, color: 'from-purple-400 to-purple-600' },
  { name: 'Sports & Recreation', icon: '⚽', count: 345, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Home & Garden', icon: '🏡', count: 567, color: 'from-teal-400 to-teal-600' },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/marketplace?category=${encodeURIComponent(category.name)}`}
          className="group"
        >
          <div className="bg-os-dark-bg border border-os-dark-border rounded-xl p-6 hover:border-os-dark-accent hover:shadow-xl transition-all duration-300 cursor-pointer">
            {/* Icon with gradient background */}
            <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{category.icon}</span>
            </div>

            {/* Category Info */}
            <h3 className="text-sm font-semibold text-os-dark-text mb-1 group-hover:text-os-dark-accent transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-os-dark-text-tertiary">
              {category.count.toLocaleString()} items
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}