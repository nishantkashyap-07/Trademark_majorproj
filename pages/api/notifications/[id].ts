import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint for marking notifications as read
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Notification ID is required',
      });
    }

    if (req.method === 'PUT') {
      const result = await dbService.markNotificationAsRead(id);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error: any) {
    console.error('Notification Update API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update notification',
    });
  }
}

export default withApi(withMethods(['PUT'], handler));
