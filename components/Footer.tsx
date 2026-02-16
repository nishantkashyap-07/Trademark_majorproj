export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">TrademarkChain</p>
              <p className="text-xs text-gray-400">© 2024 All rights reserved</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="text-xs text-gray-400">
            Built on Polygon • Powered by IPFS
          </div>
        </div>
      </div>
    </footer>
  );
}