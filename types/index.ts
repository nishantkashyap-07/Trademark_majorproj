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
  duration?: number; // Duration in seconds for licenses
  active: boolean;
  createdAt: number;
  expiresAt?: number; // Listing expiration timestamp
}

export interface License {
  licenseId: number;
  tokenId: number;
  licensee: string;
  licensor: string;
  price: string;
  duration: number; // 0 = perpetual
  issuedAt: number;
  expiresAt: number; // 0 = perpetual
  active: boolean;
}

// Frontend Types
export interface SloganFormData {
  companyName: string;
  sloganText: string;
  registrationNumber: string;
  category: string;
  description: string;
  royaltyPercentage: number;
  language: string;
  usageContext: string;
  files: File[];
}

// Keep backward compatibility
export type TrademarkFormData = SloganFormData;

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

export interface SloganMetadata {
  tokenId: number;
  creatorAddress: string;
  companyName: string;
  sloganText: string;
  registrationNumber: string;
  category: string;
  description: string;
  ipfsHash: string;
  royaltyPercentage: number;
  createdAt: Date;
  transactionHash: string;
  verified: boolean;
  language?: string;
  usageContext?: string;
}

// Keep backward compatibility
export type TrademarkMetadata = SloganMetadata;

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

// Report Types
export interface Report {
  id: string;
  type: 'spam' | 'fraud' | 'copyright' | 'inappropriate' | 'other';
  targetId: string;
  targetType: 'trademark' | 'listing' | 'user';
  reason: string;
  description?: string;
  reporterAddress: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Suspension Types
export interface UserSuspension {
  address: string;
  suspended: boolean;
  suspendedAt?: Date;
  suspendedBy?: string;
  suspensionReason?: string;
  unsuspendedAt?: Date;
}

export interface ListingSuspension {
  listingId: string;
  suspended: boolean;
  suspendedAt?: Date;
  suspendedBy?: string;
  suspensionReason?: string;
  unsuspendedAt?: Date;
}