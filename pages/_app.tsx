import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { Web3Provider } from '@/contexts/Web3Context'
import { useEffect, useState } from 'react'
import Toast from '@/components/common/Toast'

export default function App({ Component, pageProps }: AppProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleWalletConnected = (e: any) => {
      setToast({ 
        message: `Wallet connected: ${e.detail.address.slice(0, 6)}...${e.detail.address.slice(-4)}`, 
        type: 'success' 
      });
    };

    const handleWalletDisconnected = () => {
      setToast({ message: 'Wallet disconnected', type: 'info' });
    };

    const handleUserLoggedIn = (e: any) => {
      setToast({ 
        message: `Welcome back, ${e.detail.name}!`, 
        type: 'success' 
      });
    };

    const handleUserLoggedOut = () => {
      setToast({ message: 'Logged out successfully', type: 'info' });
    };

    window.addEventListener('wallet-connected', handleWalletConnected);
    window.addEventListener('wallet-disconnected', handleWalletDisconnected);
    window.addEventListener('user-logged-in', handleUserLoggedIn);
    window.addEventListener('user-logged-out', handleUserLoggedOut);

    return () => {
      window.removeEventListener('wallet-connected', handleWalletConnected);
      window.removeEventListener('wallet-disconnected', handleWalletDisconnected);
      window.removeEventListener('user-logged-in', handleUserLoggedIn);
      window.removeEventListener('user-logged-out', handleUserLoggedOut);
    };
  }, []);

  return (
    <AuthProvider>
      <Web3Provider>
        <Component {...pageProps} />
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </Web3Provider>
    </AuthProvider>
  )
}