import { IPFSMetadata } from '@/types';
import { FILE_CONSTRAINTS, IPFS_CONFIG } from './constants';

// Initialize Web3.Storage client
const getWeb3StorageClient = () => {
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('Web3.Storage token not configured');
  }
  // Dynamic import to avoid build issues
  const { Web3Storage } = require('web3.storage');
  return new Web3Storage({ token });
};

/**
 * Upload files to IPFS using Web3.Storage
 * @param files Array of files to upload
 * @returns Promise resolving to IPFS hash
 */
export async function uploadFilesToIPFS(files: File[]): Promise<string> {
  try {
    // Validate files
    validateFiles(files);
    
    const client = getWeb3StorageClient();
    const cid = await client.put(files, {
      name: `trademark-assets-${Date.now()}`,
      maxRetries: 3,
    });
    
    console.log('Files uploaded to IPFS:', cid);
    return cid;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload files to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata Metadata object to upload
 * @returns Promise resolving to IPFS hash
 */
export async function uploadMetadataToIPFS(metadata: IPFSMetadata): Promise<string> {
  try {
    const client = getWeb3StorageClient();
    
    // Convert metadata to File object
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json',
    });
    
    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json',
    });
    
    const cid = await client.put([metadataFile], {
      name: `trademark-metadata-${Date.now()}`,
      maxRetries: 3,
    });
    
    console.log('Metadata uploaded to IPFS:', cid);
    return cid;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Create trademark metadata object
 * @param trademarkData Trademark form data
 * @param assetsCID IPFS hash of uploaded assets
 * @returns IPFSMetadata object
 */
export function createTrademarkMetadata(
  trademarkData: {
    companyName: string;
    sloganText: string;
    registrationNumber: string;
    category: string;
    description: string;
  },
  assetsCID: string,
  fileNames: string[]
): IPFSMetadata {
  return {
    name: trademarkData.sloganText,
    description: trademarkData.description,
    image: `ipfs://${assetsCID}/${fileNames[0]}`, // First file as main image
    attributes: [
      {
        trait_type: 'Company',
        value: trademarkData.companyName,
      },
      {
        trait_type: 'Registration Number',
        value: trademarkData.registrationNumber,
      },
      {
        trait_type: 'Category',
        value: trademarkData.category,
      },
      {
        trait_type: 'Created At',
        value: new Date().toISOString(),
      },
    ],
    company: trademarkData.companyName,
    registrationNumber: trademarkData.registrationNumber,
    category: trademarkData.category,
    files: fileNames.map(name => `ipfs://${assetsCID}/${name}`),
  };
}

/**
 * Validate uploaded files
 * @param files Array of files to validate
 */
function validateFiles(files: File[]): void {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }
  
  if (files.length > FILE_CONSTRAINTS.MAX_FILES) {
    throw new Error(`Maximum ${FILE_CONSTRAINTS.MAX_FILES} files allowed`);
  }
  
  for (const file of files) {
    // Check file size
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
      throw new Error(`File "${file.name}" exceeds ${FILE_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
    
    // Check file type
    if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File "${file.name}" has unsupported type. Allowed types: ${FILE_CONSTRAINTS.ALLOWED_TYPES.join(', ')}`);
    }
  }
}

/**
 * Get IPFS URL for a hash with fallback gateways
 * @param hash IPFS hash
 * @param filename Optional filename
 * @returns IPFS URL
 */
export function getIPFSUrl(hash: string, filename?: string): string {
  const cleanHash = hash.replace('ipfs://', '');
  const path = filename ? `${cleanHash}/${filename}` : cleanHash;
  return `${IPFS_CONFIG.GATEWAY_URLS[0]}${path}`;
}

/**
 * Get multiple IPFS URLs with different gateways for fallback
 * @param hash IPFS hash
 * @param filename Optional filename
 * @returns Array of IPFS URLs
 */
export function getIPFSUrls(hash: string, filename?: string): string[] {
  const cleanHash = hash.replace('ipfs://', '');
  const path = filename ? `${cleanHash}/${filename}` : cleanHash;
  
  return IPFS_CONFIG.GATEWAY_URLS.map(gateway => `${gateway}${path}`);
}

/**
 * Fetch content from IPFS with fallback gateways
 * @param hash IPFS hash
 * @param filename Optional filename
 * @returns Promise resolving to Response object
 */
export async function fetchFromIPFS(hash: string, filename?: string): Promise<Response> {
  const urls = getIPFSUrls(hash, filename);
  
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IPFS_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${url}:`, error);
      continue;
    }
  }
  
  throw new Error(`Failed to fetch content from IPFS: ${hash}`);
}

/**
 * Fetch JSON metadata from IPFS
 * @param hash IPFS hash
 * @returns Promise resolving to parsed JSON
 */
export async function fetchMetadataFromIPFS(hash: string): Promise<IPFSMetadata> {
  try {
    const response = await fetchFromIPFS(hash, 'metadata.json');
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
}

/**
 * Check if IPFS hash is valid
 * @param hash IPFS hash to validate
 * @returns boolean indicating if hash is valid
 */
export function isValidIPFSHash(hash: string): boolean {
  const cleanHash = hash.replace('ipfs://', '');
  // Basic validation for CIDv0 and CIDv1
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^b[A-Za-z2-7]{58}$/.test(cleanHash);
}