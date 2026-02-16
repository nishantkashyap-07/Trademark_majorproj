import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Admin endpoint to suspend/unsuspend listings
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
    const { listingId, suspended, adminAddress, reason } = req.body;

    if (!listingId || suspended === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: listingId and suspended',
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

    // Get listing
    const listingRef = doc(db, 'listings', listingId);
    const listingSnap = await getDoc(listingRef);

    if (!listingSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Use dbService method
    const { dbService } = await import('@/lib/db-service');
    
    if (suspended) {
      await dbService.suspendListing(
        listingId,
        reason || 'No reason provided',
        adminAddress
      );
    } else {
      // For unsuspending, update directly
      await updateDoc(listingRef, {
        suspended: false,
        suspensionReason: null,
        unsuspendedAt: Timestamp.now(),
        active: true,
        status: 'active',
        updatedAt: Timestamp.now(),
      });
    }

    return res.status(200).json({
      success: true,
      message: `Listing ${suspended ? 'suspended' : 'unsuspended'} successfully`,
      data: {
        listingId,
        suspended,
      },
    });
  } catch (error: any) {
    console.error('Admin Suspend Listing Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to suspend/unsuspend listing',
    });
  }
}

export default withApi(withMethods(['POST'], handler));
