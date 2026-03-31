# Verification System Implementation Guide

## Overview

The SloganChain verification system provides comprehensive trademark authentication through multiple verification methods, QR code generation, and a streamlined admin workflow.

## Features Implemented

### 1. Registration Number Lookup
- Search trademarks by unique registration number
- Real-time blockchain verification
- Database cross-reference for additional metadata

### 2. Token ID Verification
- Direct token ID lookup on blockchain
- Instant verification status
- Complete trademark information retrieval

### 3. QR Code Generation
- Automatic QR code generation for each trademark
- Downloadable QR codes for physical products
- Scannable verification links
- High-resolution output (300x300px)

### 4. Admin Verification Workflow
- Comprehensive verification panel
- Blockchain data validation
- IPFS metadata verification
- Verification checklist
- Approve/Reject functionality with reasons
- Activity logging

## Components

### VerificationSystem Component
**Location:** `components/VerificationSystem.tsx`

**Features:**
- Dual search modes (Registration Number / Token ID)
- Real-time blockchain verification
- QR code generation and download
- Detailed verification results
- Status indicators (Verified/Pending/Not Found)

**Usage:**
```tsx
import VerificationSystem from '@/components/VerificationSystem';

<VerificationSystem />
```

### AdminVerificationPanel Component
**Location:** `components/AdminVerificationPanel.tsx`

**Features:**
- Full trademark details display
- Blockchain data comparison
- IPFS metadata access
- QR code preview and download
- Verification checklist
- Approve/Reject actions
- Rejection reason tracking

**Usage:**
```tsx
import AdminVerificationPanel from '@/components/AdminVerificationPanel';

<AdminVerificationPanel
  trademark={selectedTrademark}
  onVerify={handleVerify}
  onReject={handleReject}
  onClose={handleClose}
/>
```

## API Endpoints

### Trademark Lookup
**Endpoint:** `GET /api/trademarks/lookup`

**Query Parameters:**
- `registrationNumber` (string): Trademark registration number
- `tokenId` (number): Blockchain token ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    "tokenId": 1,
    "companyName": "Company Name",
    "trademarkName": "Trademark",
    "registrationNumber": "TM001234",
    "category": "Technology",
    "verified": true,
    "creatorAddress": "0x...",
    "ipfsHash": "Qm...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Verify Trademark (Admin)
**Endpoint:** `POST /api/admin/verify-trademark`

**Body:**
```json
{
  "trademarkId": "doc_id",
  "tokenId": 1,
  "adminAddress": "0x..."
}
```

### Reject Trademark (Admin)
**Endpoint:** `POST /api/admin/reject-trademark`

**Body:**
```json
{
  "trademarkId": "doc_id",
  "reason": "Rejection reason",
  "adminAddress": "0x..."
}
```

## Verification Flow

### User Verification Flow

1. **Navigate to Verify Page**
   - Go to `/verify`
   - Choose search method (Registration Number or Token ID)

2. **Enter Search Value**
   - Input registration number (e.g., TM001234)
   - OR input token ID (e.g., 1)

3. **View Results**
   - Verification status (Verified/Pending/Not Found)
   - Complete trademark details
   - Owner information
   - QR code for sharing

4. **Download QR Code** (Optional)
   - Click "Download QR Code" button
   - Save for product packaging or marketing materials

### Admin Verification Flow

1. **Access Admin Dashboard**
   - Navigate to `/admin`
   - Connect wallet with admin privileges

2. **Review Pending Trademarks**
   - View list of pending verifications
   - Click "Review & Verify" on any trademark

3. **Verification Panel Opens**
   - Review all trademark details
   - Check blockchain data
   - Verify IPFS metadata
   - Preview QR code

4. **Complete Verification Checklist**
   - ✓ Company name matches registration documents
   - ✓ Registration number is valid and unique
   - ✓ Trademark category is appropriate
   - ✓ IPFS metadata is accessible and valid
   - ✓ No duplicate or conflicting trademarks

5. **Take Action**
   - **Approve:** Click "Approve & Verify"
     - Updates blockchain verification status
     - Logs admin action
     - Sends notification to owner
   
   - **Reject:** Click "Reject Application"
     - Provide detailed rejection reason
     - Updates database status
     - Logs admin action
     - Sends notification to owner

## QR Code Implementation

### Generation
```typescript
import QRCode from 'qrcode';

const verificationUrl = `${window.location.origin}/verify?tokenId=${tokenId}`;
const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
  width: 300,
  margin: 2,
  color: {
    dark: '#1e293b',
    light: '#ffffff',
  },
});
```

