# User Guide: Creating Trademark Listings

## What Changed?

We've improved the listing creation process to prevent errors and provide better feedback.

## Creating a Listing - Step by Step

### Step 1: Navigate to Your Trademark
1. Go to Dashboard or Marketplace
2. Click on a trademark you own
3. Look for the "Create license listing" button

### Step 2: Click "Create License Listing"

You'll see one of these scenarios:

#### ✅ Scenario A: Everything is Ready
```
Modal opens → Fill in details → Click "Create Listing" → Success!
```

#### ⚠️ Scenario B: First Time (Approval Needed)
```
Modal opens → Fill in details → Click "Create Listing"
  ↓
"Approving marketplace to manage your NFTs..."
  ↓
MetaMask popup: "Approve" transaction
  ↓
Wait for confirmation
  ↓
Listing created successfully!
```

**Note**: You only need to approve once per wallet. Future listings won't need approval.

#### ❌ Scenario C: NFT Not Minted
```
Modal opens → Fill in details → Click "Create Listing"
  ↓
Error: "This trademark has not been minted as an NFT yet. 
Please mint it on the blockchain first from the registration page."
```

**What to do**: 
- This trademark only exists in the database
- You need to mint it as an NFT first
- Contact support or re-register the trademark

### Step 3: Fill in Listing Details

**License Price (ETH)**
- How much buyers pay for the license
- Example: 0.1 ETH
- Minimum: 0.001 ETH

**License Duration**
- 1 Month (30 days)
- 3 Months (90 days)
- 6 Months (180 days)
- 1 Year (365 days)
- Perpetual (never expires)

**Listing Expiry (Days)**
- How long your listing stays active
- Example: 30 days
- Set to 0 for no expiration

### Step 4: Confirm Transaction

1. Review the details
2. Click "Create Listing"
3. Approve in MetaMask (if first time)
4. Wait for blockchain confirmation
5. Done! Your listing is now active

## Understanding the Fees

### Marketplace Fee: 2.5%
- Deducted from each license sale
- You receive 97.5% of the price
- Example: 0.1 ETH sale = you get 0.0975 ETH

### Gas Fees
- Paid to blockchain network
- Varies based on network congestion
- Typically 0.001-0.01 ETH on Polygon

### One-Time Approval
- First listing requires approval transaction
- Small gas fee (one time only)
- Future listings don't need approval

## Common Questions

### Q: Why do I need to approve the marketplace?
**A**: The marketplace needs permission to transfer your NFT when someone purchases it. This is a standard security feature of NFTs.

### Q: Is my NFT at risk?
**A**: No. The marketplace can only transfer your NFT when:
- Someone buys it at your listed price
- You explicitly create a listing
- The smart contract enforces all rules

### Q: Can I cancel a listing?
**A**: Yes! Go to your trademark page and click "Cancel Listing". You'll need to pay a small gas fee.

### Q: What if my trademark isn't minted?
**A**: Contact support or re-register it. In the future, all trademarks will be automatically minted during registration.

### Q: How long does it take?
**A**: 
- Approval: 10-30 seconds
- Listing creation: 10-30 seconds
- Total first time: ~1 minute
- Future listings: ~15 seconds

### Q: What if the transaction fails?
**A**: Common reasons:
- Insufficient gas (add more ETH/MATIC)
- Network congestion (try again later)
- Wrong network (switch to correct network)
- Rejected in MetaMask (try again)

## Error Messages Explained

### "This trademark has not been minted as an NFT yet"
**Meaning**: The trademark exists in our database but not on the blockchain.

**Solution**: 
1. Contact support to mint it
2. Or re-register the trademark
3. Ensure blockchain mode is selected during registration

### "You do not own this trademark NFT"
**Meaning**: The connected wallet doesn't own this NFT.

**Solution**:
1. Check you're connected with the correct wallet
2. Verify ownership on the trademark page
3. If you transferred it, use the new owner's wallet

### "Wallet not connected"
**Meaning**: No wallet is connected to the app.

**Solution**:
1. Click "Connect Wallet" in the top right
2. Select MetaMask
3. Approve the connection
4. Try again

### "Approving marketplace to manage your NFTs..."
**Meaning**: This is normal! The marketplace needs permission.

**Solution**:
1. Wait for MetaMask popup
2. Click "Approve"
3. Wait for confirmation
4. Listing will be created automatically

### "Insufficient funds for gas"
**Meaning**: Not enough ETH/MATIC for transaction fees.

**Solution**:
1. Add funds to your wallet
2. On Polygon: Get MATIC from a faucet or exchange
3. On Ethereum: Get ETH from an exchange
4. Try again

## Tips for Success

### ✅ Do's
- ✓ Ensure your trademark is minted before listing
- ✓ Set competitive prices
- ✓ Choose appropriate license durations
- ✓ Keep some ETH/MATIC for gas fees
- ✓ Approve the marketplace once for all future listings

### ❌ Don'ts
- ✗ Don't reject the approval transaction
- ✗ Don't close the browser during transaction
- ✗ Don't set price to 0
- ✗ Don't list if NFT isn't minted
- ✗ Don't switch networks during transaction

## Visual Flow

```
┌─────────────────────────────────────┐
│  Your Trademark Page                │
│  ┌───────────────────────────────┐  │
│  │ [Create license listing]      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  License Modal                      │
│  ┌───────────────────────────────┐  │
│  │ Price: [0.1] ETH              │  │
│  │ Duration: [1 Month]           │  │
│  │ Expiry: [30] days             │  │
│  │                               │  │
│  │ [Cancel] [Create Listing]     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
         First Time Only
┌─────────────────────────────────────┐
│  MetaMask Approval                  │
│  ┌───────────────────────────────┐  │
│  │ Approve marketplace to        │  │
│  │ manage your NFTs              │  │
│  │                               │  │
│  │ [Reject] [Approve]            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  MetaMask Transaction               │
│  ┌───────────────────────────────┐  │
│  │ Create Listing                │  │
│  │ Gas fee: ~0.001 ETH           │  │
│  │                               │  │
│  │ [Reject] [Confirm]            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Success!                           │
│  ┌───────────────────────────────┐  │
│  │ ✓ Listing created             │  │
│  │   View on marketplace         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Need Help?

If you encounter any issues:

1. **Check the error message** - It will tell you what's wrong
2. **Check your wallet** - Ensure you have funds and are on the correct network
3. **Check the console** - Press F12 and look for errors
4. **Contact support** - Provide the error message and transaction hash

## What's Next?

After creating a listing:
- ✓ It appears on the marketplace
- ✓ Buyers can purchase licenses
- ✓ You receive payments automatically
- ✓ You retain ownership of the NFT
- ✓ You can create multiple listings

---

**Happy listing!** 🚀
