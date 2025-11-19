import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
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
    const { q: searchQuery, category, verified, limitCount = 20 } = req.query;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    // Get all trademarks (for client-side filtering)
    // In production, use Algolia or Elasticsearch for better search
    let dbQuery = query(collection(db, 'trademarks'));

    // Apply filters
    if (category) {
      dbQuery = query(dbQuery, where('category', '==', category));
    }

    if (verified !== undefined) {
      dbQuery = query(dbQuery, where('verified', '==', verified === 'true'));
    }

    // Apply limit
    dbQuery = query(dbQuery, limit(Number(limitCount) * 2)); // Get more for filtering

    const snapshot = await getDocs(dbQuery);
    const allTrademarks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filtering
    const searchLower = searchQuery.toLowerCase();
    const results = allTrademarks.filter((tm: any) => {
      const matchesSearch =
        tm.trademarkName?.toLowerCase().includes(searchLower) ||
        tm.companyName?.toLowerCase().includes(searchLower) ||
        tm.description?.toLowerCase().includes(searchLower) ||
        tm.registrationNumber?.toLowerCase().includes(searchLower);

      return matchesSearch;
    }).slice(0, Number(limitCount));

    // Calculate relevance scores
    const scoredResults = results.map((tm: any) => {
      let score = 0;
      
      // Exact match in trademark name (highest priority)
      if (tm.trademarkName?.toLowerCase() === searchLower) {
        score += 100;
      } else if (tm.trademarkName?.toLowerCase().startsWith(searchLower)) {
        score += 50;
      } else if (tm.trademarkName?.toLowerCase().includes(searchLower)) {
        score += 25;
      }

      // Company name match
      if (tm.companyName?.toLowerCase().includes(searchLower)) {
        score += 15;
      }

      // Registration number match
      if (tm.registrationNumber?.toLowerCase().includes(searchLower)) {
        score += 20;
      }

      // Verified trademarks get bonus
      if (tm.verified) {
        score += 10;
      }

      return { ...tm, relevanceScore: score };
    });

    // Sort by relevance
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return res.status(200).json({
      success: true,
      data: {
        results: scoredResults,
        count: scoredResults.length,
        query: searchQuery,
      },
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Search failed',
    });
  }
}

export default withApi(withMethods(['GET'], handler));