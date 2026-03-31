# 🚀 Quick Setup Guide - Do This Now!

## Step 1: Get Your API Keys (15 minutes)

### A. Alchemy (For Blockchain Connection)
1. Go to: https://www.alchemy.com/
2. Sign up / Log in
3. Click "Create App"
4. Settings:
   - Name: TrademarkChain
   - Chain: Polygon
   - Network: Mumbai (testnet)
5. Copy your API Key
6. Your RPC URL will be: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`

### B. PolygonScan (For Contract Verification)
1. Go to: https://polygonscan.com/
2. Sign up / Log in
3. Go to: https://polygonscan.com/myapikey
4. Click "Add" to create new API key
5. Copy your API Key

### C. Firebase (For Database)
1. Go to: https://console.firebase.google.com/
2. Click "Create a project"
3. Name: TrademarkChain
4. Disable Google Analytics (optional)
5. Click "Create project"
6. Once created, click the Web icon (</>)
7. Register app name: TrademarkChain
8. Copy all the config values shown
9. Go to "Build" → "Firestore Database"
10. Click "Create database"
11. Choose "Start in test mode"
12. Select location closest to you

### D. Web3.Storage (Optional - for IPFS)
1. Go to: https://web3.storage/
2. Sign up with email
3. Go to Account
4. Create API token
5. Copy the token

---

## Step 2: Get MetaMask Private Key (5 minutes)

⚠️ **IMPORTANT: Never share your private key with anyone!**

1. Open MetaMask
2. Click the three dots (...)
3. Click "Account details"
4. Click "Show private key"
5. Enter your password
6. Copy the private key
7. **Keep this secret!**

---

## Step 3: Get Test MATIC (10 minutes)

You need test MATIC to deploy contracts and test transactions.

### Faucets (Try all until you get 2 MATIC):
1. https://faucet.polygon.technology/
   - Connect wallet
   - Select Mumbai
   - Submit (gives 0.5 MATIC)

2. https://mumbaifaucet.com/
   - Enter your wallet address
   - Complete captcha
   - Submit (gives 0.5 MATIC)

3. https://faucet.quicknode.com/polygon/mumbai
   - Connect wallet
   - Request tokens (gives 0.1 MATIC)

**Target: Get at least 2 MATIC total**

Check your balance in MetaMask (make sure you're on Mumbai network)

---

## Step 4: Create .env.local File (5 minutes)

Create a file named `.env.local` in your project root with this content:

```env
# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY_HERE
PRIVATE_KEY=your_metamask_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# IPFS Configuration (Optional)
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Contract Addresses (Leave empty for now)
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=
```

**Replace all the placeholder values with your actual keys!**

---

## Step 5: Install Dependencies (5 minutes)

Open terminal in your project folder and run:

```bash
npm install
```

Wait for it to complete.

---

## Step 6: Compile Smart Contracts (2 minutes)

```bash
npm run compile
```

You should see:
```
Compiled 15 Solidity files successfully
```

---

## Step 7: Deploy Smart Contracts (5 minutes)

⚠️ **Make sure you have at least 0.5 MATIC in your wallet!**

```bash
npm run deploy
```

You should see output like:
```
Deploying contracts to Polygon Mumbai...
TrademarkNFT deployed to: 0x1234567890abcdef...
TrademarkMarketplace deployed to: 0xabcdef1234567890...
Deployment complete!
```

**IMPORTANT: Copy both contract addresses!**

---

## Step 8: Update Contract Addresses (2 minutes)

### A. Update .env.local
Open `.env.local` and add the contract addresses:

```env
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x1234... (your NFT contract)
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xabcd... (your marketplace contract)
```

### B. Update constants.ts
Open `utils/constants.ts` and update:

```typescript
export const TRADEMARK_CONTRACT_ADDRESS = '0x1234...'; // Your NFT contract
export const MARKETPLACE_CONTRACT_ADDRESS = '0xabcd...'; // Your marketplace contract
```

---

## Step 9: Start Development Server (1 minute)

```bash
npm run dev
```

Open browser to: http://localhost:3000

---

## Step 10: Test the Application (10 minutes)

### A. Connect Wallet
1. Click "Connect Wallet"
2. Approve in MetaMask
3. You should see your address in navbar

### B. Register a Trademark
1. Go to "Register IP"
2. Fill in the form:
   - Company Name: Test Corp
   - Slogan: Innovation First
   - Category: Technology
   - Registration Number: TC-2024-001
   - Royalty: 5%
3. Click "Register Trademark"
4. Approve transaction in MetaMask
5. Wait for confirmation

### C. Check Transaction
1. After confirmation, you'll get a transaction hash
2. Go to: https://mumbai.polygonscan.com/tx/YOUR_TX_HASH
3. You should see your transaction!

---

## ✅ Checklist

- [ ] Got Alchemy API key
- [ ] Got PolygonScan API key
- [ ] Set up Firebase project
- [ ] Got Web3.Storage token (optional)
- [ ] Got MetaMask private key
- [ ] Got 2+ MATIC from faucets
- [ ] Created .env.local file
- [ ] Installed dependencies
- [ ] Compiled contracts
- [ ] Deployed contracts
- [ ] Updated contract addresses
- [ ] Started dev server
- [ ] Connected wallet
- [ ] Registered test trademark
- [ ] Verified transaction on PolygonScan

---

## 🆘 Need Help?

### Common Issues:

**"Insufficient funds"**
- Get more test MATIC from faucets
- Check you're on Mumbai network

**"Cannot find module"**
- Run `npm install` again
- Delete `node_modules` and run `npm install`

**"Transaction failed"**
- Check your MATIC balance
- Increase gas limit
- Try again

**"Contract not found"**
- Make sure you updated contract addresses
- Check you're on Mumbai network
- Restart dev server

---

## 📞 What to Share With Me

Once you complete the steps, share:
1. ✅ "Setup complete"
2. Your deployed contract addresses
3. A test transaction hash
4. Any errors you encountered

Then I can help you create demo data and prepare for presentation!
