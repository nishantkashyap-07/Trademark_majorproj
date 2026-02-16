import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Admin endpoint to suspend/unsuspend users
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
    const { userAddress, suspended, adminAddress, reason } = req.body;

    if (!userAddress || suspended === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userAddress and suspended',
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

    // Use dbService methods
    const { dbService } = await import('@/lib/db-service');
    
    if (suspended) {
      await dbService.suspendUser(
        userAddress.toLowerCase(),
        reason || 'No reason provided',
        adminAddress
      );
    } else {
      await dbService.unsuspendUser(
        userAddress.toLowerCase(),
        adminAddress
      );
    }

    return res.status(200).json({
      success: true,
      message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully`,
      data: {
        userAddress: userAddress.toLowerCase(),
        suspended,
      },
    });
  } catch (error: any) {
    console.error('Admin Suspend User Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to suspend/unsuspend user',
    });
  }
}

export default withApi(withMethods(['POST'], handler));
