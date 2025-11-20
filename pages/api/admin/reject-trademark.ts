import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withErrorHandler, withCors } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { trademarkId, adminAddress, reason } = req.body;

  if (!trademarkId || !adminAddress) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: trademarkId, adminAddress' 
    });
  }

  // Verify admin address (in production, check against database or environment variable)
  const ADMIN_ADDRESSES = [
    process.env.ADMIN_ADDRESS?.toLowerCase(),
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
  ].filter(Boolean);

  if (!ADMIN_ADDRESSES.includes(adminAddress.toLowerCase())) {
    return res.status(403).json({ 
      success: false, 
      error: 'Unauthorized: Admin privileges required' 
    });
  }

  try {
    // Update trademark status to rejected
    await dbService.updateTrademark(trademarkId, {
      rejected: true,
      rejectedAt: new Date(),
      rejectedBy: adminAddress,
      rejectionReason: reason || 'No reason provided',
      verified: false,
    });

    // Log the rejection
    await dbService.createActivityLog({
      type: 'trademark_rejected',
      trademarkId,
      adminAddress,
      timestamp: new Date(),
      details: { reason },
    });

    return res.status(200).json({
      success: true,
      message: 'Trademark rejected successfully',
    });
  } catch (error: any) {
    console.error('Error rejecting trademark:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject trademark',
    });
  }
}

export default withCors(withErrorHandler(handler));
