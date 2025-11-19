import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { TRADEMARK_CATEGORIES } from '@/utils/constants';
import { withApi, withMethods } from '@/lib/api-middleware';

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
    // Get all trademarks to calculate category counts
    const trademarksSnapshot = await getDocs(collection(db, 'trademarks'));
    const trademarks = trademarksSnapshot.docs.map(doc => doc.data());

    // Calculate counts for each category
    const categoryCounts: { [key: string]: number } = {};
    trademarks.forEach((tm: any) => {
      if (tm.category) {
        categoryCounts[tm.category] = (categoryCounts[tm.category] || 0) + 1;
      }
    });

    // Build category list with counts
    const categories = TRADEMARK_CATEGORIES.map(category => ({
      name: category,
      count: categoryCounts[category] || 0,
      verified: trademarks.filter((tm: any) => tm.category === category && tm.verified).length,
    }));

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      data: {
        categories,
        total: categories.length,
        totalTrademarks: trademarks.length,
      },
    });
  } catch (error: any) {
    console.error('Categories API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch categories',
    });
  }
}

export default withApi(withMethods(['GET'], handler));