# Class Diagram Quick Reference

## Quick API Reference

### Notifications
```typescript
// Get user notifications
GET /api/notifications/index?address={walletAddress}&unreadOnly=true

// Mark notification as read
PUT /api/notifications/{notificationId}
```

### Categories
```typescript
// Get all categories
GET /api/categories/index
```

### Admin Logs
```typescript
// Get admin activity logs (admin only)
GET /api/admin/logs?adminAddress={adminAddress}&limit=100
```

### Ratings
```typescript
// Create a rating
POST /api/ratings/create
Body: {
  creatorAddress: string,
  trademarkId: number,
  rating: number (1-5),
  review?: string,
  reviewerAddress: string
}

// Get creator ratings
GET /api/ratings/creator/{address}
```

### Reports
```typescript
// Submit a report
POST /api/reports/create
Body: {
  type: 'spam' | 'fraud' | 'copyright' | 'inappropriate' | 'other',
  targetId: string,
  targetType: 'trademark' | 'listing' | 'user',
  reason: string,
  description?: string,
  reporterAddress: string
}

// Get reports (admin only)
GET /api/admin/reports?adminAddress={address}&status={status}

// Update report (admin only)
PUT /api/admin/reports
Body: {
  reportId: string,
  status: 'pending' | 'resolved' | 'dismissed',
  resolution?: string
}
```

## Database Service Quick Reference

### Using dbService in Your Code

```typescript
import { dbService } from '@/lib/db-service';

// Ratings
const rating = await dbService.createRating({
  creatorAddress: '0x...',
  trademarkId: 1,
  rating: 5,
  review: 'Great trademark!',
  reviewerAddress: '0x...'
});

const ratings = await dbService.getRatingsByCreator('0x...');
const avgRating = await dbService.getAverageRating('0x...');

// Notifications
const notification = await dbService.createNotification({
  userId: '0x...',
  type: 'rating',
  title: 'New Rating',
  message: 'You received a 5-star rating!',
  relatedId: '1',
  actionUrl: '/trademark/1'
});

const notifications = await dbService.getUserNotifications('0x...', true); // unread only
await dbService.markNotificationAsRead(notificationId);

// Reports
const report = await dbService.createReport({
  type: 'spam',
  targetId: '1',
  targetType: 'trademark',
  reason: 'Spam content',
  reporterAddress: '0x...'
});

const reports = await dbService.getReports('pending');
await dbService.updateReport(reportId, { status: 'resolved' });

// Admin Actions
await dbService.suspendUser('0x...', 'Violation of terms', '0xAdmin...');
await dbService.unsuspendUser('0x...', '0xAdmin...');
await dbService.suspendListing('listingId', 'Fraudulent', '0xAdmin...');
await dbService.verifyTrademark(tokenId, '0xAdmin...');
await dbService.rejectTrademark(tokenId, 'Invalid documents', '0xAdmin...');

// Categories
const categories = await dbService.getCategories();
await dbService.incrementCategoryCount('Technology');

// Admin Logs
const logs = await dbService.getAdminLogs(50);

// Statistics
const stats = await dbService.getStats();
// Returns: { totalTrademarks, totalUsers, activeListings, totalTransactions }
```

## Type Definitions Quick Reference

### Key Types

```typescript
// User with full profile
interface UserProfile {
  address: string;
  role: 'buyer' | 'creator' | 'admin';
  suspended: boolean;
  averageRating?: number;
  ratingCount: number;
  // ... more fields
}

// Trademark with verification
interface TrademarkMetadata {
  tokenId: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verified: boolean;
  rejectionReason?: string;
  // ... more fields
}

// Listing with status
interface Listing {
  listingId: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired' | 'suspended';
  suspended: boolean;
  // ... more fields
}

// Rating
interface Rating {
  id: string;
  creatorAddress: string;
  trademarkId: number;
  rating: number; // 1-5
  review?: string;
  reviewerAddress: string;
}

// Notification
interface Notification {
  id: string;
  userId: string;
  type: 'rating' | 'listing' | 'sale' | 'license' | 'report' | 'admin' | 'verification';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  actionUrl?: string;
}

// Admin Log
interface AdminLog {
  id: string;
  adminAddress: string;
  action: 'verify' | 'reject' | 'suspend_user' | 'suspend_listing' | 'resolve_report' | 'dismiss_report';
  targetType: 'trademark' | 'listing' | 'user' | 'report';
  targetId: string;
  reason?: string;
  timestamp: Date;
}
```

