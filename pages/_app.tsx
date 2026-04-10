import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { Web3Provider } from '@/contexts/Web3Context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'
import Toast from '@/components/common/Toast'

export default function App({ Component, pageProps }: AppProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    // ... existing event listeners
  }, []);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}