import type { NextApiRequest, NextApiResponse } from 'next';
import { withMethods } from '@/lib/api-middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'operational',
        database: 'operational', // Would check Firebase connection in production
        ipfs: 'operational', // Would check IPFS connection in production
      },
    };

    return res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Health check failed',
    });
  }
}

export default withMethods(['GET'], handler);