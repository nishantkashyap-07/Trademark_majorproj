# Licensing System - Quick Start Guide

## For Trademark Owners

### How to Create a License Listing

1. **Navigate to Your Trademark**
   - Go to your dashboard or marketplace
   - Click on a trademark you own

2. **Open License Modal**
   - Click the "Create License Listing" button
   - Or go to the "Licenses" tab and click "Create License"

3. **Set License Terms**
   - **Price**: Enter the license fee in ETH (e.g., 0.1 ETH)
   - **Duration**: Choose from:
     - 1 Month
     - 3 Months
     - 6 Months
     - 1 Year
     - Perpetual (never expires)
   - **Listing Expiry**: How long the offer stays active (in days)

4. **Confirm Transaction**
   - Review the details
   - Click "Create Listing"
   - Approve the transaction in MetaMask
   - Wait for blockchain confirmation

5. **Track Your Licenses**
   - Visit `/licenses` page
   - Switch to "Granted Licenses" tab
   - See all licenses you've issued

## For License Buyers

### How to Purchase a License

1. **Find a Trademark**
   - Browse the marketplace
   - Click on a trademark you're interested in

2. **View License Options**
   - Go to the "Licenses" tab
   - See available license listings with:
     - Price
     - Duration
     - Terms

3. **Purchase License**
   - Click on a license listing
   - Review the terms in the modal
   - Click "Purchase for X ETH"
   - Approve the transaction in MetaMask

4. **Access Your Licenses**
   - Visit `/licenses` page
   - View all your purchased licenses
   - Check expiration dates
   - See days remaining

## Key Features

### License Types
- **Time-Limited**: Expires after set duration (1 month to 1 year)
- **Perpetual**: Never expires, lifetime access

### Benefits
- **For Owners**: Keep your NFT, earn recurring revenue
- **For Buyers**: Use trademarks without full purchase cost
- **For Everyone**: Blockchain-verified, transparent, secure

### Fees
- Marketplace fee: 2.5%
- No royalty fees on licenses
- Owner receives 97.5% of license price

## Navigation

- **Main Navigation**: Click "Licenses" in the top menu
- **Trademark Pages**: "Licenses" tab on any trademark detail page
- **Dashboard**: Quick access to your licenses

## Smart Contract Functions

### For Developers

```typescript
// Create a license listing
await createListing(signer, {
  tokenId: 1,
  price: "0.1",
  isLicense: true,
  duration: 2592000, // 30 days in seconds
  expiresAt: 0 // Never expires
});

// Purchase a license
await licenseTrademark(
  signer,
  listingId,
  duration,
  price
);

// Check if user has active license
const hasLicense = await hasActiveLicense(tokenId, userAddress);

// Get all licenses for a token
const licenses = await getLicensesForToken(tokenId);
```

## Troubleshooting

### "Transaction Failed"
- Check you have enough ETH for the license + gas fees
- Ensure you're not trying to license your own trademark
- Verify the listing is still active

### "Listing Not Found"
- The listing may have expired
- The owner may have cancelled it
- Refresh the page and try again

### "License Not Showing"
- Wait for blockchain confirmation (can take 30-60 seconds)
- Refresh the `/licenses` page
- Check your wallet is connected

## Support

For issues or questions:
1. Check the blockchain transaction on Polygonscan
2. Verify your wallet connection
3. Ensure you're on the correct network (Polygon)
4. Review the transaction logs in browser console

---

**Quick Links**
- View Licenses: `/licenses`
- Browse Marketplace: `/marketplace`
- Your Dashboard: `/dashboard`
- Create Trademark: `/register`
