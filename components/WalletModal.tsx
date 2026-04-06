import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isLoading, account, chainId, isConnected } = useWeb3();
  const [step, setStep] = useState<'select' | 'connecting' | 'success' | 'error'>('select');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('0');
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);

  useEffect(() => {
    if (account && isOpen) {
      setStep('success');
      fetchBalance();
      // Auto-close after showing success
      const timer = setTimeout(() => {
        onClose();
        setStep('select'); // Reset for next time
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [account, isOpen]);

  useEffect(() => {
    // Reset state when modal closes
    if (!isOpen) {
      setStep('select');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for connection errors from Web3Context
    const handleConnectionError = (e: any) => {
      setError(e.detail.message);
      setStep('error');
    };

    const handleConnectionRejected = (e: any) => {
      setError(e.detail.message);
      setStep('error');
    };

    window.addEventListener('wallet-connection-error', handleConnectionError);
    window.addEventListener('wallet-connection-rejected', handleConnectionRejected);

    return () => {
      window.removeEventListener('wallet-connection-error', handleConnectionError);
      window.removeEventListener('wallet-connection-rejected', handleConnectionRejected);
    };
  }, []);

  const fetchBalance = async () => {
    if (typeof window !== 'undefined' && window.ethereum && account) {
      try {
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(account);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
      } catch (err) {
        console.error('Error fetching balance:', err);
      }
    }
  };

  const handleConnect = async (walletType: 'metamask') => {
    setStep('connecting');
    setError('');
    
    try {
      if (walletType === 'metamask') {
        if (typeof window === 'undefined' || !window.ethereum) {
          setError('MetaMask is not installed. Please install it from metamask.io');
          setStep('error');
          return;
        }
        
        // If already connected, request account switch
        if (isConnected && account) {
          setIsAccountSwitching(true);
          try {
            // Request MetaMask to show account selector
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('wallet_requestPermissions', [{ eth_accounts: {} }]);
            // This will trigger the accountsChanged event in Web3Context
          } catch (switchError: any) {
            if (switchError.code === 4001) {
              setError('Account switch cancelled');
            } else {
              setError('Failed to switch account');
            }
            setStep('error');
            setIsAccountSwitching(false);
            return;
          }
          setIsAccountSwitching(false);
        } else {
          // Normal connection flow
          await connect();
        }
        // Don't set success here - wait for account to be set via useEffect
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setStep('error');
      setIsAccountSwitching(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon Mainnet';
      case 80002: return 'Polygon Amoy Testnet';
      case 31337: return 'Hardhat Local';
      default: return 'Unknown Network';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {step === 'select' && 'Connect Wallet'}
            {step === 'connecting' && 'Connecting...'}
            {step === 'success' && 'Connected!'}
            {step === 'error' && 'Connection Failed'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm mb-6">
                {isConnected 
                  ? 'Switch to a different MetaMask account' 
                  : 'Choose your preferred wallet to connect to TrademarkChain'
                }
              </p>
              
              <button
                onClick={() => handleConnect('metamask')}
                disabled={isAccountSwitching}
                className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 40 40" fill="currentColor">
                      <path d="M36.1 5.9L22.3 16.2l2.6-6.1 11.2-4.2z"/>
                      <path d="M3.9 5.9l13.6 10.4-2.4-6.2L3.9 5.9zM30.8 28.8l-3.7 5.7 7.9 2.2 2.3-7.8-6.5-.1zM2.8 28.9l2.2 7.8 7.9-2.2-3.7-5.7-6.4.1z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white group-hover:text-orange-400 transition-colors">
                      {isConnected ? 'Switch MetaMask Account' : 'MetaMask'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isConnected 
                        ? 'Change to a different account' 
                        : 'Connect using MetaMask wallet'
                      }
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {isConnected && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-amber-300 mb-1">Currently Connected</p>
                      <p className="text-xs text-amber-400/70 font-mono">
                        {account?.slice(0, 10)}...{account?.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-blue-300 mb-1">How to Switch Accounts</p>
                    <p className="text-xs text-blue-400/70">
                      Click the button above and select a different account in MetaMask, or switch accounts directly in MetaMask extension.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-white font-bold mb-2">
                {isAccountSwitching ? 'Switching Account...' : 'Connecting to MetaMask'}
              </p>
              <p className="text-sm text-slate-400">
                {isAccountSwitching 
                  ? 'Select a different account in MetaMask' 
                  : 'Please approve the connection in your wallet'
                }
              </p>
            </div>
          )}

          {step === 'success' && account && (
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</span>
                  <button
                    onClick={copyAddress}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Copy
                  </button>
                </div>
                <p className="font-mono text-sm text-white break-all">{account}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Balance</p>
                  <p className="text-lg font-bold text-white">{balance} MATIC</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Network</p>
                  <p className="text-sm font-bold text-white">{getNetworkName(chainId)}</p>
                </div>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-white font-bold text-center mb-2">Connection Failed</p>
              <p className="text-sm text-slate-400 text-center mb-6">{error}</p>
              <button
                onClick={() => setStep('select')}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
