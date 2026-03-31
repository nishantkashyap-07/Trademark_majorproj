// Network Configuration
export const SUPPORTED_CHAINS = {
  LOCALHOST: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  POLYGON_MUMBAI: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://polygon-mumbai-bor-rpc.publicnode.com',
    fallbackRpcUrls: [
      'https://rpc.ankr.com/polygon_mumbai',
      'https://polygon-mumbai.gateway.tenderly.co',
      'https://rpc-mumbai.maticvigil.com',
    ],
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  POLYGON_AMOY: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    fallbackRpcUrls: [
      'https://polygon-amoy-bor-rpc.publicnode.com',
      'https://rpc.ankr.com/polygon_amoy',
    ],
    blockExplorer: 'https://amoy.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};

// Use localhost if RPC URL is set to localhost, otherwise use Mumbai
const isLocalhost = process.env.NEXT_PUBLIC_POLYGON_RPC_URL?.includes('127.0.0.1') || 
                    process.env.NEXT_PUBLIC_POLYGON_RPC_URL?.includes('localhost');

export const DEFAULT_CHAIN = isLocalhost ? SUPPORTED_CHAINS.LOCALHOST : SUPPORTED_CHAINS.POLYGON_MUMBAI;

// Contract Addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  TRADEMARK_NFT: process.env.NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS || '',
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || '',
};

// Slogan Categories
export const SLOGAN_CATEGORIES = [
  'Technology',
  'Fashion & Apparel',
  'Food & Beverage',
  'Healthcare',
  'Automotive',
  'Entertainment',
  'Sports & Recreation',
  'Home & Garden',
  'Beauty & Personal Care',
  'Financial Services',
  'Education',
  'Travel & Tourism',
  'Real Estate',
  'Manufacturing',
  'Other',
];

// Keep backward compatibility
export const TRADEMARK_CATEGORIES = SLOGAN_CATEGORIES;

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf'],
  MAX_FILES: 5,
};

// Royalty Constraints
export const ROYALTY_CONSTRAINTS = {
  MIN_PERCENTAGE: 1,
  MAX_PERCENTAGE: 25,
  DEFAULT_PERCENTAGE: 10,
};

// IPFS Configuration
export const IPFS_CONFIG = {
  GATEWAY_URLS: [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
  ],
  TIMEOUT: 10000, // 10 seconds
};

// UI Constants
export const ITEMS_PER_PAGE = 12;
export const DEBOUNCE_DELAY = 300;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  WRONG_NETWORK: 'Please switch to Polygon Mumbai testnet',
  TRANSACTION_REJECTED: 'Transaction was rejected by user',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  CONTRACT_ERROR: 'Smart contract execution failed',
  IPFS_UPLOAD_ERROR: 'Failed to upload files to IPFS',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload images or PDF files',
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  NETWORK_ERROR: 'Network connection error. Please try again',
  UNAUTHORIZED: 'You are not authorized to perform this action',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRADEMARK_REGISTERED: 'Trademark successfully registered on blockchain',
  LISTING_CREATED: 'Marketplace listing created successfully',
  PURCHASE_COMPLETED: 'Purchase completed successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
};