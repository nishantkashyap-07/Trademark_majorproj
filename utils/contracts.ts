import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './constants';
import { Trademark, Listing } from '@/types';

/**
 * Creates a BrowserProvider with a static network to prevent
 * ethers.js from polling eth_blockNumber (which causes RPC errors on testnets).
 */
export function getStaticProvider(): ethers.BrowserProvider {
  const AMOY_NETWORK = new ethers.Network('polygon-amoy', 80002);
  return new ethers.BrowserProvider(window.ethereum, AMOY_NETWORK, { staticNetwork: AMOY_NETWORK });
}

// Contract ABIs (simplified for key functions)
const TRADEMARK_NFT_ABI = [
  "function registerTrademark(string memory companyName, string memory trademarkName, string memory registrationNumber, string memory ipfsHash, string memory category, uint96 royaltyBps, string memory tokenURI) external returns (uint256)",
  "function getTrademarkInfo(uint256 tokenId) external view returns (tuple(uint256 tokenId, address creator, string companyName, string trademarkName, string registrationNumber, string ipfsHash, string category, uint96 royaltyBps, uint256 createdAt, bool verified))",
  "function getTrademarkByRegistration(string memory registrationNumber) external view returns (uint256)",
  "function getTokenIdByRegistration(string memory registrationNumber) external view returns (uint256)",
  "function getOwnerTrademarks(address owner) external view returns (uint256[])",
  "function isRegistrationNumberUsed(string memory registrationNumber) external view returns (bool)",
  "function verifyTrademark(uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256)",
  "function getCurrentTokenId() external view returns (uint256)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
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
  "function trademarkNFT() external view returns (address)",
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

  // Validate contract addresses are configured
  if (!CONTRACT_ADDRESSES.TRADEMARK_NFT || !CONTRACT_ADDRESSES.MARKETPLACE) {
    throw new Error(
      'Smart contracts not deployed. Please deploy contracts first using "npm run deploy" and update .env.local with the contract addresses.'
    );
  }

  // Validate contract addresses are valid Ethereum addresses
  if (!ethers.isAddress(CONTRACT_ADDRESSES.TRADEMARK_NFT)) {
    throw new Error('Invalid TrademarkNFT contract address');
  }
  
  if (!ethers.isAddress(CONTRACT_ADDRESSES.MARKETPLACE)) {
    throw new Error('Invalid Marketplace contract address');
  }

  // Use signer if provided, otherwise create a provider
  let providerOrSigner: ethers.Provider | ethers.Signer;
  
  if (signer) {
    providerOrSigner = signer;
  } else {
    // Create a provider for read-only operations
    providerOrSigner = new ethers.BrowserProvider(window.ethereum);
  }
  
  const trademarkNFT = new ethers.Contract(
    CONTRACT_ADDRESSES.TRADEMARK_NFT,
    TRADEMARK_NFT_ABI,
    providerOrSigner
  );
  
  const marketplace = new ethers.Contract(
    CONTRACT_ADDRESSES.MARKETPLACE,
    MARKETPLACE_ABI,
    providerOrSigner
  );
  
  return { trademarkNFT, marketplace };
}

/**
 * Get TrademarkNFT contract instance
 */
export function getTrademarkNFTContract(signer?: ethers.Signer) {
  const { trademarkNFT } = getContracts(signer);
  return trademarkNFT;
}

/**
 * Get Marketplace contract instance
 */
export function getMarketplaceContract(signer?: ethers.Signer) {
  const { marketplace } = getContracts(signer);
  return marketplace;
}

/**
 * Register a new trademark
 */
