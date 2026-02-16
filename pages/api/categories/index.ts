import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint for fetching categories
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const result = await dbService.getCategories();

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
    console.error('Categories API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories',
    });
  }
}

export default withApi(withMethods(['GET'], handler));
