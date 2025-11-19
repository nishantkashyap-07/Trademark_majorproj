import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all trademarks with optional filters
      const { category, verified, search, sortBy = 'createdAt', order = 'desc', limitCount = 50 } = req.query;

      let q = query(collection(db, 'trademarks'));

      // Apply filters
      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (verified !== undefined) {
        q = query(q, where('verified', '==', verified === 'true'));
      }

      // Apply sorting
      q = query(q, orderBy(sortBy as string, order as 'asc' | 'desc'));

      // Apply limit
      q = query(q, limit(Number(limitCount)));

      const snapshot = await getDocs(q);
      const trademarks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply search filter (client-side for now)
      let filteredTrademarks = trademarks;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredTrademarks = trademarks.filter((tm: any) =>
          tm.trademarkName?.toLowerCase().includes(searchLower) ||
          tm.companyName?.toLowerCase().includes(searchLower) ||
          tm.description?.toLowerCase().includes(searchLower)
        );
      }

      return res.status(200).json({
        success: true,
        data: filteredTrademarks,
        count: filteredTrademarks.length,
      });
    }

    if (req.method === 'POST') {
      // Create new trademark record
      const trademarkData = req.body;

      // Validate required fields
      if (!trademarkData.tokenId || !trademarkData.creatorAddress || !trademarkData.trademarkName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      // Add timestamp
      trademarkData.createdAt = Timestamp.now();
      trademarkData.updatedAt = Timestamp.now();

      const docRef = await addDoc(collection(db, 'trademarks'), trademarkData);

      return res.status(201).json({
        success: true,
        data: {
          id: docRef.id,
          ...trademarkData,
        },
      });
    }

    // This should not be reached due to middleware
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

export default withApi(handler);