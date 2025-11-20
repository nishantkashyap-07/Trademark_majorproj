# 🚀 TrademarkChain - Complete Setup Guide

This guide will walk you through setting up the entire project from scratch, including blockchain, frontend, and backend components.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- A code editor (VS Code recommended)

---

## 🔧 Step 1: Clone and Install

### 1.1 Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd trademark-verification-system

# Or if you already have the files, navigate to the directory
cd trademark-verification-system
```

### 1.2 Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Next.js and React
# - Ethers.js for blockchain interaction
# - Hardhat for smart contract development
# - Tailwind CSS for styling
# - Firebase for backend
# - And all other dependencies
```

**Expected output**: You should see a successful installation with no errors.

---

## 🔐 Step 2: Environment Configuration

### 2.1 Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

### 2.2 Configure Environment Variables

Open `.env.local` and fill in the following sections:

#### A. Blockchain Configuration (Required for Smart Contracts)

```env
# Get from Alchemy (https://www.alchemy.com/)
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Your wallet private key (NEVER share this!)
PRIVATE_KEY=your_wallet_private_key_here

# Get from Polygonscan (https://polygonscan.com/apis)
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**How to get these:**

1. **Alchemy RPC URL**:
   - Go to [alchemy.com](https://www.alchemy.com/)
   - Sign up for free account
   - Create a new app on "Polygon Mumbai" network
   - Copy the HTTP URL

2. **Private Key**:
   - Open MetaMask
   - Click account menu → Account Details → Export Private Key
   - ⚠️ **WARNING**: Never share or commit this key!

3. **Polygonscan API Key**:
   - Go to [polygonscan.com](https://polygonscan.com/)
   - Sign up and go to API Keys section
   - Create a new API key

#### B. IPFS Configuration (Optional - for file storage)

```env
# Get from Web3.Storage (https://web3.storage/)
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Or use Pinata (https://pinata.cloud/)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

**How to get these:**

1. **Web3.Storage** (Recommended):
   - Go to [web3.storage](https://web3.storage/)
   - Sign up for free account
   - Create an API token

2. **Pinata** (Alternative):
   - Go to [pinata.cloud](https://pinata.cloud/)
   - Sign up for free account
   - Generate API keys

#### C. Firebase Configuration (Optional - for backend database)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**How to get these:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Go to Project Settings → General
4. Scroll to "Your apps" → Add web app
5. Copy the configuration values

---

## ⛓️ Step 3: Smart Contract Setup

### 3.1 Compile Smart Contracts

```bash
npm run compile
```

**Expected output**: 
```
Compiled 10 Solidity files successfully
```

### 3.2 Get Test ETH (Mumbai Testnet)

1. Switch MetaMask to "Polygon Mumbai" network
2. Get free test MATIC from faucet:
   - [Polygon Faucet](https://faucet.polygon.technology/)
   - [Alchemy Faucet](https://mumbaifaucet.com/)
3. Wait for tokens to arrive (usually 1-2 minutes)

### 3.3 Deploy Smart Contracts

```bash
npm run deploy
```

**Expected output**:
```
Deploying contracts...
TrademarkNFT deployed to: 0x1234...
TrademarkMarketplace deployed to: 0x5678...
```

### 3.4 Update Contract Addresses

Copy the deployed contract addresses and add them to `.env.local`:

```env
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x1234...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x5678...
```

Also update `utils/constants.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  TRADEMARK_NFT: '0x1234...', // Your deployed address
  MARKETPLACE: '0x5678...',   // Your deployed address
};
```

---

## 🎨 Step 4: Frontend Setup

### 4.1 Start Development Server

```bash
npm run dev
```

**Expected output**:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 4.2 Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the TrademarkChain homepage! 🎉

---

## 🔌 Step 5: Connect MetaMask

### 5.1 Configure MetaMask Network

If Mumbai testnet is not in your MetaMask:

1. Open MetaMask
2. Click network dropdown → Add Network
3. Enter these details:
   - **Network Name**: Polygon Mumbai
   - **RPC URL**: https://rpc-mumbai.maticvigil.com/
   - **Chain ID**: 80001
   - **Currency Symbol**: MATIC
   - **Block Explorer**: https://mumbai.polygonscan.com/

### 5.2 Connect Wallet

1. Click "Connect Wallet" button on the website
2. Approve the connection in MetaMask
3. You should see your wallet address in the navbar

---

## ✅ Step 6: Test the Application

### 6.1 Register a Trademark

1. Click "Create" in navigation
2. Fill in the form:
   - Company Name
   - Slogan/Trademark Text
   - Registration Number
   - Category
   - Description
3. Upload a logo/image
4. Click "Register Trademark"
5. Approve transaction in MetaMask
6. Wait for confirmation (30-60 seconds)

### 6.2 Create a License Listing

1. Go to your trademark detail page
2. Click "Create License Listing"
3. Set price and duration
4. Confirm transaction
5. License is now available for purchase!

### 6.3 Browse Marketplace

1. Click "Explore" in navigation
2. Browse available trademarks
3. Filter by category
4. View trademark details

### 6.4 View Your Licenses

1. Click "Licenses" in navigation
2. See purchased and granted licenses
3. Check expiration dates

---

## 🧪 Step 7: Run Tests (Optional)

### 7.1 Smart Contract Tests

```bash
npm test
```

This will run all smart contract tests using Hardhat.

### 7.2 API Tests

Use the `test-api.http` file with REST Client extension in VS Code to test API endpoints.

---

## 🚨 Troubleshooting

### Issue: "Cannot find module" errors

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Smart contract compilation fails

**Solution**:
```bash
npm install --save-dev @openzeppelin/contracts
npm run compile
```

### Issue: Transaction fails with "insufficient funds"

**Solution**:
- Get more test MATIC from faucet
- Check you're on Mumbai testnet
- Verify your wallet has balance

### Issue: MetaMask not connecting

**Solution**:
- Refresh the page
- Disconnect and reconnect wallet
- Clear browser cache
- Try different browser

### Issue: IPFS upload fails

**Solution**:
- Check your Web3.Storage token is valid
- Verify file size is under 100MB
- Try using Pinata as alternative

### Issue: Firebase errors

**Solution**:
- Verify all Firebase config values are correct
- Check Firebase project is active
- Enable Firestore database in Firebase console

---

## 📁 Project Structure Overview

```
trademark-verification-system/
├── components/              # React UI components
│   ├── LicenseModal.tsx    # Create license listings
│   ├── LicenseCard.tsx     # Display licenses
│   └── ...
├── contracts/              # Solidity smart contracts
│   ├── TrademarkNFT.sol    # NFT contract
│   └── TrademarkMarketplace.sol
├── pages/                  # Next.js pages
│   ├── index.tsx           # Homepage
│   ├── marketplace.tsx     # Browse trademarks
│   ├── licenses.tsx        # License management
│   ├── register.tsx        # Register trademark
│   └── api/                # Backend API routes
├── utils/                  # Utility functions
│   ├── contracts.ts        # Contract interactions
│   ├── ipfs.ts            # IPFS functions
│   └── constants.ts        # Configuration
├── .env.local             # Environment variables (create this)
└── package.json           # Dependencies
```

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Smart Contracts
npm run compile         # Compile contracts
npm test               # Run contract tests
npm run deploy         # Deploy to Mumbai testnet

# Code Quality
npm run lint           # Run ESLint
```

---

## 🔗 Useful Links

- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Polygon Faucet**: https://faucet.polygon.technology/
- **Mumbai Explorer**: https://mumbai.polygonscan.com/
- **Web3.Storage**: https://web3.storage/
- **Firebase Console**: https://console.firebase.google.com/
- **MetaMask**: https://metamask.io/

---

## 📚 Next Steps

After setup is complete:

1. ✅ Read [LICENSING_QUICK_START.md](./LICENSING_QUICK_START.md) for licensing features
2. ✅ Check [LICENSING_IMPLEMENTATION.md](./LICENSING_IMPLEMENTATION.md) for technical details
3. ✅ Review [README.md](./README.md) for project overview
4. ✅ Explore the demo data and UI

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in browser console (F12)
3. Check terminal output for errors
4. Verify all environment variables are set correctly
5. Ensure you're on the correct network (Mumbai testnet)

---

## 🎉 Success Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Smart contracts compiled
- [ ] Test MATIC obtained
- [ ] Contracts deployed to Mumbai
- [ ] Contract addresses updated
- [ ] Development server running
- [ ] MetaMask connected
- [ ] Test trademark registered
- [ ] License listing created

**If all checked, you're ready to go! 🚀**

---

**Need help?** Check the documentation files or review the code comments for guidance.
