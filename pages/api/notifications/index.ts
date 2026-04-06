import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint for managing user notifications
 * GET  /api/notifications?address=0x...&unreadOnly=true  - List notifications
 * POST /api/notifications  - Create a notification
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { address, unreadOnly } = req.query;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'User address is required',
        });
      }

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

    if (req.method === 'POST') {
      const { userId, type, title, message, relatedId, relatedType, link, icon, color } = req.body;

      if (!userId || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'userId, title, and message are required',
        });
      }

      const result = await dbService.createNotification({
        userId: userId.toLowerCase(),
        type: type || 'system',
        title,
        message,
        relatedId: relatedId || null,
        relatedType: relatedType || null,
        link: link || null,
        icon: icon || '🔔',
        color: color || 'slate',
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json({
        success: true,
        data: { id: result.id },
        message: 'Notification created',
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
      error: error.message || 'Failed to process notification request',
    });
  }
}

export default withApi(withMethods(['GET', 'POST'], handler));

