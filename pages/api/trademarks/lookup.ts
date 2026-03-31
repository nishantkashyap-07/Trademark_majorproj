import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { registrationNumber, tokenId } = req.query;

    if (!registrationNumber && !tokenId) {
      return res.status(400).json({
        success: false,
        error: 'Either registrationNumber or tokenId is required',
      });
    }

    // Get all trademarks and filter
    const result = await dbService.getTrademarks();
    
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch trademarks',
      });
    }

    let trademark;

    if (registrationNumber) {
      trademark = result.data.find(
        (tm: any) => tm.registrationNumber === registrationNumber
      );
    } else if (tokenId) {
      trademark = result.data.find(
        (tm: any) => tm.tokenId === parseInt(tokenId as string)
      );
    }

    if (!trademark) {
      return res.status(404).json({
        success: false,
        error: 'Trademark not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: trademark,
    });
  } catch (error: any) {
    console.error('Trademark lookup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
