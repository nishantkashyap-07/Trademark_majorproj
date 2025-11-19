import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { withApi } from '@/lib/api-middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid trademark ID',
    });
  }

  try {
    if (req.method === 'GET') {
      // Get single trademark by ID
      const docRef = doc(db, 'trademarks', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({
          success: false,
          error: 'Trademark not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data(),
        },
      });
    }

    if (req.method === 'PUT') {
      // Update trademark
      const updateData = req.body;
      updateData.updatedAt = Timestamp.now();

      const docRef = doc(db, 'trademarks', id);
      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);

      return res.status(200).json({
        success: true,
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      });
    }

    if (req.method === 'DELETE') {
      // Delete trademark
      const docRef = doc(db, 'trademarks', id);
      await deleteDoc(docRef);

      return res.status(200).json({
        success: true,
        message: 'Trademark deleted successfully',
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