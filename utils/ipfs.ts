import { IPFSMetadata } from '@/types';
import { FILE_CONSTRAINTS, IPFS_CONFIG } from './constants';

/**
 * Upload files to IPFS using Pinata
 * @param files Array of files to upload
 * @returns Promise resolving to IPFS hash
 */
export async function uploadFilesToIPFS(files: File[]): Promise<string> {
  try {
    console.log('Starting IPFS upload for', files.length, 'files...');
    
    // Validate files
    validateFiles(files);
    
    const formData = new FormData();
    
    // Add files to form data
    files.forEach((file, index) => {
      console.log(`Adding file ${index + 1}:`, file.name, file.type, file.size, 'bytes');
      formData.append('file', file);
    });
    
    // Add metadata
    const metadata = JSON.stringify({
      name: `trademark-assets-${Date.now()}`,
    });
    formData.append('pinataMetadata', metadata);
    
    console.log('Sending upload request to API...');
    const response = await fetch('/api/upload/ipfs', {
      method: 'POST',
      body: formData,
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API error response:', error);
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Files uploaded to IPFS successfully:', data.data.cid);
    console.log('IPFS URL:', data.data.url);
    return data.data.cid;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(error.message || 'Failed to upload files to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS using Pinata
 * @param metadata Metadata object to upload
 * @returns Promise resolving to IPFS hash
 */
export async function uploadMetadataToIPFS(metadata: IPFSMetadata): Promise<string> {
  try {
    const response = await fetch('/api/upload/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Metadata upload failed');
    }
    
    const data = await response.json();
    console.log('Metadata uploaded to IPFS:', data.data.cid);
    return data.data.cid;
  } catch (error: any) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error(error.message || 'Failed to upload metadata to IPFS');
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