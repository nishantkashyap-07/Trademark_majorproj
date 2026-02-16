# 🎯 Real Data Setup Guide for Live Demonstration

This guide will help you set up real data in your TrademarkChain platform for a live demonstration.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js and npm installed
- ✅ Firebase project created
- ✅ MetaMask wallet with test MATIC
- ✅ `.env.local` file configured
- ✅ Smart contracts deployed (optional for demo)

---

## 🔥 Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `trademark-chain-demo`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create Database"
3. Select **Start in test mode** (for demo purposes)
4. Choose your region (closest to you)
5. Click "Enable"

### 1.3 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register your app with a nickname
5. Copy the configuration values

### 1.4 Update Environment Variables

Edit your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Blockchain (can use demo mode without these)
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...
```

---

## 🌱 Step 2: Seed Database with Real Data

### 2.1 Run the Seeding Script

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run the seeding script
npx ts-node scripts/seed-database.ts
```

### 2.2 Expected Output

```
🌱 Starting database seeding...

📝 Seeding trademarks...
  ✅ Added: Innovation Beyond Imagination
  ✅ Added: Wear Your Values
  ✅ Added: Nature's Goodness, Delivered Fresh
  ✅ Added: Your Health, Our Priority
  ✅ Added: Drive the Future Today

👥 Seeding users...
  ✅ Added: Alice Johnson
  ✅ Added: Bob Smith
  ✅ Added: Carol Williams

🏪 Seeding marketplace listings...
  ✅ Added listing for token #1
  ✅ Added listing for token #2

📂 Seeding categories...
  ✅ Added: Technology
  ✅ Added: Fashion & Apparel
  ...

📊 Seeding activity logs...
  ✅ Added: Trademark registered: Innovation Beyond Imagination
  ...

✨ Database seeding completed successfully!

📈 Summary:
  - 5 trademarks
  - 3 users
  - 2 listings
  - 12 categories
  - 3 activity logs
```

### 2.3 Verify Data in Firebase

1. Go to Firebase Console
2. Navigate to **Firestore Database**
3. You should see collections:
   - `trademarks` (5 documents)
   - `users` (3 documents)
   - `listings` (2 documents)
   - `categories` (12 documents)
   - `activity_logs` (3 documents)

---

## 🚀 Step 3: Start the Application

```bash
# Start development server
npm run dev
```

Visit **http://localhost:3000**

---

## 🎬 Step 4: Demonstration Flow

### 4.1 Homepage Demo
1. Open http://localhost:3000
2. Show featured trademarks (loaded from Firebase)
3. Show recent activity feed
4. Show statistics (real counts from database)

### 4.2 Marketplace Demo
1. Navigate to **Marketplace** page
2. Show active listings (2 trademarks for sale)
3. Filter by category
4. Search for trademarks

### 4.3 Categories Demo
1. Navigate to **Categories** page
2. Show all 12 categories with counts
3. Click on a category to filter

### 4.4 Verification Demo
1. Navigate to **Verify** page
2. Enter registration number: `TM2024001`
3. Show verification result with full details
4. Try QR code scanning (if available)

### 4.5 Dashboard Demo (Connect Wallet)
1. Click "Connect Wallet"
2. Connect with MetaMask
3. Use one of the seeded addresses:
   - `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` (Alice)
   - `0x8ba1f109551bD432803012645Ac136ddd64DBA72` (Bob)
   - `0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed` (Carol)
4. Show user's trademarks
5. Show user's activity

---

## 🔗 Step 5: Optional Blockchain Integration

### 5.1 Get Test MATIC

1. Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. Select Mumbai Testnet
3. Enter your wallet address
4. Get free test MATIC

