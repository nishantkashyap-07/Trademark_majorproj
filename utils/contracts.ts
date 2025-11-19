import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './constants';
import { Trademark, Listing } from '@/types';

// Contract ABIs (simplified for key functions)
const TRADEMARK_NFT_ABI = [
  "function registerTrademark(string memory companyName, string memory trademarkName, string memory registrationNumber, string memory ipfsHash, string memory category, uint96 royaltyBps, string memory tokenURI) external returns (uint256)",
  "function getTrademarkInfo(uint256 tokenId) external view returns (tuple(uint256 tokenId, address creator, string companyName, string trademarkName, string registrationNumber, string ipfsHash, string category, uint96 royaltyBps, uint256 createdAt, bool verified))",
  "function getTrademarkByRegistration(string memory registrationNumber) external view returns (uint256)",
  "function getOwnerTrademarks(address owner) external view returns (uint256[])",
  "function isRegistrationNumberUsed(string memory registrationNumber) external view returns (bool)",
  "function verifyTrademark(uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256)",
  "function getCurrentTokenId() external view returns (uint256)",
  "event TrademarkRegistered(uint256 indexed tokenId, address indexed creator, string companyName, string trademarkName, string registrationNumber, string category, string ipfsHash)"
];

const MARKETPLACE_ABI = [
  "function createListing(uint256 tokenId, uint256 price, bool isLicense, uint256 duration, uint256 expiresAt) external returns (uint256)",
  "function buyTrademark(uint256 listingId) external payable",
  "function licenseTrademark(uint256 listingId, uint256 duration) external payable",
  "function cancelListing(uint256 listingId) external",
  "function getActiveListingsForToken(uint256 tokenId) external view returns (uint256[])",
  "function getLicensesForToken(uint256 tokenId) external view returns (tuple(uint256 licenseId, uint256 tokenId, address licensee, address licensor, uint256 price, uint256 duration, uint256 issuedAt, uint256 expiresAt, bool active)[])",
  "function hasActiveLicense(uint256 tokenId, address user) external view returns (bool)",
  "function listings(uint256 listingId) external view returns (tuple(uint256 listingId, uint256 tokenId, address seller, uint256 price, bool isLicense, bool active, uint256 createdAt, uint256 expiresAt))",
  "function getCurrentListingId() external view returns (uint256)",
  "event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price, bool isLicense, uint256 expiresAt)",
  "event TrademarkSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price, uint256 royaltyAmount, uint256 marketplaceFeeAmount)",
  "event TrademarkLicensed(uint256 indexed listingId, uint256 indexed tokenId, address indexed licensee, address licensor, uint256 price, uint256 duration)"
];

/**
 * Get contract instances
 */
export function getContracts(signer?: ethers.Signer) {
  if (typeof window === 'undefined') {
    throw new Error('Contracts can only be accessed in browser environment');
  }

  const provider = signer || new ethers.BrowserProvider(window.ethereum);
  
  const trademarkNFT = new ethers.Contract(
    CONTRACT_ADDRESSES.TRADEMARK_NFT,
    TRADEMARK_NFT_ABI,
    provider
  );
  
  const marketplace = new ethers.Contract(
    CONTRACT_ADDRESSES.MARKETPLACE,
    MARKETPLACE_ABI,
    provider
  );
  
  return { trademarkNFT, marketplace };
}

/**
 * Register a new trademark
 */
export async function registerTrademark(
  signer: ethers.Signer,
  trademarkData: {
    companyName: string;
    trademarkName: string;
    registrationNumber: string;
    ipfsHash: string;
    category: string;
    royaltyPercentage: number;
    tokenURI: string;
  }
): Promise<{ tokenId: number; transactionHash: string }> {
  try {
    const { trademarkNFT } = getContracts(signer);
    
    // Convert royalty percentage to basis points
    const royaltyBps = Math.floor(trademarkData.royaltyPercentage * 100);
    
    const tx = await trademarkNFT.registerTrademark(
      trademarkData.companyName,
      trademarkData.trademarkName,
      trademarkData.registrationNumber,
      trademarkData.ipfsHash,
      trademarkData.category,
      royaltyBps,
      trademarkData.tokenURI
    );
    
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    
    // Extract token ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = trademarkNFT.interface.parseLog(log);
        return parsed?.name === 'TrademarkRegistered';
      } catch {
        return false;
      }
    });
    
    if (!event) {
      throw new Error('TrademarkRegistered event not found');
    }
    
    const parsedEvent = trademarkNFT.interface.parseLog(event);
    const tokenId = Number(parsedEvent?.args[0]);
    
    return {
      tokenId,
      transactionHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error registering trademark:', error);
    throw new Error(error.reason || error.message || 'Failed to register trademark');
  }
}

/**
 * Get trademark information by token ID
 */
export async function getTrademarkInfo(tokenId: number): Promise<Trademark> {
  try {
    const { trademarkNFT } = getContracts();
    const info = await trademarkNFT.getTrademarkInfo(tokenId);
    
    return {
      tokenId: Number(info.tokenId),
      creator: info.creator,
      ipfsHash: info.ipfsHash,
      category: info.category,
      royaltyBps: Number(info.royaltyBps),
      createdAt: Number(info.createdAt),
    };
  } catch (error: any) {
    console.error('Error getting trademark info:', error);
    throw new Error('Failed to get trademark information');
  }
}

/**
 * Check if registration number is already used
 */
