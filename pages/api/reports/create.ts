import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { withApi, withMethods } from '@/lib/api-middleware';

/**
 * Endpoint for users to submit reports
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
      type, 
      targetId, 
      targetType, 
      reason, 
      description, 
      reporterAddress 
    } = req.body;

    if (!type || !targetId || !targetType || !reason || !reporterAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, targetId, targetType, reason, reporterAddress',
      });
    }

    // Validate report type
    const validTypes = ['spam', 'fraud', 'copyright', 'inappropriate', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type',
      });
    }

    // Validate target type
    const validTargetTypes = ['trademark', 'listing', 'user'];
    if (!validTargetTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target type',
      });
    }

    // Create report
    const reportRef = await addDoc(collection(db, 'reports'), {
      type,
      targetId,
      targetType,
      reason,
      description: description || '',
      reporterAddress: reporterAddress.toLowerCase(),
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportId: reportRef.id,
      },
    });
  } catch (error: any) {
    console.error('Create Report Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit report',
    });
  }
}

export default withApi(withMethods(['POST'], handler));
