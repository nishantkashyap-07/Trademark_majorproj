import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVerification from '@/components/ProductVerification';
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
        <title>Product Verification - SloganChain</title>
        <meta name="description" content="Verify product authenticity using blockchain trademark verification" />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-10">

          {/* Hero Section */}
          <section className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-6 py-8 text-center text-slate-50 shadow-[0_18px_60px_rgba(15,23,42,0.8)]">
            <div className="mx-auto max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Verification Demo
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Verify product authenticity against on-chain trademarks
              </h1>
              <p className="text-sm text-slate-300">
                Click any demo product to run a full verification flow backed by Polygon and IPFS data.
              </p>
            </div>
          </section>

          {/* Verification Statistics */}
          <section className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-50">
            <h2 className="mb-8 text-center text-2xl font-semibold text-white">
              How SloganChain verifies products
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-900/90 p-5 text-center shadow-sm shadow-slate-950/60">
                <div className="mb-1 text-sm font-medium text-slate-400">Availability</div>
                <div className="text-3xl font-semibold text-emerald-400">24/7</div>
                <div className="mt-1 text-xs text-slate-400">Real-time checks</div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 p-5 text-center shadow-sm shadow-slate-950/60">
                <div className="mb-1 text-sm font-medium text-slate-400">Integrity</div>
                <div className="text-3xl font-semibold text-sky-400">100%</div>
                <div className="mt-1 text-xs text-slate-400">On-chain truth</div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 p-5 text-center shadow-sm shadow-slate-950/60">
                <div className="mb-1 text-sm font-medium text-slate-400">Speed</div>
                <div className="text-3xl font-semibold text-violet-400">&lt;2s</div>
                <div className="mt-1 text-xs text-slate-400">Average response</div>
              </div>

              <div className="rounded-2xl bg-slate-900/90 p-5 text-center shadow-sm shadow-slate-950/60">
                <div className="mb-1 text-sm font-medium text-slate-400">History</div>
                <div className="text-3xl font-semibold text-amber-300">∞</div>
                <div className="mt-1 text-xs text-slate-400">Permanent records</div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-900/90 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Verification flow
              </h3>
              <div className="space-y-3 text-sm text-slate-200">

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-semibold">Smart Contract Query:</span> System queries Polygon blockchain for trademark registration data</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-semibold">Ownership Verification:</span> Validates current owner address and registration authenticity</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-semibold">Metadata Retrieval:</span> Fetches complete trademark details from IPFS storage</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p><span className="font-semibold">Result Display:</span> Presents comprehensive verification results with full transparency</p>
                </div>
              </div>
            </div>
          </section>

          {/* Product Grid */}
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Demo products
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {mockProducts.map((product) => {
                const verificationResult = verificationResults[product.id];
                
                return (
                  <div
                    key={product.id}
                    className={`overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 cursor-pointer transition-all duration-200 ${
                      selectedProduct?.id === product.id 
                        ? 'ring-2 ring-sky-500 shadow-[0_18px_60px_rgba(8,47,73,0.9)]' 
                        : 'hover:border-slate-600 hover:shadow-[0_18px_40px_rgba(15,23,42,0.8)]'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-16 h-16 bg-slate-900/60 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm shadow-slate-950/80">

                          <span className="text-2xl">
                            {product.category === 'Technology' ? '📱' :
                             product.category === 'Fashion & Apparel' ? '👕' :
                             product.category === 'Food & Beverage' ? '🥤' : '📦'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-50">

                          {product.name}
                        </h3>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <p className="text-xs text-slate-300 mb-2 line-clamp-2">

                        {product.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="font-semibold text-slate-50">

                          ${product.price}
                        </span>
                        <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2 py-1 rounded-full">

                          {product.category}
                        </span>
                      </div>

                      {/* Verification Status */}
                      <div className="flex items-center justify-between">

                        {verificationResult ? (
                          <div className={`flex items-center text-[11px] ${
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
                          <span className="text-[11px] text-slate-400">Click to verify</span>

                        )}
                        
                        {product.trademarkId && (
                          <span className="text-[11px] text-sky-400 font-mono">

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
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-50 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Details */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">

                    Product Details
                  </h2>
                  
                  <div className="bg-slate-900/70 rounded-2xl p-6 border border-slate-800">

                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-slate-900/60 border border-slate-700 rounded-2xl flex items-center justify-center shadow-sm shadow-slate-950/70 mr-4">

                        <span className="text-3xl">
                          {selectedProduct.category === 'Technology' ? '📱' :
                           selectedProduct.category === 'Fashion & Apparel' ? '👕' :
                           selectedProduct.category === 'Food & Beverage' ? '🥤' : '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">

                          {selectedProduct.name}
                        </h3>
                        <p className="text-sm text-slate-400">{selectedProduct.category}</p>

                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-200 mb-4">{selectedProduct.description}</p>

                    
                    <div className="grid grid-cols-2 gap-4 text-xs">

                      <div>
                        <span className="font-medium text-slate-400">Price:</span>
                        <span className="ml-2 text-slate-50">${selectedProduct.price}</span>

                      </div>
                      <div>
                        <span className="font-medium text-slate-400">Product ID:</span>
                        <span className="ml-2 font-mono text-slate-50">{selectedProduct.id}</span>

                      </div>
                      {selectedProduct.trademarkId && (
                        <div>
                          <span className="font-medium text-slate-400">Trademark ID:</span>
                          <span className="ml-2 font-mono text-slate-50">#{selectedProduct.trademarkId}</span>

                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Component */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">

                    Blockchain Verification
                  </h2>
                  
                  <ProductVerification

                    productName={selectedProduct.name}
                    companyName="Demo Company" // In real app, this would come from product data
                    trademarkId={selectedProduct.trademarkId}
                    registrationNumber={selectedProduct.trademarkId ? `TM00${selectedProduct.trademarkId}234` : undefined}
                    onVerificationComplete={(result) => handleVerificationComplete(selectedProduct.id, result)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="mt-14 rounded-3xl border border-slate-800 bg-gradient-to-r from-sky-600 to-indigo-600 p-8 text-center text-white">
            <h2 className="text-2xl font-semibold mb-3">
              Ready to protect your brand?
            </h2>
            <p className="text-sm mb-6 opacity-90">
              Register your trademarks on-chain and unlock instant verification for every product.
            </p>
            <div className="flex justify-center gap-3 text-sm">
              <Link
                href="/register"
                className="rounded-full bg-white px-6 py-2.5 font-semibold text-sky-700 shadow-sm transition hover:bg-slate-50"
              >
                Register trademark
              </Link>
              <Link
                href="/marketplace"
                className="rounded-full border border-white/80 px-6 py-2.5 font-semibold text-white transition hover:bg-white/10"
              >
                Browse marketplace
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}