## Common Workflows

### 1. User Rates a Creator
```typescript
// 1. Create rating
await dbService.createRating({
  creatorAddress,
  trademarkId,
  rating: 5,
  review: 'Excellent!',
  reviewerAddress
});

// 2. Create notification for creator
await dbService.createNotification({
  userId: creatorAddress,
  type: 'rating',
  title: 'New Rating',
  message: `You received a ${rating}-star rating!`,
  relatedId: trademarkId.toString(),
  actionUrl: `/trademark/${trademarkId}`
});

// 3. Update user's average rating
const avgRating = await dbService.getAverageRating(creatorAddress);
await dbService.createOrUpdateUser(creatorAddress, {
  averageRating: avgRating.data.average,
  ratingCount: avgRating.data.count
});
```

### 2. Admin Verifies Trademark
```typescript
// Single method call handles everything:
// - Updates trademark verification status
// - Creates admin log
await dbService.verifyTrademark(tokenId, adminAddress);

// Optionally notify the creator
await dbService.createNotification({
  userId: creatorAddress,
  type: 'verification',
  title: 'Trademark Verified',
  message: 'Your trademark has been verified!',
  relatedId: tokenId.toString(),
  actionUrl: `/trademark/${tokenId}`
});
```

### 3. User Reports Content
```typescript
// 1. Create report
await dbService.createReport({
  type: 'spam',
  targetId: listingId,
  targetType: 'listing',
  reason: 'Spam content',
  description: 'This listing contains spam',
  reporterAddress
});

// 2. Notify admins (optional)
const adminAddresses = ['0xAdmin1...', '0xAdmin2...'];
for (const adminAddr of adminAddresses) {
  await dbService.createNotification({
    userId: adminAddr,
    type: 'report',
    title: 'New Report',
    message: 'A new report has been submitted',
    actionUrl: '/admin/reports'
  });
}
```

### 4. Admin Suspends User
```typescript
// Single method call handles:
// - Updates user suspension status
// - Creates admin log
await dbService.suspendUser(
  userAddress,
  'Violation of terms',
  adminAddress
);

// Notify the user
await dbService.createNotification({
  userId: userAddress,
  type: 'admin',
  title: 'Account Suspended',
  message: 'Your account has been suspended',
  actionUrl: '/support'
});
```

## Database Collections

All collections are automatically managed by dbService:

- `users` - User profiles
- `trademarks` - Trademark metadata
- `listings` - Marketplace listings
- `transactions` - Transaction records
- `ratings` - Creator ratings
- `reports` - User reports
- `notifications` - User notifications
- `admin_logs` - Admin activity logs
- `categories` - Category information
- `licenses` - License agreements
- `activity_logs` - General activity

## Admin Privileges

Admin addresses are configured in environment variables:
- `NEXT_PUBLIC_ADMIN_ADDRESS`
- `ADMIN_ADDRESS`

Admin-only endpoints check these addresses before allowing access.

## Best Practices

1. **Always create notifications** for important user actions
2. **Use admin logging** for all administrative actions
3. **Check suspension status** before allowing user actions
4. **Update statistics** when creating/deleting entities
5. **Handle errors gracefully** - all methods return `{ success, data?, error? }`
6. **Use transactions** for operations that modify multiple collections
7. **Validate input** before calling database methods
8. **Check permissions** before admin operations

## Error Handling

All dbService methods return a consistent format:

```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: 'Error message' }

// Usage
const result = await dbService.createRating(data);
if (!result.success) {
  console.error(result.error);
  return;
}
// Use result.data
```
