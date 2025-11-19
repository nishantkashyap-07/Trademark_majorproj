import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
    // Get all trademarks
    const trademarksSnapshot = await getDocs(collection(db, 'trademarks'));
    const trademarks = trademarksSnapshot.docs.map(doc => doc.data());

    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.size;

    // Calculate statistics
    const totalTrademarks = trademarks.length;
    const verifiedTrademarks = trademarks.filter((tm: any) => tm.verified).length;
    const categories = new Set(trademarks.map((tm: any) => tm.category)).size;

    // Get category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    trademarks.forEach((tm: any) => {
      if (tm.category) {
        categoryBreakdown[tm.category] = (categoryBreakdown[tm.category] || 0) + 1;
      }
    });

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = trademarks.filter((tm: any) => {
      const createdAt = new Date(tm.createdAt);
      return createdAt >= sevenDaysAgo;
    }).length;

    // Get top categories
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTrademarks,
          verifiedTrademarks,
          totalUsers: users,
          totalCategories: categories,
          verificationRate: totalTrademarks > 0 
            ? ((verifiedTrademarks / totalTrademarks) * 100).toFixed(1) 
            : '0',
        },
        recent: {
          registrationsLast7Days: recentRegistrations,
        },
        categories: {
          breakdown: categoryBreakdown,
          top: topCategories,
        },
      },
    });
  } catch (error: any) {
    console.error('Stats API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics',
    });
  }
}

export default withApi(withMethods(['GET'], handler));