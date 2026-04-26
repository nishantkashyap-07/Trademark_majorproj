import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3ContextType } from '@/types';
import { DEFAULT_CHAIN, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';
import { getTrademarkNFTContract, getMarketplaceContract } from '@/utils/contracts';
import { useAuth } from './AuthContext';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trademarkNFTContract, setTrademarkNFTContract] = useState<any | null>(null);
  const [marketplaceContract, setMarketplaceContract] = useState<any | null>(null);
  const [devMode, setDevModeState] = useState<boolean>(true); // Default to true (safe mode)
  const { updateProfile, isAuthenticated, user } = useAuth();

  // Check if wallet is already connected on page load
  useEffect(() => {
    // Load dev mode preference
    const savedDevMode = localStorage.getItem('devMode');
    if (savedDevMode !== null) {
      setDevModeState(savedDevMode === 'true');
    }
  }, []);
  
  // Listen for account and chain changes
  useEffect(() => {
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
          
          // Sync with backend if needed
          if (isAuthenticated && user && accounts[0].address) {
            updateProfile({ walletAddress: accounts[0].address });
          }

          // Initialize contracts
          const signer = await provider.getSigner();
          const nftContract = getTrademarkNFTContract(signer);
          const marketplace = getMarketplaceContract(signer);
          setTrademarkNFTContract(nftContract);
          setMarketplaceContract(marketplace);
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
      
      // Simple connection request - no permissions needed
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Try to get network, but don't fail if RPC is down
      let networkChainId = null;
      try {
        const network = await provider.getNetwork();
        networkChainId = Number(network.chainId);
      } catch (networkError) {
        console.warn('Could not fetch network info, using MetaMask chainId:', networkError);
        // Get chainId directly from MetaMask
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        networkChainId = parseInt(chainIdHex, 16);
      }
      
      setAccount(address);
      setChainId(networkChainId);
      setIsConnected(true);
      
      // Initialize contracts
      const nftContract = getTrademarkNFTContract(signer);
      const marketplace = getMarketplaceContract(signer);
      setTrademarkNFTContract(nftContract);
      setMarketplaceContract(marketplace);
      
      // Clear disconnect flag when user manually connects
      localStorage.removeItem('walletDisconnected');
      
      // Show success notification
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('wallet-connected', { 
          detail: { address, chainId: networkChainId } 
        });
        window.dispatchEvent(event);
      }

      // Sync with backend profile if logged in
      if (isAuthenticated && user && address) {
        await updateProfile({ walletAddress: address });
      }
      
      // Force switch to correct network if needed
      if (networkChainId && networkChainId !== DEFAULT_CHAIN.chainId) {
        console.log(`Connected to chain ${networkChainId}, expected ${DEFAULT_CHAIN.chainId}. Switching...`);
        await switchNetwork();
      }
      
      console.log(SUCCESS_MESSAGES.WALLET_CONNECTED);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // User rejected the request
      if (error.code === 4001) {
        console.log('User rejected connection');
        // Dispatch rejection event for modal to handle
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('wallet-connection-rejected', { 
            detail: { message: 'Connection request was rejected' } 
          });
          window.dispatchEvent(event);
        }
        return; // Don't throw, just exit silently
      }
      
      // Already processing request
      if (error.code === -32002) {
        console.log('Connection request already pending');
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('wallet-connection-error', { 
            detail: { message: 'Connection request already pending in MetaMask' } 
          });
          window.dispatchEvent(event);
        }
        return; // Don't throw, just exit silently
      }
      
      // Log the full error for debugging
      console.error('Full error:', {
        code: error.code,
        message: error.message,
        data: error.data
      });
      
      // Dispatch error event for other errors
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('wallet-connection-error', { 
          detail: { message: error.message || 'Failed to connect wallet' } 
        });
        window.dispatchEvent(event);
      }
      
      // Only throw for unexpected errors
      if (error.code !== 4001 && error.code !== -32002) {
        throw new Error(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setTrademarkNFTContract(null);
    setMarketplaceContract(null);
    
    // Set flag to prevent auto-reconnect
    localStorage.setItem('walletDisconnected', 'true');
    
    // Note: We cannot programmatically disconnect from MetaMask
    // MetaMask maintains the connection permission until user manually revokes it
    // This is standard Web3 behavior for security reasons
    
    // Show disconnect notification
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('wallet-disconnected');
      window.dispatchEvent(event);
    }
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

  const setDevMode = (value: boolean) => {
    setDevModeState(value);
    localStorage.setItem('devMode', value.toString());
    
    // If turning off dev mode, encourage switching to Polygon
    if (!value && chainId === 31337) {
      console.log("Dev mode disabled. You should switch to Polygon network.");
    }
  };

  const value: Web3ContextType = {
    account,
    chainId,
    isConnected,
    isLoading,
    devMode,
    connect,
    disconnect,
    switchNetwork,
    setDevMode,
    trademarkNFTContract,
    marketplaceContract,
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