### 5.2 Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Mumbai testnet
npm run deploy
```

### 5.3 Update Contract Addresses

After deployment, update `.env.local`:

```env
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0xYourDeployedAddress
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0xYourMarketplaceAddress
```

### 5.4 Test Blockchain Features

1. **Register New Trademark**
   - Go to Register page
   - Fill form and submit
   - Confirm transaction in MetaMask
   - Wait for confirmation

2. **List for Sale**
   - Go to Dashboard
   - Click "List for Sale" on a trademark
   - Set price and confirm

3. **Purchase Trademark**
   - Browse marketplace
   - Click "Buy Now"
   - Confirm transaction

---

## 📊 Step 6: Add More Real Data (Optional)

### 6.1 Modify Seeding Script

Edit `scripts/seed-database.ts` to add more:
- Trademarks
- Users
- Listings
- Transactions
- Ratings
- Licenses

### 6.2 Re-run Seeding

```bash
npx ts-node scripts/seed-database.ts
```

---

## 🎯 Demonstration Scenarios

### Scenario 1: Brand Owner Journey
1. **Register Trademark**
   - Show registration form
   - Upload logo
   - Submit and get NFT

2. **Verify Trademark**
   - Admin verifies
   - Status changes to "Verified"

3. **List for Sale**
   - Set price
   - List on marketplace

4. **Create License**
   - Offer usage license
   - Set terms and pricing

### Scenario 2: Buyer Journey
1. **Browse Marketplace**
   - View available trademarks
   - Filter by category
   - Search by keyword

2. **Purchase Trademark**
   - Select trademark
   - Buy NFT
   - Become new owner

3. **Purchase License**
   - Browse licenses
   - Buy usage rights
   - Get license certificate

### Scenario 3: Product Verification
1. **Scan QR Code**
   - Use mobile device
   - Scan product QR

2. **Verify Authenticity**
   - Check trademark details
   - Verify ownership
   - See verification badge

---

## 🐛 Troubleshooting

### Issue: Firebase Connection Error
**Solution:**
- Check `.env.local` configuration
- Verify Firebase project is active
- Check Firestore rules (should be in test mode)

### Issue: No Data Showing
**Solution:**
- Run seeding script again
- Check browser console for errors
- Verify Firebase collections exist

### Issue: Wallet Connection Failed
**Solution:**
- Install MetaMask extension
- Switch to Mumbai testnet
- Refresh page and try again

### Issue: Transaction Failed
**Solution:**
- Ensure you have test MATIC
- Check gas settings
- Verify contract addresses

---

## 📱 Mobile Demo Setup

### For QR Code Scanning:
1. Deploy to Vercel or similar
2. Get public URL
3. Generate QR codes for trademarks
4. Test scanning with mobile device

---

## 🎓 Presentation Tips

### Before Demo:
- ✅ Test all features
- ✅ Prepare backup data
- ✅ Have multiple browser tabs ready
- ✅ Test wallet connection
- ✅ Clear browser cache

### During Demo:
- 🎯 Start with homepage overview
- 🎯 Show real data loading
- 🎯 Demonstrate key features
- 🎯 Explain blockchain benefits
- 🎯 Show verification process

### Backup Plan:
- 📸 Take screenshots of working features
- 📹 Record video demo
- 📄 Prepare slide deck
- 💾 Have offline demo ready

---

## 📈 Performance Optimization

### For Faster Demo:
1. **Preload Data**
   ```bash
   # Warm up the database
   curl http://localhost:3000/api/trademarks
   curl http://localhost:3000/api/stats
   ```

2. **Use Production Build**
   ```bash
   npm run build
   npm start
   ```

3. **Enable Caching**
   - Browser caching enabled
   - API response caching
   - Image optimization

---

## 🔒 Security Notes

### For Demo Environment:
- ⚠️ Use test mode Firestore rules
- ⚠️ Use testnet only (Mumbai)
- ⚠️ Don't use real private keys
- ⚠️ Don't expose API keys publicly

### Firestore Rules (Test Mode):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## ✅ Pre-Demo Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set in `.env.local`
- [ ] Database seeded with real data
- [ ] Application running on localhost
- [ ] Wallet connected and funded
- [ ] All pages loading correctly
- [ ] Data displaying from Firebase
- [ ] Search and filters working
- [ ] Verification working
- [ ] Marketplace showing listings
- [ ] Dashboard showing user data
- [ ] Mobile responsive tested
- [ ] Browser console clear of errors

---

## 🎉 You're Ready!

Your TrademarkChain platform is now loaded with real data and ready for demonstration!

### Quick Start Commands:
```bash
# Seed database
npx ts-node scripts/seed-database.ts

# Start app
npm run dev

# Open browser
# http://localhost:3000
```

### Need Help?
- Check Firebase Console for data
- Review browser console for errors
- Test API endpoints with test-api.http
- Refer to SETUP_GUIDE.md for detailed setup

---

**Good luck with your presentation! 🚀**
