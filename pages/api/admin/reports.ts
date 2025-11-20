import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Admin endpoint to fetch and manage reports
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { adminAddress } = req.query;

    // Validate admin address
    const ADMIN_ADDRESSES = [
      process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
      process.env.ADMIN_ADDRESS?.toLowerCase(),
    ].filter(Boolean);

    if (!adminAddress || !ADMIN_ADDRESSES.includes((adminAddress as string).toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin privileges required',
      });
    }

    if (req.method === 'GET') {
      // Fetch reports
      const { status, type, limitCount } = req.query;
      
      let reportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        reportsQuery = query(reportsQuery, where('status', '==', status));
      }

      if (type) {
        reportsQuery = query(reportsQuery, where('type', '==', type));
      }

      if (limitCount) {
        reportsQuery = query(reportsQuery, limit(parseInt(limitCount as string)));
      } else {
        reportsQuery = query(reportsQuery, limit(50));
      }

      const reportsSnap = await getDocs(reportsQuery);
      const reports = reportsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      }));

      return res.status(200).json({
        success: true,
        data: reports,
        count: reports.length,
      });
    }

    if (req.method === 'PUT') {
      // Update report status
      const { reportId, status, resolution } = req.body;

      if (!reportId || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: reportId and status',
        });
      }

      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status,
        resolution: resolution || null,
        resolvedBy: adminAddress,
        resolvedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: { reportId, status },
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error: any) {
    console.error('Admin Reports Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch/update reports',
    });
  }
}

export default withApi(withMethods(['GET', 'PUT'], handler));
