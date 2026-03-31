# Trademark Display Fix

## Problem
Trademark cards were showing:
- "Untitled Trademark" instead of actual slogan text
- "Invalid Date" for registration dates
- Truncated company names (just first letter)
- Missing or incomplete data

## Root Causes

1. **Firestore Timestamp Serialization**
   - Firebase Timestamps weren't being converted to JavaScript Date objects
   - JSON serialization was failing for Timestamp objects
   - Resulted in "Invalid Date" errors

2. **Data Structure Mismatch**
   - Database might have been seeded with incomplete data
   - Field names might not match expected structure
   - Missing required fields like `sloganText`, `companyName`

## Solutions Applied

### 1. Fixed API Timestamp Conversion (`pages/api/trademarks/index.ts`)

Added proper Firestore Timestamp to ISO string conversion:

```typescript
const trademarks = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // Convert Firestore Timestamps to ISO strings
    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    verifiedAt: data.verifiedAt?.toDate?.() ? data.verifiedAt.toDate().toISOString() : data.verifiedAt,
  };
});
```

### 2. Added Debug Logging

Added console logging to see what data is actually in the database:

```typescript
console.log('Raw trademark data:', {
  id: doc.id,
  sloganText: data.sloganText,
  companyName: data.companyName,
  createdAt: data.createdAt,
});
```

### 3. Created Database Re-seeding Script

Created `scripts/reseed-database.js` to:
- Clear existing corrupted data
- Seed fresh, properly structured data
- Include all required fields
- Add sample images from Unsplash

### 4. Safe Property Access (Already Fixed)

TrademarkCard component already has safe property access:
- `trademark.sloganText?.charAt(0) || '?'`
- `trademark.companyName || 'Unknown'`
- Proper date handling with null checks

## How to Fix Your Database

### Option 1: Quick Fix (Recommended)

Run the re-seeding script:

**Windows:**
```bash
reseed-database.bat
```

**Mac/Linux:**
```bash
node scripts/reseed-database.js
```

This will:
1. Clear all existing trademarks and users
2. Add 3 fresh trademarks with complete data
3. Add 3 users with proper structure

### Option 2: Manual Fix

If you want to keep existing data, manually update each trademark document in Firebase Console to include:

Required fields:
- `sloganText` (string) - The trademark text
- `companyName` (string) - Company name
- `description` (string) - Description
- `category` (string) - Category name
- `createdAt` (Timestamp) - Creation timestamp
- `tokenId` (number) - Unique token ID
- `creatorAddress` (string) - Wallet address
- `verified` (boolean) - Verification status
- `verificationStatus` (string) - 'pending', 'verified', or 'rejected'

Optional but recommended:
- `imageUrl` (string) - Direct image URL
- `ipfsHash` (string) - IPFS hash
- `registrationNumber` (string) - Registration number
- `royaltyPercentage` (number) - Royalty percentage

## Testing

After re-seeding:

1. **Check API Response:**
   ```bash
   curl http://localhost:3000/api/trademarks
   ```
   
   Should return properly formatted data with:
   - Full `sloganText`
   - Full `companyName`
   - Valid ISO date strings for `createdAt`

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for "Raw trademark data:" logs
   - Verify all fields are present

3. **Check Home Page:**
   - Refresh browser
   - Should see proper trademark names
   - Should see valid dates
   - Should see full company names

## Expected Data Structure

Each trademark document should look like:

```json
{
  "tokenId": 1,
  "creatorAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "currentOwner": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "companyName": "TechVision Inc.",
  "sloganText": "Innovation Beyond Imagination",
  "registrationNumber": "TM2024001",
  "category": "Technology",
  "description": "Inspiring slogan for AI and cloud computing",
  "ipfsHash": "QmTechVision123",
  "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
  "royaltyPercentage": 10,
  "verified": true,
  "verificationStatus": "verified",
  "language": "English",
  "usageContext": "Brand marketing and advertising campaigns",
  "createdAt": "2024-02-17T10:30:00.000Z",
  "updatedAt": "2024-02-17T10:30:00.000Z"
}
```

## Troubleshooting

### Still seeing "Untitled Trademark"?

1. Check browser console for API errors
2. Verify Firebase credentials in `.env` or `.env.local`
3. Check Firebase Console to see actual data
4. Run re-seed script again
5. Hard refresh browser (Ctrl+Shift+R)

### Still seeing "Invalid Date"?

1. Check API logs for timestamp conversion
2. Verify `createdAt` is a Firestore Timestamp in database
3. Check that API is converting timestamps properly
4. Clear browser cache

### Data not updating?

1. Stop dev server (Ctrl+C)
2. Run re-seed script
3. Start dev server again: `npm run dev`
4. Hard refresh browser

## Prevention

To prevent this issue in the future:

1. Always use the seed scripts to populate data
2. Ensure all required fields are present when creating trademarks
3. Use Firestore Timestamps for date fields
4. Test API responses before displaying in UI
5. Add validation in API endpoints

## Files Modified

- `pages/api/trademarks/index.ts` - Added timestamp conversion and debug logging
- `scripts/reseed-database.js` - New re-seeding script
- `reseed-database.bat` - Windows batch file for easy execution
- `components/TrademarkCard.tsx` - Already had safe property access

## Next Steps

1. Run the re-seed script
2. Refresh your browser
3. Verify trademarks display correctly
4. Remove debug logging from API once confirmed working