export async function registerTrademark(
  signer: ethers.Signer,
  trademarkData: {
    companyName: string;
    sloganText: string;
    registrationNumber: string;
    ipfsHash: string;
    category: string;
    royaltyPercentage: number;
    tokenURI: string;
  }
): Promise<{ tokenId: number; transactionHash: string }> {
  try {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error('MetaMask not found');

    // Get the sender account directly from MetaMask
    const accounts: string[] = await eth.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) throw new Error('No wallet account found');
    const from = accounts[0];

    // Encode the function call using ethers Interface (no provider needed)
    const iface = new ethers.Interface([
      "function registerTrademark(string,string,string,string,string,uint96,string) external returns (uint256)"
    ]);
    const royaltyBps = Math.floor(trademarkData.royaltyPercentage * 100);
    const data = iface.encodeFunctionData('registerTrademark', [
      trademarkData.companyName,
      trademarkData.sloganText,
      trademarkData.registrationNumber,
      trademarkData.ipfsHash,
      trademarkData.category,
      royaltyBps,
      trademarkData.tokenURI,
    ]);

    console.log('Sending transaction via MetaMask directly...');
    console.log('From:', from);
    console.log('To:', CONTRACT_ADDRESSES.TRADEMARK_NFT);

    // Send transaction with explicit gas prices to satisfy Amoy's minimum requirements
    const txHash: string = await eth.request({
      method: 'eth_sendTransaction',
      params: [{
        from,
        to: CONTRACT_ADDRESSES.TRADEMARK_NFT,
        data,
        maxPriorityFeePerGas: '0x6FC23AC00', // 30 Gwei
        maxFeePerGas: '0x9502F9000',         // 40 Gwei
      }],
    });

    console.log('Transaction hash:', txHash);

    // Poll for receipt using MetaMask directly (no eth_blockNumber needed)
    let receipt: any = null;
    let attempts = 0;
    while (!receipt && attempts < 60) {
      await new Promise(r => setTimeout(r, 3000));
      receipt = await eth.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      attempts++;
      console.log(`Waiting for confirmation... attempt ${attempts}/60`);
    }

    if (!receipt) {
      throw new Error(`Transaction sent but not confirmed yet. Hash: ${txHash}. Check amoy.polygonscan.com`);
    }

    console.log('Transaction confirmed!', receipt);

    // Instead of parsing raw RPC logs (which often fails), 
    // we query the contract directly using the unique registration number
    let tokenId = Math.floor(Date.now() / 1000); // fallback
    try {
      const { trademarkNFT } = getContracts();
      // Wait a tiny bit for RPC nodes to sync the state
      await new Promise(resolve => setTimeout(resolve, 2000));
      const actualTokenId = await trademarkNFT.getTokenIdByRegistration(trademarkData.registrationNumber);
      if (actualTokenId) {
        tokenId = Number(actualTokenId);
        console.log('Successfully retrieved on-chain Token ID:', tokenId);
      }
    } catch (e) {
      console.warn('Failed to fetch actual token ID from contract, using fallback', e);
    }

    return { tokenId, transactionHash: txHash };
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
  duration: number,
  price: string
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
    // Check if contracts are deployed
    if (!CONTRACT_ADDRESSES.MARKETPLACE || CONTRACT_ADDRESSES.MARKETPLACE === '0x0000000000000000000000000000000000000000') {
      console.log('Marketplace contract not deployed yet');
      return [];
    }
    
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
      owner: info.seller, // Initially owner is seller
      price: ethers.formatEther(info.price),
      type: info.isLicense ? 'license' : 'sale',
      isLicense: info.isLicense,
      active: info.active,
      status: info.active ? 'active' : 'cancelled',
      suspended: false,
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
 * Get licenses for a token
 */
export async function getLicensesForToken(tokenId: number): Promise<any[]> {
  try {
    // Check if contracts are deployed
    if (!CONTRACT_ADDRESSES.MARKETPLACE || CONTRACT_ADDRESSES.MARKETPLACE === '0x0000000000000000000000000000000000000000') {
      console.log('Marketplace contract not deployed yet');
      return [];
    }
    
    const { marketplace } = getContracts();
    const licenses = await marketplace.getLicensesForToken(tokenId);
    
    return licenses.map((license: any) => ({
      licenseId: Number(license.licenseId),
      tokenId: Number(license.tokenId),
      licensee: license.licensee,
      licensor: license.licensor,
      price: ethers.formatEther(license.price),
      duration: Number(license.duration),
      issuedAt: Number(license.issuedAt),
      expiresAt: Number(license.expiresAt),
      active: license.active,
    }));
  } catch (error: any) {
    console.error('Error getting licenses:', error);
    return [];
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