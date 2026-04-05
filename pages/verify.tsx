import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVerification from '@/components/ProductVerification';
import VerificationSystem from '@/components/VerificationSystem';
import { ProductData } from '@/types';

// Mock product data for demonstration
const mockProducts: ProductData[] = [
  {
    id: '1',
    name: 'TechPhone Pro',
    description: 'Latest smartphone with advanced AI features',
    category: 'Technology',
    price: 999,
    images: ['/api/placeholder/300/300'],
    trademarkId: 1,
    companyAddress: '0x1234567890123456789012345678901234567890',
    verified: true,
  },
  {
    id: '2',
    name: 'StyleWear Jacket',
    description: 'Premium leather jacket from luxury fashion brand',
    category: 'Fashion & Apparel',
    price: 299,
    images: ['/api/placeholder/300/300'],
    trademarkId: 2,
    companyAddress: '0x5678901234567890123456789012345678901234',
    verified: true,
  },
  {
    id: '3',
    name: 'EcoFresh Smoothie',
    description: 'Organic fruit smoothie with natural ingredients',
    category: 'Food & Beverage',
    price: 8,
    images: ['/api/placeholder/300/300'],
    trademarkId: 3,
    companyAddress: '0x9012345678901234567890123456789012345678',
    verified: false,
  },
  {
    id: '4',
    name: 'Generic Product',
    description: 'Product without trademark registration',
    category: 'Other',
    price: 25,
    images: ['/api/placeholder/300/300'],
    companyAddress: '0x0000000000000000000000000000000000000000',
    verified: false,
  },
];

