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
      const { category, verified, search, sortBy = 'createdAt', order = 'desc', limitCount = 50, blockchainTokenId, ownerId } = req.query;

      if (blockchainTokenId) {
        const q = query(
          collection(db, 'ip_assets'),
          where('blockchainTokenId', '==', Number(blockchainTokenId))
        );
        
        const snapshot = await getDocs(q);
        const assets = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          };
        });

        return res.status(200).json({
          success: true,
          data: assets,
          count: assets.length,
        });
      }

      let q = query(collection(db, 'ip_assets'));

      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (ownerId) {
        q = query(q, where('ownerId', '==', ownerId));
      }

      if (verified !== undefined) {
        q = query(q, where('verified', '==', verified === 'true'));
      }

      q = query(q, orderBy(sortBy as string, order as 'asc' | 'desc'));
      q = query(q, limit(Number(limitCount)));

      const snapshot = await getDocs(q);
      const assets = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });

      let filteredAssets = assets;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredAssets = assets.filter((tm: any) =>
          tm.title?.toLowerCase().includes(searchLower) ||
          tm.companyName?.toLowerCase().includes(searchLower) ||
          tm.description?.toLowerCase().includes(searchLower)
        );
      }

      return res.status(200).json({
        success: true,
        data: filteredAssets,
        count: filteredAssets.length,
      });
    }

    if (req.method === 'POST') {
      const data = req.body;

      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid request format' });
      }

      // Mapping for diagram consistency
      const assetData = {
        blockchainTokenId: data.blockchainTokenId || data.tokenId || Date.now(),
        ownerId: data.ownerId || data.creatorAddress || 'unknown',
        title: data.title || data.sloganText || data.trademarkName || 'Untitled',
        companyName: data.companyName || '',
        registrationNumber: data.registrationNumber || '',
        ipfsHash: data.ipfsHash || '',
        previewUrl: data.previewUrl || data.imageUrl || '',
        category: data.category || '',
        description: data.description || '',
        royaltyPercentage: data.royaltyPercentage || 0,
        tokenURI: data.tokenURI || '',
        transactionHash: data.transactionHash || '',
        verified: data.verified || false,
        verificationStatus: data.verificationStatus || 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      if (!assetData.blockchainTokenId || !assetData.ownerId || !assetData.title) {
        return res.status(400).json({
          success: false,
          error: 'Missing required diagram fields: blockchainTokenId, ownerId, or title',
        });
      }

      const docRef = await addDoc(collection(db, 'ip_assets'), assetData);

      return res.status(201).json({
        success: true,
        data: {
          id: docRef.id,
          ...assetData,
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