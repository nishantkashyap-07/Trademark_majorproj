import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withErrorHandler, withCors } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { listingId, tokenId, licensee, licensor, price, duration, transactionHash } = req.body;

  if (!listingId || !tokenId || !licensee || !licensor || !price || !transactionHash) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  try {
    const expiresAt = duration > 0 
      ? new Date(Date.now() + duration * 1000)
      : null; // null means perpetual

    // Record the license
    const license = await dbService.createLicense({
      listingId,
      tokenId,
      licensee,
      licensor,
      price,
      duration,
      transactionHash,
      issuedAt: new Date(),
      expiresAt,
      active: true,
    });

    // Create activity log
    await dbService.createActivityLog({
      type: 'trademark_licensed',
      tokenId,
      licensee,
      licensor,
      price,
      duration,
      transactionHash,
      timestamp: new Date(),
    });

    return res.status(200).json({
      success: true,
      data: license,
    });
  } catch (error: any) {
    console.error('Error recording license:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to record license',
    });
  }
}

export default withCors(withErrorHandler(handler));
