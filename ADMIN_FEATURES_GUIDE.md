# Admin Features Guide

## Overview
This guide explains how to use the new admin features that align with the sequence diagrams.

## Setup

### 1. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Admin wallet address (public)
NEXT_PUBLIC_ADMIN_ADDRESS=0xYourAdminAddress

# Admin wallet address (server-side)
ADMIN_ADDRESS=0xYourAdminAddress

# Admin private key for blockchain transactions (KEEP SECRET!)
ADMIN_PRIVATE_KEY=0xYourPrivateKey

# Blockchain RPC URL
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
```

### 2. Deploy Smart Contract

Ensure your `TrademarkNFT` contract has the `verifyTrademark()` function:

```solidity
function verifyTrademark(uint256 tokenId) external onlyOwner {
    require(_exists(tokenId), "Token does not exist");
    trademarks[tokenId].verified = true;
    emit TrademarkVerified(tokenId, msg.sender);
}
```

## Features

### 1. Trademark Verification (with Blockchain Update)

**Endpoint:** `POST /api/admin/verify-trademark`

**Request:**
```json
{
  "trademarkId": "firestore-doc-id",
  "tokenId": 123,
  "adminAddress": "0xAdminAddress"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trademark verified successfully",
  "data": {
    "trademarkId": "firestore-doc-id",
    "tokenId": 123,
    "verified": true,
    "blockchainTxHash": "0x..."
  }
}
```

**What it does:**
1. Validates admin credentials
2. Fetches trademark from database
3. Calls smart contract `verifyTrademark(tokenId)`
4. Updates database with verification status
5. Stores blockchain transaction hash

### 2. User Suspension

**Endpoint:** `POST /api/admin/suspend-user`

**Request:**
```json
{
  "userAddress": "0xUserAddress",
  "suspended": true,
  "adminAddress": "0xAdminAddress",
  "reason": "Fraudulent activity detected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "userAddress": "0xuseraddress",
    "suspended": true
  }
}
```

**What it does:**
- Suspends or unsuspends a user account
- Logs the action in `admin_logs` collection
- Prevents suspended users from creating listings

### 3. Listing Suspension

**Endpoint:** `POST /api/admin/suspend-listing`

**Request:**
```json
{
  "listingId": "listing-id",
  "suspended": true,
  "adminAddress": "0xAdminAddress",
  "reason": "Violates terms of service"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing suspended successfully",
  "data": {
    "listingId": "listing-id",
    "suspended": true
  }
}
```

**What it does:**
- Suspends or unsuspends a marketplace listing
- Automatically deactivates listing when suspended
- Logs the action for audit trail

### 4. View Reports

**Endpoint:** `GET /api/admin/reports`

**Query Parameters:**
- `adminAddress` (required): Admin wallet address
- `status` (optional): Filter by status (pending, resolved, dismissed)
- `type` (optional): Filter by type (spam, fraud, copyright, etc.)
- `limitCount` (optional): Number of reports to return (default: 50)

**Example:**
```
GET /api/admin/reports?adminAddress=0xAdmin&status=pending&limitCount=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "report-id",
      "type": "spam",
      "targetId": "trademark-id",
      "targetType": "trademark",
      "reason": "Fake trademark",
      "description": "This appears to be a fraudulent trademark",
      "reporterAddress": "0xReporter",
      "status": "pending",
      "createdAt": "2024-11-20T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 5. Resolve Report

**Endpoint:** `PUT /api/admin/reports`

**Request:**
```json
{
  "reportId": "report-id",
  "status": "resolved",
  "resolution": "Trademark removed and user suspended",
  "adminAddress": "0xAdminAddress"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "reportId": "report-id",
    "status": "resolved"
  }
}
```

### 6. Submit Report (User Feature)

**Endpoint:** `POST /api/reports/create`

**Request:**
```json
{
  "type": "fraud",
  "targetId": "trademark-123",
  "targetType": "trademark",
  "reason": "Counterfeit trademark",
  "description": "This trademark is a copy of an existing brand",
  "reporterAddress": "0xUserAddress"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "reportId": "new-report-id"
  }
}
```

## Admin Dashboard Usage

### Accessing the Dashboard

1. Navigate to `/admin`
2. Connect your wallet (must be configured admin address)
3. Dashboard will load if you have admin privileges

