import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3ContextType } from '@/types';
import { DEFAULT_CHAIN, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected on page load
  useEffect(() => {
    // Only auto-connect if user hasn't manually disconnected
    const hasDisconnected = localStorage.getItem('walletDisconnected');
    if (!hasDisconnected) {
      checkConnection();
    }
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    // Reload the page to reset the dapp state
    window.location.reload();
  };

  const connect = async () => {
    try {
      setIsLoading(true);
      
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request wallet_requestPermissions to show account selector
      // This allows users to switch accounts or connect a different wallet
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permError: any) {
        // If user cancels permission request, throw error
        if (permError.code === 4001) {
          throw new Error(ERROR_MESSAGES.TRANSACTION_REJECTED);
        }
        // If wallet_requestPermissions not supported, fall back to eth_requestAccounts
        console.log('wallet_requestPermissions not supported, continuing with eth_requestAccounts');
      }
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Clear disconnect flag when user manually connects
      localStorage.removeItem('walletDisconnected');
      
      // Check if on correct network
      if (Number(network.chainId) !== DEFAULT_CHAIN.chainId) {
        await switchNetwork();
      }
      
      console.log(SUCCESS_MESSAGES.WALLET_CONNECTED);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        throw new Error(ERROR_MESSAGES.TRANSACTION_REJECTED);
      }
      // Provide more specific error message
      throw new Error(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    // Set flag to prevent auto-reconnect
    localStorage.setItem('walletDisconnected', 'true');
  };

  const switchNetwork = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${DEFAULT_CHAIN.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${DEFAULT_CHAIN.chainId.toString(16)}`,
                chainName: DEFAULT_CHAIN.name,
                rpcUrls: [DEFAULT_CHAIN.rpcUrl],
                nativeCurrency: DEFAULT_CHAIN.nativeCurrency,
                blockExplorerUrls: [DEFAULT_CHAIN.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw new Error('Failed to add network to MetaMask');
        }
      } else {
        console.error('Error switching network:', error);
        throw new Error('Failed to switch network');
      }
    }
  };

  const value: Web3ContextType = {
    account,
    chainId,
    isConnected,
    isLoading,
    connect,
    disconnect,
    switchNetwork,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}