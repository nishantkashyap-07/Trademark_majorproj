import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * PUT /api/notifications/mark-all-read
 * Body: { address: "0x..." }
 * Marks all notifications for a user as read
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const result = await dbService.markAllNotificationsAsRead(address);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      message: `${result.count || 0} notifications marked as read`,
      count: result.count || 0,
    });
  } catch (error: any) {
    console.error('Mark All Read API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark notifications as read',
    });
  }
}

export default withApi(withMethods(['PUT'], handler));
