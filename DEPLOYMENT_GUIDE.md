# 🚀 TrademarkChain Deployment Guide

Complete step-by-step guide to deploy your blockchain trademark verification platform.

---

## 📋 Prerequisites

### Required Tools
- ✅ Node.js 18+ and npm
- ✅ MetaMask browser extension
- ✅ Git (for version control)
- ✅ Code editor (VS Code recommended)

### Required Accounts
- [ ] Alchemy account (for Polygon RPC)
- [ ] Web3.Storage account (for IPFS)
- [ ] Firebase account (for Firestore)
- [ ] Polygonscan account (for contract verification)
- [ ] Vercel/Netlify account (for frontend hosting)

---

## 🔧 Step 1: Environment Setup

### 1.1 Clone and Install

```bash
# Navigate to your project directory
cd trademark-verification-system

# Install dependencies
npm install
```

### 1.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_metamask_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# IPFS Configuration
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Contract Addresses (will be filled after deployment)
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=
```

---

## 🔑 Step 2: Get API Keys

### 2.1 Alchemy (Polygon RPC)

1. Go to [Alchemy.com](https://www.alchemy.com/)
2. Sign up and create a new app
3. Select **Polygon Mumbai** (testnet)
4. Copy the **HTTP URL** to `POLYGON_RPC_URL`

### 2.2 Web3.Storage (IPFS)

1. Go to [Web3.Storage](https://web3.storage/)
2. Sign up with email or GitHub
3. Create a new API token
4. Copy token to `NEXT_PUBLIC_WEB3_STORAGE_TOKEN`

### 2.3 Firebase (Firestore Database)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Go to Project Settings → General
5. Scroll to "Your apps" → Web app
6. Copy all config values to your `.env.local`

### 2.4 Polygonscan (Contract Verification)

1. Go to [Polygonscan Mumbai](https://mumbai.polygonscan.com/)
2. Sign up and verify email
3. Go to API-KEYs section
4. Create new API key
5. Copy to `POLYGONSCAN_API_KEY`

### 2.5 MetaMask Private Key

⚠️ **SECURITY WARNING**: Never share your private key!

1. Open MetaMask
2. Click account icon → Account Details
3. Click "Export Private Key"
4. Enter password and copy key
5. Paste to `PRIVATE_KEY` in `.env.local`

**Best Practice**: Use a separate wallet for development/testing!

---

## 💰 Step 3: Get Testnet Tokens

### 3.1 Add Polygon Mumbai to MetaMask

1. Open MetaMask
2. Click network dropdown → Add Network
3. Enter details:
   - **Network Name**: Polygon Mumbai
   - **RPC URL**: https://rpc-mumbai.maticvigil.com
   - **Chain ID**: 80001
   - **Currency Symbol**: MATIC
   - **Block Explorer**: https://mumbai.polygonscan.com

### 3.2 Get Free MATIC Tokens

1. Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. Select **Mumbai** network
3. Enter your wallet address
4. Complete CAPTCHA
5. Wait for tokens (usually 1-2 minutes)

You need at least **0.5 MATIC** for deployment and testing.

---

## 📝 Step 4: Smart Contract Deployment

### 4.1 Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 20 Solidity files successfully
```

### 4.2 Run Tests

```bash
npm run test
```

Expected output:
```
  TrademarkNFT
    ✓ Should set the correct name and symbol
    ✓ Should register a trademark successfully
    ... (13 passing tests)
```

### 4.3 Deploy to Polygon Mumbai

```bash
npm run deploy
```

Expected output:
```
Deploying contracts with account: 0x...
TrademarkNFT deployed to: 0x1234...
TrademarkMarketplace deployed to: 0x5678...

Add these to your .env.local:
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x1234...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x5678...
```

### 4.4 Update Environment Variables

Copy the deployed contract addresses to your `.env.local`:

```env
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x1234567890...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x9876543210...
```

### 4.5 Verify Contracts on Polygonscan

```bash
npx hardhat verify --network polygon 0xYOUR_TRADEMARK_CONTRACT_ADDRESS
npx hardhat verify --network polygon 0xYOUR_MARKETPLACE_CONTRACT_ADDRESS 0xYOUR_TRADEMARK_CONTRACT_ADDRESS
```

---

## 🌐 Step 5: Frontend Deployment

### 5.1 Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Wallet connection
- ✅ Trademark registration
- ✅ Marketplace browsing
- ✅ Verification functionality

