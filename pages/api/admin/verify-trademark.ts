import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/utils/constants';

const TRADEMARK_NFT_ABI = [
  "function verifyTrademark(uint256 tokenId) external",
  "function getTrademarkInfo(uint256 tokenId) external view returns (tuple(uint256 tokenId, address creator, string companyName, string trademarkName, string registrationNumber, string ipfsHash, string category, uint96 royaltyBps, uint256 createdAt, bool verified))",
];

/**
 * Admin endpoint to verify trademarks
 * Updates both database and blockchain verification status
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { trademarkId, tokenId, adminAddress } = req.body;

    if (!trademarkId || tokenId === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: trademarkId and tokenId',
      });
    }

    // Validate admin address
    const ADMIN_ADDRESSES = [
      process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
      process.env.ADMIN_ADDRESS?.toLowerCase(),
    ].filter(Boolean);

    if (!adminAddress || !ADMIN_ADDRESSES.includes(adminAddress.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin privileges required',
      });
    }

    // Get trademark from database
    const trademarkRef = doc(db, 'trademarks', trademarkId);
    const trademarkSnap = await getDoc(trademarkRef);

    if (!trademarkSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Trademark not found',
      });
    }

    // Update blockchain verification status
    let blockchainTxHash = null;
    try {
      // Connect to blockchain with admin wallet
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology'
      );
      
      // In production, use a secure key management system
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
      if (adminPrivateKey) {
        const adminSigner = new ethers.Wallet(adminPrivateKey, provider);
        const trademarkNFT = new ethers.Contract(
          CONTRACT_ADDRESSES.TRADEMARK_NFT,
          TRADEMARK_NFT_ABI,
          adminSigner
        );

        // Call blockchain verification
        const tx = await trademarkNFT.verifyTrademark(tokenId);
        const receipt = await tx.wait();
        blockchainTxHash = receipt.hash;
        
        console.log('Blockchain verification successful:', blockchainTxHash);
      } else {
        console.warn('Admin private key not configured, skipping blockchain update');
      }
    } catch (blockchainError: any) {
      console.error('Blockchain verification error:', blockchainError);
      // Continue with database update even if blockchain fails
      // In production, you might want to handle this differently
    }

    // Update database
    await updateDoc(trademarkRef, {
      verified: true,
      verificationStatus: 'verified',
      verifiedAt: Timestamp.now(),
      verifiedBy: adminAddress,
      verificationTxHash: blockchainTxHash,
      updatedAt: Timestamp.now(),
    });

    // Create admin log
    const { dbService } = await import('@/lib/db-service');
    await dbService.createAdminLog({
      adminAddress,
      action: 'verify',
      targetType: 'trademark',
      targetId: tokenId.toString(),
      metadata: {
        trademarkId,
        blockchainTxHash,
      },
    });

    // Log to verification history
    const trademarkData = trademarkSnap.data();
    const { addDoc, collection: firestoreCollection } = await import('firebase/firestore');
    await addDoc(firestoreCollection(db, 'verificationHistory'), {
      adminAddress,
      action: 'verified',
      trademarkId,
      tokenId,
      trademarkName: trademarkData.trademarkName || trademarkData.sloganText,
      companyName: trademarkData.companyName,
      timestamp: Timestamp.now(),
      blockchainTxHash,
    });

    return res.status(200).json({
      success: true,
      message: 'Trademark verified successfully',
      data: {
        trademarkId,
        tokenId,
        verified: true,
        blockchainTxHash,
      },
    });
  } catch (error: any) {
    console.error('Admin Verify Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify trademark',
    });
  }
}

export default withApi(withMethods(['POST'], handler));