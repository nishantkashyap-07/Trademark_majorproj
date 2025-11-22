import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint to get creator's rating statistics
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Creator address is required',
      });
    }

    // Get all ratings for this creator
    const ratingsRef = collection(db, 'ratings');
    const ratingsQuery = query(
      ratingsRef,
      where('creatorAddress', '==', address.toLowerCase())
    );
    
    const ratingsSnapshot = await getDocs(ratingsQuery);
    
    if (ratingsSnapshot.empty) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalRatings: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          reviews: [],
        },
      });
    }

    // Calculate statistics
    let totalRating = 0;
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const reviews: any[] = [];

    ratingsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRating += data.rating;
      distribution[data.rating]++;
      
      if (data.review) {
        reviews.push({
          id: doc.id,
          rating: data.rating,
          review: data.review,
          reviewerAddress: data.reviewerAddress,
          createdAt: data.createdAt.toDate(),
        });
      }
    });

    const totalRatings = ratingsSnapshot.size;
    const averageRating = totalRating / totalRatings;

    // Sort reviews by date (newest first)
    reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings,
        distribution,
        reviews: reviews.slice(0, 10), // Return top 10 reviews
      },
    });
  } catch (error: any) {
    console.error('Get Creator Rating Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get creator rating',
    });
  }
}

export default withApi(withMethods(['GET'], handler));
