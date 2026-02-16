import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint for managing user notifications
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { address, unreadOnly } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    if (req.method === 'GET') {
      const result = await dbService.getUserNotifications(
        address as string,
        unreadOnly === 'true'
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.data?.length || 0,
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error: any) {
    console.error('Notifications API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notifications',
    });
  }
}

export default withApi(withMethods(['GET'], handler));
