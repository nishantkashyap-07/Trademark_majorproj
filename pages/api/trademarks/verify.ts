import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

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
    const { tokenId, registrationNumber, companyAddress } = req.body;

    // Validate input
    if (!tokenId && !registrationNumber) {
      return res.status(400).json({
        success: false,
        error: 'Either tokenId or registrationNumber is required',
      });
    }

    let trademarkData: any = null;

    // Query by tokenId
    if (tokenId) {
      const q = query(
        collection(db, 'trademarks'),
        where('tokenId', '==', Number(tokenId))
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        trademarkData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
      }
    }

    // Query by registration number
    if (!trademarkData && registrationNumber) {
      const q = query(
        collection(db, 'trademarks'),
        where('registrationNumber', '==', registrationNumber)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        trademarkData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
      }
    }

    if (!trademarkData) {
      return res.status(404).json({
        success: false,
        error: 'Trademark not found',
        isValid: false,
      });
    }

    // Verify ownership if company address provided
    let ownershipValid = true;
    if (companyAddress) {
      ownershipValid = 
        trademarkData.creatorAddress?.toLowerCase() === companyAddress.toLowerCase();
    }

    // Prepare verification result
    const verificationResult = {
      isValid: trademarkData.verified && ownershipValid,
      trademark: trademarkData,
      owner: trademarkData.creatorAddress,
      verified: trademarkData.verified,
      ownershipValid,
      message: trademarkData.verified
        ? ownershipValid
          ? 'Slogan is verified and ownership is valid'
          : 'Slogan is verified but ownership does not match'
        : 'Slogan is registered but not yet verified',
    };

    return res.status(200).json({
      success: true,
      ...verificationResult,
    });
  } catch (error: any) {
    console.error('Verification Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Verification failed',
      isValid: false,
    });
  }
}

export default withApi(withMethods(['POST'], handler));