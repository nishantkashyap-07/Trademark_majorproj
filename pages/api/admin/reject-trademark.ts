import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/db-service';
import { withErrorHandler, withCors } from '@/lib/api-middleware';
import { cooldownService } from '@/lib/cooldown-service';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { trademarkId, adminAddress, reason } = req.body;

  if (!trademarkId || !adminAddress) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: trademarkId, adminAddress' 
    });
  }

  // Verify admin address (in production, check against database or environment variable)
  const ADMIN_ADDRESSES = [
    process.env.ADMIN_ADDRESS?.toLowerCase(),
    process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
  ].filter(Boolean);

  if (!ADMIN_ADDRESSES.includes(adminAddress.toLowerCase())) {
    return res.status(403).json({ 
      success: false, 
      error: 'Unauthorized: Admin privileges required' 
    });
  }

  try {
    // Update trademark status to rejected
    await dbService.updateIPAsset(trademarkId, {
      rejected: true,
      rejectedAt: new Date(),
      rejectedBy: adminAddress,
      rejectionReason: reason || 'No reason provided',
      verified: false,
      verificationStatus: 'rejected',
    });

    // Create admin log
    await dbService.createAdminLog({
      adminAddress,
      action: 'reject',
      targetType: 'trademark',
      targetId: trademarkId,
      reason: reason || 'No reason provided',
    });

    // Log to verification history
    const { db } = await import('@/lib/firebase');
    const { addDoc, collection, Timestamp, getDoc, doc } = await import('firebase/firestore');
    
    const trademarkRef = doc(db, 'ip_assets', trademarkId);
    const trademarkSnap = await getDoc(trademarkRef);
    const trademarkData = trademarkSnap.exists() ? trademarkSnap.data() : {};
    
    await addDoc(collection(db, 'verificationHistory'), {
      adminAddress,
      action: 'rejected',
      trademarkId,
      tokenId: trademarkData.tokenId || 0,
      trademarkName: trademarkData.title || trademarkData.trademarkName || trademarkData.sloganText || 'Unknown',
      companyName: trademarkData.companyName || 'Unknown',
      reason: reason || 'No reason provided',
      timestamp: Timestamp.now(),
    });

    // Log the rejection (keep for backward compatibility)
    await dbService.createActivityLog({
      type: 'trademark_rejected',
      trademarkId,
      adminAddress,
      timestamp: new Date(),
      details: { reason },
    });

    // ── Apply 7-day registration ban to the asset owner ───────────────────
    const ownerWallet = trademarkData.ownerId || trademarkData.creatorAddress || '';
    if (ownerWallet && ownerWallet !== 'unknown') {
      await cooldownService.applyRejectionBan(ownerWallet);
      console.log(`[CooldownService] 7-day ban applied to wallet: ${ownerWallet}`);
    }
    // ──────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: 'Trademark rejected successfully',
    });
  } catch (error: any) {
    console.error('Error rejecting trademark:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject trademark',
    });
  }
}

export default withCors(withErrorHandler(handler));
