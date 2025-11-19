import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
        <title>Product Verification - TrademarkChain</title>
        <meta name="description" content="Verify product authenticity using blockchain trademark verification" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  TrademarkChain
                </Link>
                <p className="text-sm text-gray-600 mt-1">Product Verification Demo</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/marketplace" className="btn-secondary">
                  Marketplace
                </Link>
                <Link href="/register" className="btn-primary">
                  Register Trademark
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Product Verification Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how blockchain trademark verification works in practice. Click on any product 
              to verify its authenticity using our decentralized verification system.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How Verification Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Product
                </h3>
                <p className="text-gray-600">
                  Choose any product to verify its trademark authenticity
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Blockchain Query
                </h3>
                <p className="text-gray-600">
                  System queries smart contracts for trademark ownership and validity
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Instant Results
                </h3>
                <p className="text-gray-600">
                  Get immediate verification results with detailed trademark information
                </p>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {mockProducts.map((product) => {
              const verificationResult = verificationResults[product.id];
              
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
                    selectedProduct?.id === product.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                        <span className="text-2xl">
                          {product.category === 'Technology' ? '📱' :
                           product.category === 'Fashion & Apparel' ? '👕' :
                           product.category === 'Food & Beverage' ? '🥤' : '📦'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center justify-between">
                      {verificationResult ? (
                        <div className={`flex items-center text-xs ${
                          verificationResult.isValid ? 'text-green-600' : 'text-red-600'
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
                        <span className="text-xs text-gray-500">Click to verify</span>
                      )}
                      
                      {product.trademarkId && (
                        <span className="text-xs text-blue-600 font-mono">
                          TM#{product.trademarkId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification Panel */}
          {selectedProduct && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Product Details
                  </h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mr-4">
                        <span className="text-3xl">
                          {selectedProduct.category === 'Technology' ? '📱' :
                           selectedProduct.category === 'Fashion & Apparel' ? '👕' :
                           selectedProduct.category === 'Food & Beverage' ? '🥤' : '📦'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-gray-600">{selectedProduct.category}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{selectedProduct.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Price:</span>
                        <span className="ml-2 text-gray-900">${selectedProduct.price}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Product ID:</span>
                        <span className="ml-2 font-mono text-gray-900">{selectedProduct.id}</span>
                      </div>
                      {selectedProduct.trademarkId && (
                        <div>
                          <span className="font-medium text-gray-600">Trademark ID:</span>
                          <span className="ml-2 font-mono text-gray-900">#{selectedProduct.trademarkId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Component */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Protect Your Brand?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Register your trademarks on the blockchain and enable instant verification for your products.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                Register Trademark
              </Link>
              <Link href="/marketplace" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}