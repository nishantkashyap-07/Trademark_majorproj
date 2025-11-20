import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import Toast from '@/components/Toast';

export default function BuyListing() {
  const router = useRouter();
  const { account, isConnected, connect } = useWeb3();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  return (
    <>
      <Head>
        <title>Buy Trademark - TrademarkChain</title>
      </Head>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold">Buy Trademark</h1>
        </div>
        <Footer />
      </div>
    </>
  );
}
