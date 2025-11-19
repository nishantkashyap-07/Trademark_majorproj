// Blockchain Types
export interface Trademark {
  tokenId: number;
  creator: string;
  ipfsHash: string;
  category: string;
  royaltyBps: number;
  createdAt: number;
}

export interface Listing {
  listingId: number;
  tokenId: number;
  seller: string;
  price: string;
  isLicense: boolean;
  active: boolean;
  createdAt: number;
}

// Frontend Types
export interface TrademarkFormData {
  companyName: string;
  trademarkName: string;
  registrationNumber: string;
  category: string;
  description: string;
  royaltyPercentage: number;
  files: File[];
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  trademarkId?: number;
  companyAddress: string;
  verified: boolean;
}

// Database Types
export interface UserProfile {
  address: string;
  companyName?: string;
  displayName?: string;
  email?: string;
  createdAt: Date;
  totalTrademarks: number;
  totalProducts: number;
  verified: boolean;
}

export interface TrademarkMetadata {
  tokenId: number;
  creatorAddress: string;
  companyName: string;
  trademarkName: string;
  registrationNumber: string;
  category: string;
  description: string;
  ipfsHash: string;
  royaltyPercentage: number;
  createdAt: Date;
  transactionHash: string;
  verified: boolean;
}

// Web3 Context Types
export interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

// IPFS Types
export interface IPFSMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  company: string;
  registrationNumber: string;
  category: string;
  files: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VerificationResult {
  isValid: boolean;
  trademark: TrademarkMetadata | null;
  owner: string | null;
  message: string;
}