# Deploy to Local Blockchain (No MATIC Required!)

## What is Local Blockchain?

Hardhat creates a local Ethereum-compatible blockchain on your computer:
- ✅ No MATIC needed
- ✅ Instant transactions (no waiting)
- ✅ Free gas fees
- ✅ Full blockchain functionality
- ✅ Perfect for demos and testing
- ❌ Only accessible on your computer
- ❌ Resets when you restart

## Step 1: Start Local Blockchain

Open a NEW terminal (keep it running) and run:

```bash
npx hardhat node
```

You'll see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

**Keep this terminal running!**

## Step 2: Deploy Contracts to Local Network

Open a SECOND terminal and run:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Output:
```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account balance: 10000.0 ETH

Deploying TrademarkNFT contract...
TrademarkNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Deploying TrademarkMarketplace contract...
TrademarkMarketplace deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

✅ DEPLOYMENT COMPLETE!
```

## Step 3: Update .env File

Copy the contract addresses and update your .env:

```env
# Local Blockchain Addresses
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Use local RPC
NEXT_PUBLIC_POLYGON_RPC_URL=http://127.0.0.1:8545
```

## Step 4: Configure MetaMask for Local Network

### Add Local Network to MetaMask:

1. Open MetaMask
2. Click network dropdown (top)
3. Click "Add Network"
4. Click "Add a network manually"
5. Fill in:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
6. Click "Save"

### Import Test Account:

1. Click account icon (top right)
2. Click "Import Account"
3. Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Click "Import"
5. You now have 10,000 ETH!

## Step 5: Restart Dev Server

```bash
npm run dev
```

## Step 6: Test Registration

1. Go to http://localhost:3000/register
2. Make sure MetaMask is on "Hardhat Local" network
3. Register a trademark
4. MetaMask pops up - click "Confirm"
5. Transaction confirms instantly!
6. Check dashboard - trademark is on blockchain!

## Advantages of Local Blockchain

✅ **Instant Transactions** - No waiting for block confirmations
✅ **Free** - No gas fees, unlimited transactions
✅ **Fast Development** - Test quickly
✅ **Full Control** - Reset anytime
✅ **10,000 ETH** - Never run out of funds
✅ **Perfect for Demos** - Show all features

## Disadvantages

❌ **Not Public** - Only on your computer
❌ **Resets** - Data lost when you stop the node
❌ **No Blockchain Explorer** - Can't view on Polygonscan
❌ **Not Persistent** - Need to redeploy after restart

## For Presentation

### What to Say:

"This is running on a local Ethereum-compatible blockchain using Hardhat. In production, this would be deployed to Polygon mainnet for public access and permanent storage. The local blockchain allows us to demonstrate all blockchain features including NFT minting, smart contract interactions, and marketplace functionality without incurring gas costs."

### What to Show:

1. ✅ Register trademark (instant confirmation)
2. ✅ View on dashboard (blockchain verified)
3. ✅ Create marketplace listing
4. ✅ Purchase/license trademark
5. ✅ Show MetaMask transactions
6. ✅ Explain it's the same code that would run on Polygon

## Troubleshooting

### "Cannot connect to network"
- Make sure `npx hardhat node` is running
- Check RPC URL is http://127.0.0.1:8545
- Restart hardhat node

### "Nonce too high" error
- Reset MetaMask account:
  - Settings → Advanced → Clear activity tab data

### "Contract not deployed"
- Redeploy: `npx hardhat run scripts/deploy.js --network localhost`
- Update contract addresses in .env

### Hardhat node stopped
- Restart: `npx hardhat node`
- Redeploy contracts
- Update .env if addresses changed

## Comparison: Local vs Testnet vs Mainnet

| Feature | Local | Testnet (Amoy) | Mainnet |
|---------|-------|----------------|---------|
| Cost | Free | Free (test MATIC) | Real money |
| Speed | Instant | 2-5 seconds | 2-5 seconds |
| Public | No | Yes | Yes |
| Persistent | No | Yes | Yes |
| Explorer | No | Yes | Yes |
| For Demo | ✅ Perfect | ✅ Good | ❌ Expensive |
| For Production | ❌ No | ❌ No | ✅ Yes |

## When to Use Each

**Local Blockchain:**
- Development
- Testing
- Quick demos
- Learning
- When you can't get testnet tokens

**Testnet (Polygon Amoy):**
- Final testing before production
- Public demos
- Showing on blockchain explorer
- When you want persistent data
- Academic presentations

**Mainnet:**
- Production deployment
- Real users
- Real value
- After thorough testing

## Next Steps

After testing locally, you can:
1. Get test MATIC from faucets
2. Deploy to Polygon Amoy testnet
3. Show on public blockchain explorer
4. Have persistent, publicly verifiable data

But for now, local blockchain gives you full functionality!
