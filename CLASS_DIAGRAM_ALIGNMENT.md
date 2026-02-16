# Class Diagram Alignment Documentation

This document describes how the project has been updated to align with the class diagram provided.

## Overview

The project has been updated to match the class diagram structure, ensuring all entities, relationships, and methods are properly implemented.

## Database Collections (Firestore)

### 1. Users Collection
**Fields (from class diagram):**
- `id` (document ID)
- `address` (wallet address)
- `walletAddress` (explicit field)
- `displayName`
- `email`
- `role` (buyer/creator/admin)
- `createdAt`
- `updatedAt`
- `totalTrademarks`
- `totalSales`
- `totalPurchases`
- `verified`
- `suspended`
- `suspensionReason`
- `averageRating`
- `ratingCount`
- `profileImage`

**Methods:**
- `getUserProfile()`
- `updateProfile()`
- `createNotification()`

### 2. Trademarks Collection
**Fields (from class diagram):**
- `tokenId`
- `creatorAddress`
- `currentOwner`
- `companyName`
- `sloganText`
- `registrationNumber`
- `category`
- `description`
- `ipfsHash`
- `royaltyPercentage`
- `createdAt`
- `updatedAt`
- `transactionHash`
- `verified`
- `verificationStatus` (pending/verified/rejected)
- `verifiedBy`
- `verifiedAt`
- `rejectionReason`
- `views`
- `listingCount`
- `salesCount`

**Methods:**
- `createTrademark()`
- `getTrademark()`
- `getTrademarksByOwner()`
- `updateTrademark()`
- `verifyTrademark()`
- `rejectTrademark()`

### 3. Listings Collection
**Fields (from class diagram):**
- `listingId`
- `tokenId`
- `seller`
- `owner`
- `price`
- `type` (sale/license)
- `isLicense`
- `duration`
- `licenseDuration`
- `active`
- `status` (active/sold/cancelled/expired/suspended)
- `suspended`
- `suspensionReason`
- `createdAt`
- `updatedAt`
- `expiresAt`
- `soldAt`
- `views`

**Methods:**
- `createListing()`
- `getActiveListings()`
- `getListing()`
- `updateListing()`
- `deleteListing()`
- `suspendListing()`

### 4. Transactions Collection
**Fields (from class diagram):**
- `id`
- `type` (registration/listing/sale/license/royalty)
- `tokenId`
- `listingId`
- `fromAddress`
- `toAddress`
- `amount`
- `royaltyAmount`
- `transactionHash`
- `transactionType` (mint/transfer/purchase/license)
- `status` (pending/confirmed/failed)
- `blockNumber`
- `gasUsed`
- `createdAt`
- `confirmedAt`

**Methods:**
- `createTransaction()`
- `getTransactionsByUser()`
- `recordBlockchainSync()`

### 5. Ratings Collection (NEW)
**Fields (from class diagram):**
- `id`
- `creatorAddress`
- `trademarkId`
- `rating` (1-5)
- `review`
- `reviewerAddress`
- `createdAt`
- `updatedAt`

**Methods:**
- `createRating()`
- `getRatingsByCreator()`
- `getAverageRating()`

**API Endpoints:**
- `POST /api/ratings/create` - Create a new rating
- `GET /api/ratings/creator/[address]` - Get ratings for a creator

### 6. Reports Collection (NEW)
**Fields (from class diagram):**
- `id`
- `type` (spam/fraud/copyright/inappropriate/other)
- `targetId`
- `targetType` (trademark/listing/user)
- `reason`
- `description`
- `reporterAddress`
- `status` (pending/resolved/dismissed)
- `resolution`
- `resolvedBy`
- `resolvedAt`
- `createdAt`
- `updatedAt`

**Methods:**
- `createReport()`
- `getReports()`
- `updateReport()`

**API Endpoints:**
- `POST /api/reports/create` - Submit a report
- `GET /api/admin/reports` - Get all reports (admin only)
- `PUT /api/admin/reports` - Update report status (admin only)

### 7. Notifications Collection (NEW)
**Fields (from class diagram):**
- `id`
- `userId` (wallet address)
- `type` (rating/listing/sale/license/report/admin/verification)
- `title`
- `message`
- `read`
- `relatedId`
- `actionUrl`
- `createdAt`
- `readAt`

**Methods:**
- `createNotification()`
- `getUserNotifications()`
- `markNotificationAsRead()`

**API Endpoints:**
- `GET /api/notifications/index` - Get user notifications
- `PUT /api/notifications/[id]` - Mark notification as read

### 8. AdminLogs Collection (NEW)
**Fields (from class diagram):**
- `id`
- `adminAddress`
- `action` (verify/reject/suspend_user/suspend_listing/resolve_report/dismiss_report)
- `targetType` (trademark/listing/user/report)
- `targetId`
- `reason`
- `metadata`
- `timestamp`

**Methods:**
- `createAdminLog()`
- `getAdminLogs()`

**API Endpoints:**
- `GET /api/admin/logs` - Get admin activity logs (admin only)

### 9. Categories Collection (NEW)
**Fields (from class diagram):**
- `id`
- `name`
- `icon`
- `description`
- `trademarkCount`
- `createdAt`
- `updatedAt`

**Methods:**
- `getCategories()`
- `updateCategory()`
- `incrementCategoryCount()`

**API Endpoints:**
- `GET /api/categories/index` - Get all categories

### 10. Licenses Collection
**Fields:**
- `licenseId`
- `tokenId`
- `licensee`
- `licensor`
- `price`
- `duration`
- `issuedAt`
- `expiresAt`
- `active`