### Download
```typescript
const downloadQRCode = () => {
  const link = document.createElement('a');
  link.download = `trademark-${tokenId}-qr.png`;
  link.href = qrCodeUrl;
  link.click();
};
```

## Smart Contract Integration

### Get Trademark by Registration Number
```solidity
function getTokenIdByRegistration(string memory registrationNumber) 
  external 
  view 
  returns (uint256)
```

### Get Trademark Info
```solidity
function getTrademarkInfo(uint256 tokenId) 
  external 
  view 
  returns (Trademark memory)
```

### Verify Trademark (Admin Only)
```solidity
function verifyTrademark(uint256 tokenId) 
  external 
  onlyOwner
```

## Database Schema

### Trademarks Collection
```typescript
{
  id: string;
  tokenId: number;
  companyName: string;
  trademarkName: string;
  registrationNumber: string;
  category: string;
  creatorAddress: string;
  ipfsHash: string;
  verified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Admin Logs Collection
```typescript
{
  id: string;
  adminAddress: string;
  action: 'verify' | 'reject' | 'suspend_user' | 'suspend_listing';
  targetType: 'trademark' | 'user' | 'listing';
  targetId: string;
  reason?: string;
  timestamp: Timestamp;
}
```

## Security Considerations

### Admin Access Control
- Admin addresses stored in environment variables
- Wallet signature verification required
- All admin actions logged
- Rate limiting on verification endpoints

### Data Validation
- Registration number uniqueness check
- Token ID existence verification
- IPFS hash format validation
- Owner address verification

### Blockchain Verification
- Direct smart contract queries
- No reliance on cached data for verification
- Real-time ownership validation
- Immutable verification records

## Testing

### Manual Testing Checklist

**User Verification:**
- [ ] Search by registration number works
- [ ] Search by token ID works
- [ ] Invalid searches show appropriate errors
- [ ] QR code generates correctly
- [ ] QR code download works
- [ ] Verification status displays correctly

**Admin Verification:**
- [ ] Admin can access verification panel
- [ ] All trademark details display correctly
- [ ] Blockchain data loads properly
- [ ] QR code preview works
- [ ] Approve action updates status
- [ ] Reject action requires reason
- [ ] Admin logs are created

### Test Data
```javascript
// Test Registration Numbers
TM001234 - Verified trademark
TM005678 - Pending trademark
TM999999 - Non-existent

// Test Token IDs
1 - Verified
2 - Pending
999 - Non-existent
```

## Usage Examples

### Verify by Registration Number
```typescript
// User enters: TM001234
// System:
// 1. Calls contract.getTokenIdByRegistration("TM001234")
// 2. Gets tokenId = 1
// 3. Calls contract.getTrademarkInfo(1)
// 4. Generates QR code
// 5. Displays results
```

### Verify by Token ID
```typescript
// User enters: 1
// System:
// 1. Calls contract.getTrademarkInfo(1)
// 2. Generates QR code
// 3. Displays results
```

### Admin Verification
```typescript
// Admin clicks "Review & Verify"
// System:
// 1. Opens AdminVerificationPanel
// 2. Loads blockchain data
// 3. Generates QR code
// 4. Admin reviews and approves
// 5. Calls contract.verifyTrademark(tokenId)
// 6. Updates database
// 7. Creates admin log
```

## Troubleshooting

### QR Code Not Generating
- Check if `qrcode` package is installed
- Verify URL format is correct
- Check browser console for errors

### Verification Fails
- Ensure wallet is connected
- Check if contract address is correct
- Verify network connection (Polygon Amoy)
- Check if token exists on blockchain

### Admin Actions Fail
- Verify admin address in environment variables
- Check wallet connection
- Ensure sufficient gas for transactions
- Verify contract ownership

## Future Enhancements

1. **Batch Verification**
   - Verify multiple trademarks at once
   - Bulk QR code generation

2. **Advanced QR Codes**
   - Custom branding
   - Logo embedding
   - Color customization

3. **Mobile App Integration**
   - Native QR scanner
   - Push notifications
   - Offline verification cache

4. **Analytics Dashboard**
   - Verification statistics
   - Popular trademarks
   - Geographic distribution

5. **API Rate Limiting**
   - Prevent abuse
   - Usage quotas
   - API key management

## Support

For issues or questions:
- Check the troubleshooting section
- Review smart contract events
- Check admin logs in database
- Contact system administrator

## License

MIT License - See LICENSE file for details