### Dashboard Tabs

#### 1. Pending Review Tab
- Shows all unverified trademarks
- Click "View Details" to see full information
- Click "Verify" to approve (updates blockchain + database)
- Click "Reject" to deny the trademark

#### 2. Verified Tab
- Shows all verified trademarks
- View-only mode for verified items
- Can still access full details

#### 3. Reports Tab (NEW)
- Shows all pending reports
- Click "Review" to see report details
- Options:
  - **Resolve (Action Taken)**: Mark as resolved with action
  - **Dismiss**: Mark as dismissed without action

### Statistics Cards

The dashboard shows:
- **Pending Review**: Number of unverified trademarks
- **Verified**: Number of verified trademarks
- **Pending Reports**: Number of unresolved reports
- **Total Trademarks**: Total count of all trademarks

## Database Collections

### admin_logs
Tracks all admin actions:
```typescript
{
  action: 'user_suspended' | 'user_unsuspended' | 'listing_suspended' | 'listing_unsuspended',
  targetUser?: string,
  targetListing?: string,
  adminAddress: string,
  reason: string,
  timestamp: Timestamp
}
```

### reports
Stores user-submitted reports:
```typescript
{
  id: string,
  type: 'spam' | 'fraud' | 'copyright' | 'inappropriate' | 'other',
  targetId: string,
  targetType: 'trademark' | 'listing' | 'user',
  reason: string,
  description: string,
  reporterAddress: string,
  status: 'pending' | 'resolved' | 'dismissed',
  resolution?: string,
  resolvedBy?: string,
  resolvedAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### users (updated)
User documents now include suspension info:
```typescript
{
  address: string,
  suspended: boolean,
  suspendedAt?: Timestamp,
  suspendedBy?: string,
  suspensionReason?: string,
  unsuspendedAt?: Timestamp,
  // ... other fields
}
```

### listings (updated)
Listing documents now include suspension info:
```typescript
{
  listingId: string,
  suspended: boolean,
  suspendedAt?: Timestamp,
  suspendedBy?: string,
  suspensionReason?: string,
  // ... other fields
}
```

## Security Best Practices

1. **Never commit private keys**: Use environment variables
2. **Rotate admin keys**: Regularly update admin private key
3. **Monitor admin logs**: Review `admin_logs` collection regularly
4. **Rate limiting**: Implement rate limiting on report endpoints
5. **Multi-sig**: Consider using multi-signature wallet for admin actions
6. **Audit trail**: All actions are logged with timestamps and addresses

## Troubleshooting

### "Unauthorized: Admin privileges required"
- Check that `ADMIN_ADDRESS` and `NEXT_PUBLIC_ADMIN_ADDRESS` match your wallet
- Ensure wallet is connected
- Verify environment variables are loaded

### "Failed to verify trademark"
- Check that `ADMIN_PRIVATE_KEY` is set correctly
- Ensure RPC URL is accessible
- Verify smart contract has `verifyTrademark()` function
- Check that admin wallet has enough gas

### Reports not loading
- Verify admin address is correct
- Check Firestore rules allow admin read access
- Ensure `reports` collection exists

## Testing

### Test Admin Verification
```bash
curl -X POST http://localhost:3000/api/admin/verify-trademark \
  -H "Content-Type: application/json" \
  -d '{
    "trademarkId": "test-id",
    "tokenId": 1,
    "adminAddress": "0xYourAdminAddress"
  }'
```

### Test User Suspension
```bash
curl -X POST http://localhost:3000/api/admin/suspend-user \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0xUserToSuspend",
    "suspended": true,
    "adminAddress": "0xYourAdminAddress",
    "reason": "Test suspension"
  }'
```

### Test Report Submission
```bash
curl -X POST http://localhost:3000/api/reports/create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "spam",
    "targetId": "trademark-123",
    "targetType": "trademark",
    "reason": "Test report",
    "reporterAddress": "0xReporterAddress"
  }'
```

## Next Steps

1. Configure admin wallet and environment variables
2. Test verification flow with blockchain update
3. Test suspension features
4. Test reporting system
5. Monitor admin logs for audit trail
6. Consider implementing email notifications for reports
7. Add analytics dashboard for admin metrics
