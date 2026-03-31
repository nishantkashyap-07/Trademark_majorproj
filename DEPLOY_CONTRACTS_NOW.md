# Deploy Smart Contracts - Complete Guide

## Prerequisites Checklist

✅ You already have:
- Alchemy RPC URL configured in .env
- Private key configured in .env
- Pinata configured and working
- Firebase configured and working

## Step 1: Get Test MATIC (Polygon Amoy Testnet)

Your wallet needs MATIC tokens to pay for gas fees when deploying contracts.

### Get Your Wallet Address
1. Open MetaMask
2. Copy your wallet address (starts with 0x...)

### Get Free Test MATIC
Visit these faucets (use all of them to get enough MATIC):

1. **Alchemy Faucet** (Recommended - 0.5 MATIC)
   - Go to: https://www.alchemy.com/faucets/polygon-amoy
   - Paste your wallet address
   - Click "Send Me MATIC"

2. **Polygon Faucet** (0.1 MATIC)
   - Go to: https://faucet.polygon.technology/
   - Select "Polygon Amoy"
   - Paste your wallet address
   - Complete CAPTCHA
   - Click "Submit"

3. **QuickNode Faucet** (0.1 MATIC)
   - Go to: https://faucet.quicknode.com/polygon/amoy
   - Paste your wallet address
   - Click "Get MATIC"

**Wait 1-2 minutes** for the MATIC to arrive in your wallet.

### Verify You Have MATIC
1. Open MetaMask
2. Switch to "Polygon Amoy" network
3. Check your balance (should show ~0.5-1 MATIC)

## Step 2: Compile Smart Contracts

Open your terminal in the project directory and run:

```bash
npx hardhat compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

## Step 3: Deploy Contracts

Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network polygon
```

**This will take 2-3 minutes.** You'll see:

```
Deploying contracts to Polygon Amoy...
Deploying TrademarkNFT...
TrademarkNFT deployed to: 0x1234...5678
Deploying TrademarkMarketplace...
TrademarkMarketplace deployed to: 0xabcd...efgh

✅ Deployment Complete!

Contract Addresses:
- TrademarkNFT: 0x1234...5678
- TrademarkMarketplace: 0xabcd...efgh

⚠️ IMPORTANT: Copy these addresses to your .env file!
```

## Step 4: Update .env File

Copy the contract addresses from the deployment output and update your .env:

```env
# Contract Addresses (Update these with your deployed addresses)
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

**Save the file!**

## Step 5: Restart Your Dev Server

Stop your current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

## Step 6: Test Blockchain Registration

1. **Go to**: http://localhost:3000/register
2. **Fill in the form**:
   - Company Name: Test Company
   - Slogan: Test Blockchain Slogan
   - Click "Generate" for registration number
   - Category: Technology
   - Upload an image
3. **Click "Register Trademark"**
4. **MetaMask will pop up** - Click "Confirm"
5. **Wait 10-30 seconds** for blockchain confirmation
6. **Success!** Your trademark is now on the blockchain

## Step 7: Verify It Worked

### Check Dashboard
- Go to: http://localhost:3000/dashboard
- Your trademark should show "Pending" status
- Click on it to view details

### Check Verification Tab
- In the trademark detail page
- Click "Verification" tab
- Should show "Blockchain Verified" (green)
- Transaction hash should be visible
- Click "View on Polygonscan" to see on blockchain explorer

### Check on Polygonscan
1. Click the "View on Polygonscan" button
2. You'll see your transaction on the blockchain
3. This proves it's permanently recorded!

## What You Can Now Do

### ✅ Full Blockchain Features Enabled:

1. **Register Trademarks on Blockchain**
   - Immutable ownership proof
   - Permanent IPFS storage
   - NFT minting (ERC-721)

2. **Create Marketplace Listings**
   - Sell trademarks
   - License trademarks
   - Set royalty percentages

3. **Purchase & License**
   - Buy trademark ownership
   - Purchase usage licenses
   - Automatic royalty distribution

4. **Blockchain Verification**
   - Verify ownership on-chain
   - Check transaction history
   - View on Polygonscan

## Troubleshooting

### "Insufficient funds" Error
- You need more MATIC
- Go back to Step 1 and get more from faucets
- Wait a few minutes and try again

### "Network Error"
- Check your internet connection
- Verify Alchemy RPC URL in .env
- Try restarting your dev server

### "Transaction Failed"
- Check if you have enough MATIC
- Try increasing gas limit
- Check MetaMask network (should be Polygon Amoy)

### Contracts Not Deploying
- Verify your PRIVATE_KEY in .env is correct
- Make sure you have MATIC in that wallet
- Check Alchemy RPC URL is working

## Cost Breakdown

Deploying contracts costs approximately:
- TrademarkNFT: ~0.02 MATIC
- TrademarkMarketplace: ~0.03 MATIC
- **Total: ~0.05 MATIC** (less than $0.01 USD)

Each trademark registration costs:
- Gas fee: ~0.001-0.003 MATIC per registration

## Next Steps After Deployment

1. **Register Multiple Trademarks** - Test the system
2. **Create Listings** - Try selling/licensing
3. **Test Admin Verification** - Approve trademarks at /admin
4. **Demo for Presentation** - Show blockchain proof

## Important Notes

⚠️ **Save Your Contract Addresses!**
- Keep them in .env file
- Don't lose them - you can't redeploy to same addresses
- Write them down somewhere safe

⚠️ **Testnet vs Mainnet**
- This is Polygon Amoy TESTNET
- Test MATIC has no real value
- Perfect for development and demos
- For production, deploy to Polygon Mainnet

⚠️ **Private Key Security**
- Never share your private key
- Never commit .env to git
- Use a separate wallet for testnet

## Verification Checklist

After deployment, verify:
- [ ] Contracts deployed successfully
- [ ] Contract addresses in .env
- [ ] Dev server restarted
- [ ] Can register trademark with MetaMask
- [ ] Transaction appears on Polygonscan
- [ ] Trademark shows "Blockchain Verified"
- [ ] Can view transaction hash

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Check browser console for errors
4. Check terminal for error messages

## Success! 🎉

Once deployed, your project has:
- ✅ Full blockchain integration
- ✅ NFT minting capability
- ✅ Marketplace functionality
- ✅ Immutable ownership proof
- ✅ IPFS permanent storage
- ✅ Smart contract verification

You're ready to demonstrate a complete blockchain-based trademark system!
