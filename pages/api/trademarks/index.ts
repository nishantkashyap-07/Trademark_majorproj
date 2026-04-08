import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

// Ensure body parser is enabled
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all trademarks with optional filters
      const { category, verified, search, sortBy = 'createdAt', order = 'desc', limitCount = 50, tokenId, creatorAddress } = req.query;

      // Special case: if searching by tokenId, do a simple query
      if (tokenId) {
        const q = query(
          collection(db, 'trademarks'),
          where('tokenId', '==', Number(tokenId))
        );
        
        const snapshot = await getDocs(q);
        const trademarks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to ISO strings for JSON serialization
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            verifiedAt: data.verifiedAt?.toDate?.() ? data.verifiedAt.toDate().toISOString() : data.verifiedAt,
          };
        });

        return res.status(200).json({
          success: true,
          data: trademarks,
          count: trademarks.length,
        });
      }

      let q = query(collection(db, 'trademarks'));

      // Apply filters
      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (creatorAddress) {
        q = query(q, where('creatorAddress', '==', creatorAddress));
      }

      if (verified !== undefined) {
        q = query(q, where('verified', '==', verified === 'true'));
      }

      // Apply sorting
      q = query(q, orderBy(sortBy as string, order as 'asc' | 'desc'));

      // Apply limit
      q = query(q, limit(Number(limitCount)));

      const snapshot = await getDocs(q);
      const trademarks = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Debug log to see what's in the database
        console.log('Raw trademark data:', {
          id: doc.id,
          sloganText: data.sloganText,
          companyName: data.companyName,
          createdAt: data.createdAt,
        });
        
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings for JSON serialization
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          verifiedAt: data.verifiedAt?.toDate?.() ? data.verifiedAt.toDate().toISOString() : data.verifiedAt,
        };
      });

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

      // Log the received data for debugging
      console.log('Received trademark data:', trademarkData);

      // Validate required fields
      if (!trademarkData || typeof trademarkData !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request format',
        });
      }

      // Accept both trademarkName and sloganText for compatibility
      const name = trademarkData.trademarkName || trademarkData.sloganText;
      
      if (!trademarkData.tokenId || !trademarkData.creatorAddress || !name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: tokenId, creatorAddress, and trademarkName/sloganText',
          received: {
            tokenId: !!trademarkData.tokenId,
            creatorAddress: !!trademarkData.creatorAddress,
            trademarkName: !!trademarkData.trademarkName,
            sloganText: !!trademarkData.sloganText,
          }
        });
      }
      
      // Ensure both fields are set for consistency
      if (!trademarkData.trademarkName) trademarkData.trademarkName = name;
      if (!trademarkData.sloganText) trademarkData.sloganText = name;

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