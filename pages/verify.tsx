import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProductVerification from '@/components/registry/ProductVerification';
import VerificationSystem from '@/components/registry/VerificationSystem';
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
  const [verificationResults, setVerificationResults] = useState<{ [key: string]: any }>({});

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

      <main className="relative min-h-screen transition-colors duration-500 pt-32 pb-20 overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-custom relative z-10">

          {/* Verification System */}
          <section className="mb-16">
            <VerificationSystem />
          </section>

          {/* Refined Stats Section */}
          <section className="mb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Availability', value: '24/7', desc: 'Global access', color: 'text-emerald-500' },
                { label: 'Integrity', value: '100%', desc: 'On-chain truth', color: 'text-cyan-500' },
                { label: 'Speed', value: '< 2s', desc: 'Fast validation', color: 'text-indigo-500' },
                { label: 'Security', value: 'AES', desc: 'End-to-end', color: 'text-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="glass-card !p-8 !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 hover:!bg-white/50 dark:hover:!bg-white/[0.02] hover-glow">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{stat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20 glass-card !p-12 !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 hover:!bg-white/50 dark:hover:!bg-white/[0.02] hover:!translate-y-0">
            <h3 className="mb-10 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 italic">
              Security Protocol Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { title: 'Smart Contract Query', desc: 'System queries the blockchain for real-time registration data' },
                { title: 'Ownership Validation', desc: 'Authenticates owner addresses and registration validity' },
                { title: 'Metadata Retrieval', desc: 'Fetches complete trademark artifacts from decentralized storage' },
                { title: 'Transparency Layer', desc: 'Presents comprehensive results with permanent audit trails' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Product Grid */}
          <section className="mb-20">
            <h2 className="mb-10 text-sm font-bold uppercase tracking-widest text-slate-400 italic">
              Sample Inventory
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {mockProducts.map((product) => {
                const verificationResult = verificationResults[product.id];

                return (
                  <div
                    key={product.id}
                    className={`glass-card !p-0 cursor-pointer transition-all duration-300 overflow-hidden !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 hover:!bg-white/50 dark:hover:!bg-white/[0.02] ${selectedProduct?.id === product.id
                      ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20 -translate-y-2'
                      : 'hover:-translate-y-1 hover:shadow-xl'
                      }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-slate-50 dark:bg-white/5 flex items-center justify-center relative group">
                      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-white/5 transition-transform duration-500 group-hover:scale-110">
                        <span className="text-4xl text-slate-800 dark:text-white">
                          {product.category === 'Technology' ? '📱' :
                            product.category === 'Fashion & Apparel' ? '👕' :
                              product.category === 'Food & Beverage' ? '🥤' : '📦'}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 capitalize">
                        <span className="text-[9px] font-bold text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-full border border-slate-100 dark:border-white/5 leading-none">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-1 font-medium">
                        ${product.price} • {product.description}
                      </p>

                      {/* Verification Status */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        {verificationResult ? (
                          <div className={`flex items-center text-[10px] font-bold uppercase tracking-widest ${verificationResult.isValid ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                            {verificationResult.isValid ? 'Verified' : 'Invalid'}
                          </div>
                        ) : (
                          <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">Awaiting Scan</span>
                        )}

                        {product.trademarkId && (
                          <span className="text-[10px] text-slate-400 font-mono font-bold">
                            #{product.trademarkId}
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
            <section className="glass-card !p-12 !bg-white/50 dark:!bg-white/[0.02] !border-slate-200 dark:!border-white/10 shadow-2xl animate-slide-up hover:!bg-white/50 dark:hover:!bg-white/[0.02] hover:!translate-y-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Product Details */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
                    Product Specification
                  </h2>

                  <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center mb-8">
                      <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl mr-6 border border-slate-100 dark:border-white/5">
                        <span className="text-4xl text-slate-800 dark:text-white">
                          {selectedProduct.category === 'Technology' ? '📱' :
                            selectedProduct.category === 'Fashion & Apparel' ? '👕' :
                              selectedProduct.category === 'Food & Beverage' ? '🥤' : '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">{selectedProduct.category}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-4">{selectedProduct.description}</p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Market Price</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">${selectedProduct.price}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Artifact ID</p>
                        <p className="text-base font-mono font-bold text-slate-700 dark:text-slate-300">#0{selectedProduct.id}</p>
                      </div>
                      {selectedProduct.trademarkId && (
                        <div className="space-y-1 col-span-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Registered Protocol</p>
                          <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">TM-P00{selectedProduct.trademarkId}-V2</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Component */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
                    On-Chain Validation
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
        </div>
      </main>

      <Footer />
    </>
  );
}
