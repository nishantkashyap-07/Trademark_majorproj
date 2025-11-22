import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Admin endpoint to fetch admin activity logs
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { adminAddress, limit } = req.query;

    // Validate admin address
    const ADMIN_ADDRESSES = [
      process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
      process.env.ADMIN_ADDRESS?.toLowerCase(),
    ].filter(Boolean);

    if (!adminAddress || !ADMIN_ADDRESSES.includes((adminAddress as string).toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin privileges required',
      });
    }

    if (req.method === 'GET') {
      const limitCount = limit ? parseInt(limit as string) : 100;
      const result = await dbService.getAdminLogs(limitCount);

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
    console.error('Admin Logs API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch admin logs',
    });
  }
}

export default withApi(withMethods(['GET'], handler));
