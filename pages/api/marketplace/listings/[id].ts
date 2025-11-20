import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withErrorHandler, withCors } from '@/lib/api-middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const listing = await dbService.getListing(id as string);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch listing',
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      const listing = await dbService.updateListing(id as string, updates);

      return res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error: any) {
      console.error('Error updating listing:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update listing',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await dbService.deleteListing(id as string);

      return res.status(200).json({
        success: true,
        message: 'Listing deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete listing',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

export default withCors(withErrorHandler(handler));