### 5.2 Build for Production

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 5.3 Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel.com](https://vercel.com/)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables from `.env.local`
7. Click "Deploy"

### 5.4 Deploy to Netlify (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=.next
```

---

## 🔥 Step 6: Firebase Setup

### 6.1 Create Firestore Collections

1. Go to Firebase Console → Firestore Database
2. Create collections:
   - `users`
   - `trademarks`
   - `listings`
   - `transactions`

### 6.2 Set Security Rules

Go to Firestore → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trademarks collection
    match /trademarks/{trademarkId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.creatorAddress == request.auth.uid;
    }
    
    // Listings collection
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.sellerAddress == request.auth.uid;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

### 6.3 Create Indexes

Go to Firestore → Indexes and create:

1. **Trademarks Index**:
   - Collection: `trademarks`
   - Fields: `category` (Ascending), `createdAt` (Descending)

2. **Listings Index**:
   - Collection: `listings`
   - Fields: `active` (Ascending), `createdAt` (Descending)

---

## ✅ Step 7: Post-Deployment Testing

### 7.1 Test Checklist

- [ ] Homepage loads correctly
- [ ] Wallet connects successfully
- [ ] Search functionality works
- [ ] Categories display properly
- [ ] Trademark registration works
- [ ] IPFS upload successful
- [ ] Smart contract interaction works
- [ ] Marketplace displays trademarks
- [ ] Verification page functions
- [ ] Dashboard shows user data
- [ ] Mobile responsive design works

### 7.2 Test User Flow

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Verify wallet address displays

2. **Register Trademark**
   - Go to Register page
   - Fill in all fields
   - Upload logo/documents
   - Submit transaction
   - Confirm in MetaMask
   - Wait for confirmation
   - Verify trademark appears in dashboard

3. **Browse Marketplace**
   - Go to Marketplace
   - Search for trademark
   - Filter by category
   - Click on trademark card
   - View details page

4. **Verify Product**
   - Go to Verify page
   - Select a product
   - Click "Verify Trademark"
   - Check verification results

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Insufficient funds for transaction"
- **Solution**: Get more MATIC from faucet

**Issue**: "Network mismatch"
- **Solution**: Switch MetaMask to Polygon Mumbai

**Issue**: "IPFS upload failed"
- **Solution**: Check Web3.Storage token is valid

**Issue**: "Contract not found"
- **Solution**: Verify contract addresses in `.env.local`

**Issue**: "Firebase permission denied"
- **Solution**: Check Firestore security rules

---

## 📊 Monitoring & Analytics

### Track Contract Activity

1. Go to [Polygonscan Mumbai](https://mumbai.polygonscan.com/)
2. Search for your contract address
3. Monitor:
   - Transactions
   - Events
   - Token transfers

### Monitor IPFS Storage

1. Go to [Web3.Storage Dashboard](https://web3.storage/)
2. View:
   - Uploaded files
   - Storage usage
   - Pin status

### Firebase Analytics

1. Go to Firebase Console → Analytics
2. Track:
   - User activity
   - Database reads/writes
   - Storage usage

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to Git
2. **Use separate wallets** for development and production
3. **Audit smart contracts** before mainnet deployment
4. **Enable 2FA** on all accounts
5. **Regular backups** of Firebase data
6. **Monitor contract** for suspicious activity
7. **Rate limit** API endpoints
8. **Validate all inputs** on frontend and backend

---

## 🎉 Launch Checklist

- [ ] All tests passing
- [ ] Contracts deployed and verified
- [ ] Frontend deployed and accessible
- [ ] Firebase configured
- [ ] Environment variables set
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics tracking setup
- [ ] Documentation complete
- [ ] Team trained on platform
- [ ] Marketing materials ready
- [ ] Social media accounts created
- [ ] Community channels setup

---

## 📞 Support & Resources

- **Documentation**: Check README.md and FEATURES.md
- **Smart Contracts**: See `contracts/` directory
- **Frontend Code**: See `pages/` and `components/`
- **Polygon Docs**: https://docs.polygon.technology/
- **Hardhat Docs**: https://hardhat.org/docs
- **Next.js Docs**: https://nextjs.org/docs
- **IPFS Docs**: https://docs.ipfs.tech/

---

**🎊 Congratulations! Your TrademarkChain platform is now live!**

Visit your deployed URL and start protecting trademarks on the blockchain! 🚀