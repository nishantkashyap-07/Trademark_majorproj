// Notification Service - Centralized notification creation for TrademarkChain
// Used by API routes to send contextual notifications to users

import { dbService } from './db-service';

// Notification types
export type NotificationType =
  | 'trademark_registered'
  | 'trademark_verified'
  | 'trademark_rejected'
  | 'listing_created'
  | 'listing_sold'
  | 'purchase_complete'
  | 'license_purchased'
  | 'license_expiring'
  | 'license_expired'
  | 'rating_received'
  | 'report_filed'
  | 'report_resolved'
  | 'system';

// Icon mapping for notification types (used by frontend)
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  trademark_registered: '📝',
  trademark_verified: '✅',
  trademark_rejected: '❌',
  listing_created: '🏷️',
  listing_sold: '💰',
  purchase_complete: '🎉',
  license_purchased: '📄',
  license_expiring: '⚠️',
  license_expired: '🔴',
  rating_received: '⭐',
  report_filed: '🚩',
  report_resolved: '✔️',
  system: '🔔',
};

// Color mapping for notification types (used by frontend)
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  trademark_registered: 'indigo',
  trademark_verified: 'emerald',
  trademark_rejected: 'red',
  listing_created: 'cyan',
  listing_sold: 'amber',
  purchase_complete: 'emerald',
  license_purchased: 'blue',
  license_expiring: 'amber',
  license_expired: 'red',
  rating_received: 'yellow',
  report_filed: 'orange',
  report_resolved: 'emerald',
  system: 'slate',
};

interface CreateNotificationParams {
  recipientAddress: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'trademark' | 'listing' | 'license' | 'user';
  link?: string;
}

// ── Core notification creator ──
async function createNotification(params: CreateNotificationParams) {
  return dbService.createNotification({
    userId: params.recipientAddress.toLowerCase(),
    type: params.type,
    title: params.title,
    message: params.message,
    relatedId: params.relatedId || null,
    relatedType: params.relatedType || null,
    link: params.link || null,
    icon: NOTIFICATION_ICONS[params.type],
    color: NOTIFICATION_COLORS[params.type],
  });
}

// ── Convenience functions for common events ──

export async function notifyTrademarkRegistered(
  ownerAddress: string,
  trademarkName: string,
  tokenId: number
) {
  return createNotification({
    recipientAddress: ownerAddress,
    type: 'trademark_registered',
    title: 'Trademark Registered',
    message: `Your trademark "${trademarkName}" has been registered successfully and is pending verification.`,
    relatedId: String(tokenId),
    relatedType: 'trademark',
    link: `/dashboard`,
  });
}

export async function notifyTrademarkVerified(
  ownerAddress: string,
  trademarkName: string,
  tokenId: number
) {
  return createNotification({
    recipientAddress: ownerAddress,
    type: 'trademark_verified',
    title: 'Trademark Verified ✅',
    message: `Your trademark "${trademarkName}" has been verified by an admin. It is now publicly trusted.`,
    relatedId: String(tokenId),
    relatedType: 'trademark',
    link: `/trademark/${tokenId}`,
  });
}

export async function notifyTrademarkRejected(
  ownerAddress: string,
  trademarkName: string,
  tokenId: number,
  reason: string
) {
  return createNotification({
    recipientAddress: ownerAddress,
    type: 'trademark_rejected',
    title: 'Trademark Rejected',
    message: `Your trademark "${trademarkName}" was rejected. Reason: ${reason}`,
    relatedId: String(tokenId),
    relatedType: 'trademark',
    link: `/dashboard`,
  });
}

export async function notifyListingCreated(
  ownerAddress: string,
  trademarkName: string,
  listingId: string,
  isLicense: boolean
) {
  return createNotification({
    recipientAddress: ownerAddress,
    type: 'listing_created',
    title: isLicense ? 'License Listing Created' : 'Sale Listing Created',
    message: `Your trademark "${trademarkName}" is now listed on the marketplace.`,
    relatedId: listingId,
    relatedType: 'listing',
    link: `/marketplace`,
  });
}

export async function notifyListingSold(
  sellerAddress: string,
  trademarkName: string,
  price: string,
  tokenId: number
) {
  return createNotification({
    recipientAddress: sellerAddress,
    type: 'listing_sold',
    title: 'Trademark Sold! 💰',
    message: `Your trademark "${trademarkName}" was sold for ${price} MATIC. Funds have been transferred to your wallet.`,
    relatedId: String(tokenId),
    relatedType: 'trademark',
    link: `/dashboard`,
  });
}

export async function notifyPurchaseComplete(
  buyerAddress: string,
  trademarkName: string,
  tokenId: number
) {
  return createNotification({
    recipientAddress: buyerAddress,
    type: 'purchase_complete',
    title: 'Purchase Successful! 🎉',
    message: `You now own "${trademarkName}". View it in your dashboard.`,
    relatedId: String(tokenId),
    relatedType: 'trademark',
    link: `/dashboard`,
  });
}

export async function notifyLicensePurchased(
  licensorAddress: string,
  licenseeAddress: string,
  trademarkName: string,
  tokenId: number,
  duration: string
) {
  // Notify the licensor (owner)
  await createNotification({
    recipientAddress: licensorAddress,
    type: 'license_purchased',
    title: 'License Sold!',
    message: `A ${duration} license for "${trademarkName}" has been purchased.`,
    relatedId: String(tokenId),
    relatedType: 'license',
    link: `/dashboard`,
  });

  // Notify the licensee (buyer)
  return createNotification({
    recipientAddress: licenseeAddress,
    type: 'license_purchased',
    title: 'License Acquired',
    message: `You now have a ${duration} license for "${trademarkName}".`,
    relatedId: String(tokenId),
    relatedType: 'license',
    link: `/licenses`,
  });
}

export async function notifyRatingReceived(
  creatorAddress: string,
  rating: number,
  reviewerName: string
) {
  return createNotification({
    recipientAddress: creatorAddress,
    type: 'rating_received',
    title: `New ${rating}★ Rating`,
    message: `${reviewerName} gave you a ${rating}-star rating.`,
    relatedType: 'user',
    link: `/dashboard`,
  });
}

export async function notifySystem(
  recipientAddress: string,
  title: string,
  message: string,
  link?: string
) {
  return createNotification({
    recipientAddress,
    type: 'system',
    title,
    message,
    link,
  });
}

// Export the core function for custom notifications
export { createNotification };
