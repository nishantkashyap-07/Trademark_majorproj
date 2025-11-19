import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { withApi } from '@/lib/api-middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet address',
    });
  }

  try {
    if (req.method === 'GET') {
      // Get user profile
      const docRef = doc(db, 'users', address.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Get user's trademarks
      const trademarksQuery = query(
        collection(db, 'trademarks'),
        where('creatorAddress', '==', address.toLowerCase())
      );
      const trademarksSnapshot = await getDocs(trademarksQuery);
      const trademarks = trademarksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({
        success: true,
        data: {
          profile: {
            address: docSnap.id,
            ...docSnap.data(),
          },
          trademarks,
          stats: {
            totalTrademarks: trademarks.length,
            verifiedTrademarks: trademarks.filter((tm: any) => tm.verified).length,
          },
        },
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Create or update user profile
      const userData = req.body;
      const docRef = doc(db, 'users', address.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Update existing user
        userData.updatedAt = Timestamp.now();
        await updateDoc(docRef, userData);
      } else {
        // Create new user
        userData.address = address.toLowerCase();
        userData.createdAt = Timestamp.now();
        userData.updatedAt = Timestamp.now();
        await setDoc(docRef, userData);
      }

      const updatedDoc = await getDoc(docRef);

      return res.status(200).json({
        success: true,
        data: {
          address: updatedDoc.id,
          ...updatedDoc.data(),
        },
      });
    }

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