export default function VerifyPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [verificationResults, setVerificationResults] = useState<{[key: string]: any}>({});

  const handleVerificationComplete = (productId: string, result: any) => {
    setVerificationResults(prev => ({
      ...prev,
      [productId]: result,
    }));
  };

  return (
    <>
      <Head>
        <title>Product Verification | TrademarkChain Protocol</title>
        <meta name="description" content="Verify product authenticity using blockchain trademark verification" />
      </Head>

      <Navbar />

      <main className="relative min-h-screen bg-[#05070a] pt-32 pb-20 overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container-custom relative z-10">

          {/* Hero Section */}
          <section className="mb-16 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 mb-4 tracking-widest uppercase">
                Blockchain Verification
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                Verify Trademark Authenticity
              </h1>
              <p className="text-lg text-slate-400 font-bold">
                Lookup trademarks by registration number or token ID. Generate QR codes for instant verification.
              </p>
            </div>
          </section>

          {/* Verification System */}
          <section className="mb-16">
            <VerificationSystem />
          </section>

          {/* Verification Statistics */}
          <section className="mb-16 glass-card !p-10">
            <h2 className="mb-12 text-center text-3xl font-black text-white uppercase tracking-tighter">
              How TrademarkChain Verifies Products
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-10">
              <div className="glass-card !p-6 text-center hover-glow">
                <div className="mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Availability</div>
                <div className="text-4xl font-black text-emerald-400">24/7</div>
                <div className="mt-2 text-xs text-slate-400 font-bold">Real-time checks</div>
              </div>

              <div className="glass-card !p-6 text-center hover-glow">
                <div className="mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity</div>
                <div className="text-4xl font-black text-cyan-400">100%</div>
                <div className="mt-2 text-xs text-slate-400 font-bold">On-chain truth</div>
              </div>

              <div className="glass-card !p-6 text-center hover-glow">
                <div className="mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Speed</div>
                <div className="text-4xl font-black text-indigo-400">&lt;2s</div>
                <div className="mt-2 text-xs text-slate-400 font-bold">Average response</div>
              </div>

              <div className="glass-card !p-6 text-center hover-glow">
                <div className="mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">History</div>
                <div className="text-4xl font-black text-amber-400">∞</div>
                <div className="mt-2 text-xs text-slate-400 font-bold">Permanent records</div>
              </div>
            </div>

            <div className="glass-card !p-8 bg-white/[0.02]">
              <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">
                Verification Flow
              </h3>
              <div className="space-y-4 text-sm text-slate-300 font-bold">

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-black text-white">Smart Contract Query:</span> System queries Polygon blockchain for trademark registration data</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-black text-white">Ownership Verification:</span> Validates current owner address and registration authenticity</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-black text-white">Metadata Retrieval:</span> Fetches complete trademark details from IPFS storage</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-black text-white">Result Display:</span> Presents comprehensive verification results with full transparency</p>
                </div>
              </div>
            </div>
          </section>

          {/* Product Grid */}
          <section className="mb-16">
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-500">
              Demo Products
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {mockProducts.map((product) => {
                const verificationResult = verificationResults[product.id];
                
                return (
                  <div
                    key={product.id}
                    className={`glass-card cursor-pointer transition-all duration-200 overflow-hidden ${
                      selectedProduct?.id === product.id 
                        ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' 
                        : 'hover-glow'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-indigo-900/20 via-indigo-800/10 to-indigo-900/20 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <span className="text-3xl">
                            {product.category === 'Technology' ? '📱' :
                             product.category === 'Fashion & Apparel' ? '👕' :
                             product.category === 'Food & Beverage' ? '🥤' : '📦'}
                          </span>
                        </div>
                        <h3 className="font-black text-white text-sm">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2 font-bold">
                        {product.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-4 text-sm">
                        <span className="font-black text-white">
                          ${product.price}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-full font-black uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>

                      {/* Verification Status */}
                      <div className="flex items-center justify-between">
                        {verificationResult ? (
                          <div className={`flex items-center text-xs font-black ${
                            verificationResult.isValid ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {verificationResult.isValid ? (
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            {verificationResult.isValid ? 'Verified' : 'Not Verified'}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-bold">Click to verify</span>
                        )}
                        
                        {product.trademarkId && (
                          <span className="text-xs text-indigo-400 font-mono font-black">
                            TM#{product.trademarkId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Verification Panel */}
          {selectedProduct && (
            <section className="glass-card !p-10 hover-glow">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Product Details */}
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
                    Product Details
                  </h2>
                  
                  <div className="glass-card !p-6 bg-white/[0.02]">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                        <span className="text-3xl">
                          {selectedProduct.category === 'Technology' ? '📱' :
                           selectedProduct.category === 'Fashion & Apparel' ? '👕' :
                           selectedProduct.category === 'Food & Beverage' ? '🥤' : '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-bold">{selectedProduct.category}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-6 font-bold">{selectedProduct.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-black text-slate-500 uppercase tracking-wider">Price:</span>
                        <span className="ml-2 text-white font-black">${selectedProduct.price}</span>
                      </div>
                      <div>
                        <span className="font-black text-slate-500 uppercase tracking-wider">Product ID:</span>
                        <span className="ml-2 font-mono text-white font-black">{selectedProduct.id}</span>
                      </div>
                      {selectedProduct.trademarkId && (
                        <div>
                          <span className="font-black text-slate-500 uppercase tracking-wider">Trademark ID:</span>
                          <span className="ml-2 font-mono text-white font-black">#{selectedProduct.trademarkId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Component */}
                <div>
                  <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
                    Blockchain Verification
                  </h2>
                  
                  <ProductVerification
                    productName={selectedProduct.name}
                    companyName="Demo Company"
                    trademarkId={selectedProduct.trademarkId}
                    registrationNumber={selectedProduct.trademarkId ? `TM00${selectedProduct.trademarkId}234` : undefined}
                    onVerificationComplete={(result) => handleVerificationComplete(selectedProduct.id, result)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="mt-20 glass-card bg-gradient-to-br from-indigo-900 via-indigo-600 to-indigo-900 !p-12 text-center border-white/20 shadow-lg shadow-indigo-500/20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">
              Ready to Protect Your Brand?
            </h2>
            <p className="text-base text-indigo-100 mb-8 opacity-90 font-bold max-w-2xl mx-auto">
              Register your trademarks on-chain and unlock instant verification for every product.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="btn-glass !bg-white !text-indigo-600 !px-8 hover:scale-105"
              >
                Register Trademark
              </Link>
              <Link
                href="/marketplace"
                className="btn-glass !border-white/40 !px-8 hover:scale-105"
              >
                Browse Marketplace
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
