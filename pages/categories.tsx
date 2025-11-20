import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Category {
  name: string;
  icon: string;
  count: number;
  description: string;
  color: string;
  gradient: string;
}

const categories: Category[] = [
  {
    name: 'Technology',
    icon: '💻',
    count: 1234,
    description: 'Software, hardware, and tech innovations',
    color: 'text-blue-600',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Fashion & Apparel',
    icon: '👕',
    count: 856,
    description: 'Clothing, accessories, and fashion brands',
    color: 'text-pink-600',
    gradient: 'from-pink-400 to-pink-600',
  },
  {
    name: 'Food & Beverage',
    icon: '🍔',
    count: 642,
    description: 'Restaurants, food products, and beverages',
    color: 'text-orange-600',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    name: 'Healthcare',
    icon: '⚕️',
    count: 523,
    description: 'Medical services, pharmaceuticals, and wellness',
    color: 'text-green-600',
    gradient: 'from-green-400 to-green-600',
  },
  {
    name: 'Automotive',
    icon: '🚗',
    count: 412,
    description: 'Vehicles, parts, and automotive services',
    color: 'text-red-600',
    gradient: 'from-red-400 to-red-600',
  },
  {
    name: 'Entertainment',
    icon: '🎬',
    count: 789,
    description: 'Media, gaming, and entertainment brands',
    color: 'text-purple-600',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    name: 'Sports & Recreation',
    icon: '⚽',
    count: 345,
    description: 'Sports equipment, fitness, and recreation',
    color: 'text-yellow-600',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  {
    name: 'Home & Garden',
    icon: '🏡',
    count: 567,
    description: 'Home improvement, furniture, and gardening',
    color: 'text-teal-600',
    gradient: 'from-teal-400 to-teal-600',
  },
  {
    name: 'Beauty & Personal Care',
    icon: '💄',
    count: 423,
    description: 'Cosmetics, skincare, and personal care products',
    color: 'text-rose-600',
    gradient: 'from-rose-400 to-rose-600',
  },
  {
    name: 'Financial Services',
    icon: '💰',
    count: 298,
    description: 'Banking, insurance, and financial products',
    color: 'text-emerald-600',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  {
    name: 'Education',
    icon: '📚',
    count: 387,
    description: 'Educational institutions and learning platforms',
    color: 'text-indigo-600',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  {
    name: 'Travel & Tourism',
    icon: '✈️',
    count: 276,
    description: 'Travel agencies, hotels, and tourism services',
    color: 'text-cyan-600',
    gradient: 'from-cyan-400 to-cyan-600',
  },
];

export default function Categories() {
  const totalTrademarks = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <>
      <Head>
        <title>Categories - TrademarkChain</title>
        <meta name="description" content="Browse trademarks by category across different industries" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore {totalTrademarks.toLocaleString()} verified trademarks across {categories.length} different industries
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/marketplace?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-4xl">{category.icon}</span>
                  </div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold mb-2 group-hover:${category.color} transition-colors`}>
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      {category.count.toLocaleString()} trademarks
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Industry Insights */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
              <p className="text-lg text-gray-600">Comprehensive trademark protection across all major industries</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
                <div className="text-5xl font-bold text-blue-600 mb-3">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Industry Categories</div>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
                <div className="text-5xl font-bold text-green-600 mb-3">
                  {totalTrademarks.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">Registered Trademarks</div>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
                <div className="text-5xl font-bold text-purple-600 mb-3">
                  5,000+
                </div>
                <div className="text-sm text-gray-600 font-medium">Active Companies</div>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center shadow-md border border-gray-200">
                <div className="text-5xl font-bold text-orange-600 mb-3">
                  100%
                </div>
                <div className="text-sm text-gray-600 font-medium">Blockchain Verified</div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Most Active Categories</h3>
              <div className="space-y-4">
                {categories
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{category.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">trademarks</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Don't See Your Category?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              We're constantly adding new categories. Register your trademark today and help us expand our platform.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              Register Your Trademark
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}