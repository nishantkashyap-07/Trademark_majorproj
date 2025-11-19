import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Sync blockchain data with Firestore
 * This endpoint is called after a blockchain transaction to update the database
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
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and data',
      });
    }

    switch (type) {
      case 'trademark_registered':
        // Sync trademark registration
        const trademarkRef = doc(db, 'trademarks', `token_${data.tokenId}`);
        await setDoc(trademarkRef, {
          tokenId: data.tokenId,
          trademarkName: data.trademarkName,
          companyName: data.companyName,
          creatorAddress: data.creatorAddress.toLowerCase(),
          registrationNumber: data.registrationNumber,
          ipfsHash: data.ipfsHash,
          category: data.category,
          description: data.description || '',
          royaltyPercentage: data.royaltyPercentage,
          transactionHash: data.transactionHash,
          verified: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        break;

      case 'listing_created':
        // Sync marketplace listing
        const listingRef = doc(db, 'listings', `listing_${data.listingId}`);
        await setDoc(listingRef, {
          listingId: data.listingId,
          tokenId: data.tokenId,
          sellerAddress: data.sellerAddress.toLowerCase(),
          price: data.price,
          isLicense: data.isLicense,
          active: true,
          transactionHash: data.transactionHash,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        break;

      case 'trademark_sold':
        // Record transaction
        const transactionRef = doc(db, 'transactions', `tx_${data.transactionHash}`);
        await setDoc(transactionRef, {
          type: 'sale',
          tokenId: data.tokenId,
          fromAddress: data.fromAddress.toLowerCase(),
          toAddress: data.toAddress.toLowerCase(),
          amount: data.amount,
          royaltyAmount: data.royaltyAmount,
          transactionHash: data.transactionHash,
          createdAt: Timestamp.now(),
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown sync type: ${type}`,
        });
    }

    return res.status(200).json({
      success: true,
      message: 'Blockchain data synced successfully',
    });
  } catch (error: any) {
    console.error('Blockchain Sync Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync blockchain data',
    });
  }
}

export default withApi(withMethods(['POST'], handler));