**Methods:**
- `createLicense()`
- `getUserLicenses()`

## Relationships (from Class Diagram)

### User Relationships
- **Users → Trademarks**: One-to-Many (creator relationship)
  - A user can create multiple trademarks
  - Implemented via `creatorAddress` field in Trademarks

- **Users → Listings**: One-to-Many (seller relationship)
  - A user can create multiple listings
  - Implemented via `seller` field in Listings

- **Users → Ratings**: One-to-Many (reviewer relationship)
  - A user can create multiple ratings
  - Implemented via `reviewerAddress` field in Ratings

- **Users → Reports**: One-to-Many (reporter relationship)
  - A user can submit multiple reports
  - Implemented via `reporterAddress` field in Reports

- **Users → Notifications**: One-to-Many
  - A user can have multiple notifications
  - Implemented via `userId` field in Notifications

### Trademark Relationships
- **Trademarks → Listings**: One-to-Many
  - A trademark can have multiple listings
  - Implemented via `tokenId` field in Listings

- **Trademarks → Transactions**: One-to-Many
  - A trademark can have multiple transactions
  - Implemented via `tokenId` field in Transactions

- **Trademarks → Ratings**: One-to-Many
  - A trademark can have multiple ratings
  - Implemented via `trademarkId` field in Ratings

### Listing Relationships
- **Listings → Transactions**: One-to-Many
  - A listing can have multiple transactions
  - Implemented via `listingId` field in Transactions

- **Listings → Licenses**: One-to-Many
  - A listing can generate multiple licenses
  - Implemented via `tokenId` relationship

### Category Relationships
- **Categories → Trademarks**: One-to-Many
  - A category can contain multiple trademarks
  - Implemented via `category` field in Trademarks

## Updated API Endpoints

### New Endpoints Created
1. **Notifications API**
   - `GET /api/notifications/index?address={address}&unreadOnly={boolean}`
   - `PUT /api/notifications/[id]`

2. **Categories API**
   - `GET /api/categories/index`

3. **Admin Logs API**
   - `GET /api/admin/logs?adminAddress={address}&limit={number}`

### Updated Endpoints
1. **Admin Verify Trademark**
   - Now creates admin logs
   - Updates `verificationStatus` field

2. **Admin Reject Trademark**
   - Now creates admin logs
   - Updates `verificationStatus` field

3. **Admin Suspend User**
   - Now uses `dbService.suspendUser()` method
   - Creates admin logs automatically

4. **Admin Suspend Listing**
   - Now uses `dbService.suspendListing()` method
   - Creates admin logs automatically

## Database Service Methods

All methods from the class diagram have been implemented in `lib/db-service.ts`:

### User Methods
- `createOrUpdateUser()`
- `getUser()`
- `suspendUser()`
- `unsuspendUser()`

### Trademark Methods
- `createTrademark()`
- `getTrademark()`
- `getTrademarksByOwner()`
- `updateTrademark()`
- `updateTrademarkOwner()`
- `verifyTrademark()`
- `rejectTrademark()`

### Listing Methods
- `createListing()`
- `getActiveListings()`
- `getListing()`
- `updateListing()`
- `deleteListing()`
- `suspendListing()`

### Transaction Methods
- `createTransaction()`
- `getTransactionsByUser()`

### Rating Methods
- `createRating()`
- `getRatingsByCreator()`
- `getAverageRating()`

### Notification Methods
- `createNotification()`
- `getUserNotifications()`
- `markNotificationAsRead()`

### Report Methods
- `createReport()`
- `getReports()`
- `updateReport()`

### Admin Log Methods
- `createAdminLog()`
- `getAdminLogs()`

### Category Methods
- `getCategories()`
- `updateCategory()`
- `incrementCategoryCount()`

### License Methods
- `createLicense()`
- `getUserLicenses()`

### Activity Methods
- `createActivityLog()`
- `getRecentActivity()`

### Statistics Methods
- `getStats()`

## Type Definitions

All types have been updated in `types/index.ts` to match the class diagram:

- `UserProfile` - Enhanced with all fields from diagram
- `SloganMetadata/TrademarkMetadata` - Added verification fields
- `Listing` - Added status and suspension fields
- `Transaction` - Enhanced with blockchain details
- `Rating` - New type
- `Notification` - New type
- `Category` - New type
- `AdminLog` - New type
- `Report` - Existing, verified alignment

## Implementation Status

✅ **Completed:**
- All database collections defined
- All type definitions updated
- All database service methods implemented
- All API endpoints created/updated
- All relationships properly implemented
- Admin logging system integrated
- Notification system implemented
- Rating system implemented
- Report system verified
- Category system implemented

## Next Steps (Optional Enhancements)

1. **Frontend Components:**
   - Create NotificationBell component
   - Create AdminLogViewer component
   - Update CategoryGrid to use new API

2. **Real-time Updates:**
   - Implement Firestore listeners for notifications
   - Add real-time updates for admin logs

3. **Testing:**
   - Add unit tests for new database methods
   - Add integration tests for new API endpoints
   - Test all relationships and cascading operations

4. **Documentation:**
   - Add API documentation for new endpoints
   - Create user guide for notification system
   - Document admin logging system

## Conclusion

The project has been successfully aligned with the class diagram. All entities, relationships, and methods shown in the diagram are now properly implemented in the codebase. The database structure, API endpoints, and type definitions all match the design specifications.
