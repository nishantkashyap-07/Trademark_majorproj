# Local Blockchain Deployment for Presentation

## Quick Setup (2-3 Minutes)

This guide shows you how to deploy contracts to a local blockchain and demonstrate full functionality **without needing testnet tokens**.

---

## Step 1: Start Local Blockchain

Open **Terminal 1** and run:

```bash
npx hardhat node
```

**What this does:**
- Starts a local Ethereum blockchain on your computer
- Creates 20 test accounts with 10,000 ETH each
- Runs on `http://localhost:8545`
- No internet connection needed
- Instant transactions (no waiting)

**Keep this terminal running!**

You'll see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

---

## Step 2: Deploy Contracts to Local Network

Open **Terminal 2** and run:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**
```
Starting deployment...
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH

Deploying TrademarkNFT contract...
TrademarkNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Deploying TrademarkMarketplace contract...
TrademarkMarketplace deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

=== DEPLOYMENT COMPLETE ===
Contract Addresses:
TrademarkNFT: 0x5FbDB2315678afecb367f032d93F642f64180aa3
TrademarkMarketplace: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

Add these to your .env file:
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

## Step 3: Update Environment Variables

Copy the contract addresses from the output and update your `.env.local`:

```bash
# Replace with your actual deployed addresses
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

## Step 4: Configure MetaMask for Local Network

### Add Localhost Network to MetaMask:

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
5. Click "Save"

### Import Test Account:

1. In MetaMask, click account icon → "Import Account"
2. Select "Private Key"
3. Paste this test private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

**You now have 10,000 ETH for testing!**

---

## Step 5: Restart Dev Server

Open **Terminal 3** and run:

```bash
npm run dev
```

Wait for it to start, then open: http://localhost:3000

---

## Step 6: Connect MetaMask

1. Make sure MetaMask is on "Localhost 8545" network
2. Click "Connect Wallet" in your app
3. Approve the connection

**You're ready to demo!**

---

## Full Demo Flow

### 1. Register a Trademark
- Go to `/register`
- Fill in company details
- Upload trademark files
- Submit (transaction completes instantly!)
- See success message with Token ID

### 2. View Dashboard
- Go to `/dashboard`
- See your registered trademark
- View trademark details

### 3. Create Marketplace Listing
- From dashboard, click "List for Sale"
- Set price (e.g., 0.5 ETH)
- Submit transaction
- Listing appears on marketplace

### 4. Buy/License (Use Second Account)
- Import another test account in MetaMask:
  ```
  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
  ```
- Switch to this account in MetaMask
- Go to marketplace
- Purchase or license a trademark
- See ownership transfer

### 5. Admin Functions
- Switch back to first account (deployer = admin)
- Go to `/admin`
- Verify trademarks
- View reports
- Manage listings

---

## Advantages of Local Deployment

✅ **Instant Transactions** - No waiting for block confirmations
✅ **Free** - No gas fees, unlimited ETH
✅ **Offline** - Works without internet
✅ **Reset Anytime** - Restart Hardhat node for fresh state
✅ **Full Functionality** - All features work exactly like mainnet
✅ **Perfect for Demos** - Fast, reliable, repeatable

---

## Troubleshooting

### "Nonce too high" Error
**Solution:** Reset MetaMask account
1. MetaMask → Settings → Advanced
2. Click "Clear activity tab data"
3. Refresh page

### "Network Changed" Warning
**Solution:** Just refresh the page

### Contracts Not Found
**Solution:** Make sure:
1. Hardhat node is running (Terminal 1)
2. Contracts are deployed (Terminal 2)
3. Addresses are in `.env.local`
4. Dev server restarted (Terminal 3)

---

## Presentation Script

### Opening:
"Let me demonstrate our trademark NFT marketplace running on a local blockchain."

### Demo:
1. **Show Hardhat Node Running**
   - "This is our local Ethereum blockchain with instant transactions"
   
2. **Show Deployment Output**
   - "Contracts deployed successfully with these addresses"
   
3. **Register Trademark**
   - Fill form, upload files
   - "Transaction submitted... and confirmed instantly!"
   - Show Token ID and success message

4. **View on Dashboard**
   - "Here's our registered trademark as an NFT"
   - Show metadata, IPFS links

5. **Create Listing**
   - "Now let's list it on the marketplace"
   - Set price, submit
   - "Listed successfully!"

6. **Switch Accounts & Purchase**
   - Switch MetaMask account
   - "Now I'm a buyer"
   - Purchase trademark
   - "Ownership transferred with automatic royalty payment!"

7. **Admin Panel**
   - Switch back to admin account
   - "As admin, I can verify trademarks"
   - Verify a trademark
   - Show admin logs

### Closing:
"This demonstrates full blockchain functionality. The same code works on Polygon mainnet - we just need to deploy there with real MATIC tokens."

---

## Alternative: Use Seed Data

If you prefer to show the UI without blockchain interaction:

```bash
# Seed database with demo data
npm run seed
```

This populates Firebase with sample trademarks, listings, and users. You can browse the marketplace and view details without blockchain transactions.

**Pros:**
- No blockchain setup needed
- Faster for UI-focused demos

**Cons:**
- Can't demonstrate actual blockchain transactions
- No MetaMask interaction
- No smart contract execution

---

## Best Approach for Your Presentation

### Option 1: Local Blockchain (Recommended)
**Use when:** You want to show full blockchain functionality
**Time:** 3 minutes setup
**Impact:** High - shows everything works

### Option 2: Seed Data Only
**Use when:** Focus is on UI/UX
**Time:** 30 seconds setup
**Impact:** Medium - shows interface only

### Option 3: Explain + Show Tests
**Use when:** No time for setup
**Time:** 0 minutes setup
**Impact:** Medium - proves contracts work

---

## Quick Setup Checklist

- [ ] Terminal 1: `npx hardhat node` (keep running)
- [ ] Terminal 2: `npx hardhat run scripts/deploy.js --network localhost`
- [ ] Copy contract addresses to `.env.local`
- [ ] Add Localhost network to MetaMask (Chain ID: 31337)
- [ ] Import test account to MetaMask
- [ ] Terminal 3: `npm run dev`
- [ ] Connect wallet and test registration

**Total Time: 2-3 minutes**

---

## What to Say if Asked About Mainnet

**Question:** "Why not deploy to real blockchain?"

**Answer:** 
"We have two deployment options:

1. **Local Network (what we're showing):** Perfect for development and demos. Instant transactions, no costs, full functionality.

2. **Polygon Mainnet (production):** Same code, just different RPC URL. Requires MATIC tokens for gas fees. We're ready to deploy - just need to fund the deployment wallet.

The contracts are identical - local deployment proves they work. Moving to mainnet is just a configuration change."

---

## Summary

Local blockchain deployment gives you:
- ✅ Full blockchain functionality
- ✅ All features working
- ✅ Fast, reliable demos
- ✅ No external dependencies
- ✅ Professional presentation

**You can demonstrate every objective without testnet tokens!**
