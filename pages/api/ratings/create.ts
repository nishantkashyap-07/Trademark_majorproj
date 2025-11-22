import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint for buyers to rate creators
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { 
      creatorAddress, 
      trademarkId, 
      rating, 
      review, 
      reviewerAddress 
    } = req.body;

    // Validation
    if (!creatorAddress || !trademarkId || !rating || !reviewerAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: creatorAddress, trademarkId, rating, reviewerAddress',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    if (creatorAddress.toLowerCase() === reviewerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot rate your own trademark',
      });
    }

    // Check if user already rated this creator
    const ratingsRef = collection(db, 'ratings');
    const existingRatingQuery = query(
      ratingsRef,
      where('creatorAddress', '==', creatorAddress.toLowerCase()),
      where('reviewerAddress', '==', reviewerAddress.toLowerCase()),
      where('trademarkId', '==', trademarkId)
    );
    
    const existingRatings = await getDocs(existingRatingQuery);
    
    if (!existingRatings.empty) {
      return res.status(400).json({
        success: false,
        error: 'You have already rated this trademark',
      });
    }

    // Create rating
    const ratingRef = await addDoc(collection(db, 'ratings'), {
      creatorAddress: creatorAddress.toLowerCase(),
      trademarkId,
      rating: Number(rating),
      review: review?.trim() || '',
      reviewerAddress: reviewerAddress.toLowerCase(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        ratingId: ratingRef.id,
      },
    });
  } catch (error: any) {
    console.error('Create Rating Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit rating',
    });
  }
}

export default withApi(withMethods(['POST'], handler));
