import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Admin endpoint to verify trademarks
 * In production, this should have proper authentication
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
    const { trademarkId, verified, adminAddress } = req.body;

    if (!trademarkId || verified === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: trademarkId and verified',
      });
    }

    // TODO: Add admin authentication check
    // For now, we'll allow any request (NOT SECURE FOR PRODUCTION)
    // In production, verify adminAddress has admin role

    const trademarkRef = doc(db, 'trademarks', trademarkId);
    const trademarkSnap = await getDoc(trademarkRef);

    if (!trademarkSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Trademark not found',
      });
    }

    await updateDoc(trademarkRef, {
      verified,
      verifiedAt: verified ? Timestamp.now() : null,
      verifiedBy: verified ? adminAddress : null,
      updatedAt: Timestamp.now(),
    });

    return res.status(200).json({
      success: true,
      message: `Trademark ${verified ? 'verified' : 'unverified'} successfully`,
      data: {
        trademarkId,
        verified,
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