export async function isRegistrationNumberUsed(registrationNumber: string): Promise<boolean> {
  try {
    const { trademarkNFT } = getContracts();
    return await trademarkNFT.isRegistrationNumberUsed(registrationNumber);
  } catch (error: any) {
    console.error('Error checking registration number:', error);
    return false;
  }
}

/**
 * Get trademarks owned by an address
 */
export async function getOwnerTrademarks(ownerAddress: string): Promise<number[]> {
  try {
    const { trademarkNFT } = getContracts();
    const tokenIds = await trademarkNFT.getOwnerTrademarks(ownerAddress);
    return tokenIds.map((id: any) => Number(id));
  } catch (error: any) {
    console.error('Error getting owner trademarks:', error);
    return [];
  }
}

/**
 * Verify trademark ownership
 */
export async function verifyTrademarkOwnership(
  tokenId: number,
  expectedOwner: string
): Promise<boolean> {
  try {
    const { trademarkNFT } = getContracts();
    const actualOwner = await trademarkNFT.ownerOf(tokenId);
    return actualOwner.toLowerCase() === expectedOwner.toLowerCase();
  } catch (error: any) {
    console.error('Error verifying ownership:', error);
    return false;
  }
}

/**
 * Create a marketplace listing
 */
export async function createListing(
  signer: ethers.Signer,
  listingData: {
    tokenId: number;
    price: string; // Price in ETH
    isLicense: boolean;
    duration?: number; // Duration in seconds for licenses
    expiresAt?: number; // Listing expiration timestamp
  }
): Promise<{ listingId: number; transactionHash: string }> {
  try {
    const { marketplace } = getContracts(signer);
    
    const priceWei = ethers.parseEther(listingData.price);
    const duration = listingData.duration || 0;
    const expiresAt = listingData.expiresAt || 0;
    
    const tx = await marketplace.createListing(
      listingData.tokenId,
      priceWei,
      listingData.isLicense,
      duration,
      expiresAt
    );
    
    console.log('Listing transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Listing transaction confirmed:', receipt);
    
    // Extract listing ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = marketplace.interface.parseLog(log);
        return parsed?.name === 'ListingCreated';
      } catch {
        return false;
      }
    });
    
    if (!event) {
      throw new Error('ListingCreated event not found');
    }
    
    const parsedEvent = marketplace.interface.parseLog(event);
    const listingId = Number(parsedEvent?.args[0]);
    
    return {
      listingId,
      transactionHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error creating listing:', error);
    throw new Error(error.reason || error.message || 'Failed to create listing');
  }
}

/**
 * Buy a trademark from marketplace
 */
export async function buyTrademark(
  signer: ethers.Signer,
  listingId: number,
  price: string
): Promise<string> {
  try {
    const { marketplace } = getContracts(signer);
    
    const priceWei = ethers.parseEther(price);
    
    const tx = await marketplace.buyTrademark(listingId, {
      value: priceWei,
    });
    
    console.log('Purchase transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Purchase transaction confirmed:', receipt);
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error buying trademark:', error);
    throw new Error(error.reason || error.message || 'Failed to buy trademark');
  }
}

/**
 * License a trademark from marketplace
 */
export async function licenseTrademark(
  signer: ethers.Signer,
  listingId: number,
  price: string,
  duration: number
): Promise<string> {
  try {
    const { marketplace } = getContracts(signer);
    
    const priceWei = ethers.parseEther(price);
    
    const tx = await marketplace.licenseTrademark(listingId, duration, {
      value: priceWei,
    });
    
    console.log('License transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('License transaction confirmed:', receipt);
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error licensing trademark:', error);
    throw new Error(error.reason || error.message || 'Failed to license trademark');
  }
}

/**
 * Get active listings for a token
 */
export async function getActiveListingsForToken(tokenId: number): Promise<number[]> {
  try {
    const { marketplace } = getContracts();
    const listingIds = await marketplace.getActiveListingsForToken(tokenId);
    return listingIds.map((id: any) => Number(id));
  } catch (error: any) {
    console.error('Error getting active listings:', error);
    return [];
  }
}

/**
 * Get listing information
 */
export async function getListingInfo(listingId: number): Promise<Listing> {
  try {
    const { marketplace } = getContracts();
    const info = await marketplace.listings(listingId);
    
    return {
      listingId: Number(info.listingId),
      tokenId: Number(info.tokenId),
      seller: info.seller,
      price: ethers.formatEther(info.price),
      isLicense: info.isLicense,
      active: info.active,
      createdAt: Number(info.createdAt),
    };
  } catch (error: any) {
    console.error('Error getting listing info:', error);
    throw new Error('Failed to get listing information');
  }
}

/**
 * Check if user has active license for a token
 */
export async function hasActiveLicense(tokenId: number, userAddress: string): Promise<boolean> {
  try {
    const { marketplace } = getContracts();
    return await marketplace.hasActiveLicense(tokenId, userAddress);
  } catch (error: any) {
    console.error('Error checking license:', error);
    return false;
  }
}

/**
 * Get royalty information for a token
 */
export async function getRoyaltyInfo(
  tokenId: number,
  salePrice: string
): Promise<{ receiver: string; royaltyAmount: string }> {
  try {
    const { trademarkNFT } = getContracts();
    const salePriceWei = ethers.parseEther(salePrice);
    const [receiver, royaltyAmountWei] = await trademarkNFT.royaltyInfo(tokenId, salePriceWei);
    
    return {
      receiver,
      royaltyAmount: ethers.formatEther(royaltyAmountWei),
    };
  } catch (error: any) {
    console.error('Error getting royalty info:', error);
    throw new Error('Failed to get royalty information');
  }
}