import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withErrorHandler, withCors } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { listingId, tokenId, buyer, seller, price, transactionHash } = req.body;

  if (!listingId || !tokenId || !buyer || !seller || !price || !transactionHash) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  try {
    // Record the purchase
    const purchase = await dbService.createPurchase({
      listingId,
      tokenId,
      buyer,
      seller,
      price,
      transactionHash,
      purchasedAt: new Date(),
      type: 'sale',
    });

    // Update listing status
    await dbService.updateListing(listingId, {
      active: false,
      soldAt: new Date(),
      soldTo: buyer,
    });

    // Update trademark owner
    await dbService.updateTrademarkOwner(tokenId, buyer);

    // Create activity log
    await dbService.createActivityLog({
      type: 'trademark_sold',
      tokenId,
      buyer,
      seller,
      price,
      transactionHash,
      timestamp: new Date(),
    });

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error: any) {
    console.error('Error recording purchase:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to record purchase',
    });
  }
}

export default withCors(withErrorHandler(handler));
