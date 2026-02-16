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
  owner: string; // Current owner address
  price: string;
  type: 'sale' | 'license'; // More explicit than isLicense boolean
  isLicense: boolean; // Keep for backward compatibility
  duration?: number; // Duration in seconds for licenses
  licenseDuration?: number; // Explicit license duration field
  active: boolean;
  status: 'active' | 'sold' | 'cancelled' | 'expired' | 'suspended';
  suspended: boolean;
  suspensionReason?: string;
  createdAt: number;
  updatedAt?: number;
  expiresAt?: number; // Listing expiration timestamp
  soldAt?: number;
  views?: number; // View count
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

// Database Types (aligned with class diagram)
export interface UserProfile {
  address: string;
  companyName?: string;
  displayName?: string;
  email?: string;
  role: 'buyer' | 'creator' | 'admin';
  walletAddress: string; // Explicit wallet address field
  createdAt: Date;
  updatedAt: Date;
  totalTrademarks: number;
  totalProducts: number;
  totalSales: number;
  totalPurchases: number;
  verified: boolean;
  suspended: boolean;
  suspensionReason?: string;
  averageRating?: number;
  ratingCount: number;
  profileImage?: string;
}

export interface SloganMetadata {
  tokenId: number;
  creatorAddress: string;
  currentOwner?: string; // Current owner if transferred
  companyName: string;
  sloganText: string;
  registrationNumber: string;
  category: string;
  description: string;
  ipfsHash: string;
  royaltyPercentage: number;
  createdAt: Date;
  updatedAt?: Date;
  transactionHash: string;
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string; // Admin address who verified
  verifiedAt?: Date;
  rejectionReason?: string;
  language?: string;
  usageContext?: string;
  views?: number;
  listingCount?: number;
  salesCount?: number;
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

// Rating Types (from class diagram)
export interface Rating {
  id: string;
  creatorAddress: string;
  trademarkId: number;
  rating: number; // 1-5
  review?: string;
  reviewerAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types (from class diagram)
export interface Notification {
  id: string;
  userId: string; // User wallet address
  type: 'rating' | 'listing' | 'sale' | 'license' | 'report' | 'admin' | 'verification';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string; // Related entity ID (trademark, listing, etc.)
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

// Category Types (from class diagram)
export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  trademarkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// AdminLog Types (from class diagram)
export interface AdminLog {
  id: string;
  adminAddress: string;
  action: 'verify' | 'reject' | 'suspend_user' | 'suspend_listing' | 'resolve_report' | 'dismiss_report';
  targetType: 'trademark' | 'listing' | 'user' | 'report';
  targetId: string;
  reason?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Transaction Types (from class diagram - enhanced)
export interface Transaction {
  id: string;
  type: 'registration' | 'listing' | 'sale' | 'license' | 'royalty';
  tokenId?: number;
  listingId?: number;
  fromAddress: string;
  toAddress: string;
  amount?: string; // Wei amount as string
  royaltyAmount?: string;
  transactionHash: string;
  transactionType: 'mint' | 'transfer' | 'purchase' | 'license';
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  createdAt: Date;
  confirmedAt?: Date;
}