import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * GET /api/notifications/unread-count?address=0x...
 * Returns the unread notification count for a user (lightweight endpoint for polling)
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const result = await dbService.getUnreadNotificationCount(address);

    return res.status(200).json({
      success: true,
      count: result.count || 0,
    });
  } catch (error: any) {
    console.error('Unread Count API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get unread count',
      count: 0,
    });
  }
}

export default withApi(withMethods(['GET'], handler));
