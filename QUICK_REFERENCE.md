# 🎯 TrademarkChain - Quick Reference Card

## 🚀 Getting Started (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 🔑 Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy contracts to Mumbai |
| `npm test` | Run contract tests |

---

## 🌐 Important URLs

| Service | URL |
|---------|-----|
| **Local App** | http://localhost:3000 |
| **Polygon Faucet** | https://faucet.polygon.technology/ |
| **Mumbai Explorer** | https://mumbai.polygonscan.com/ |
| **Alchemy** | https://dashboard.alchemy.com/ |
| **Web3.Storage** | https://web3.storage/ |
| **Firebase** | https://console.firebase.google.com/ |

---

## 📋 Environment Variables Checklist

### Required for Blockchain
- [ ] `POLYGON_RPC_URL` - From Alchemy
- [ ] `PRIVATE_KEY` - From MetaMask
- [ ] `POLYGONSCAN_API_KEY` - From Polygonscan

### Optional for Full Features
- [ ] `WEB3_STORAGE_TOKEN` - For IPFS uploads
- [ ] `NEXT_PUBLIC_FIREBASE_*` - For backend database

### After Deployment
- [ ] `NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS`
- [ ] `NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS`

---

## 🎨 Main Features & Pages

| Feature | URL | Description |
|---------|-----|-------------|
| **Homepage** | `/` | Landing page |
| **Marketplace** | `/marketplace` | Browse trademarks |
| **Licenses** | `/licenses` | Manage licenses |
| **Register** | `/register` | Create trademark |
| **Verify** | `/verify` | Verify ownership |
| **Dashboard** | `/dashboard` | User dashboard |
| **Categories** | `/categories` | Browse by category |

---

## 🔐 MetaMask Setup

### Add Mumbai Testnet
- **Network Name**: Polygon Mumbai
- **RPC URL**: https://rpc-mumbai.maticvigil.com/
- **Chain ID**: 80001
- **Currency**: MATIC
- **Explorer**: https://mumbai.polygonscan.com/

### Get Test MATIC
1. Visit https://faucet.polygon.technology/
2. Enter your wallet address
3. Wait 1-2 minutes
4. Check balance in MetaMask

---

## 📦 Project Structure

```
trademark-verification-system/
├── components/          # UI components
├── contracts/          # Smart contracts
├── pages/             # Next.js pages
│   ├── api/          # Backend API
│   ├── index.tsx     # Homepage
│   ├── marketplace.tsx
│   ├── licenses.tsx  # NEW: License management
│   └── register.tsx
├── utils/            # Helper functions
├── .env.local       # Your config (create this)
└── package.json     # Dependencies
```

---

## 🎯 Licensing Features (NEW!)

### Create License Listing
1. Go to your trademark page
2. Click "Create License Listing"
3. Set price & duration
4. Confirm transaction

### Purchase License
1. Browse marketplace
2. View trademark details
3. Go to "Licenses" tab
4. Click purchase
5. Confirm transaction

### View Your Licenses
- Visit `/licenses` page
- See purchased & granted licenses
- Track expiration dates

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Module not found** | `rm -rf node_modules && npm install` |
| **Transaction fails** | Get more test MATIC from faucet |
| **MetaMask not connecting** | Refresh page, reconnect wallet |
| **Compilation errors** | `npm install @openzeppelin/contracts` |
| **IPFS upload fails** | Check Web3.Storage token |

---

## 📊 Smart Contract Functions

### TrademarkNFT
```solidity
registerTrademark()      // Mint new trademark NFT
getTrademarkInfo()       // Get trademark details
verifyTrademark()        // Admin verification
```

### TrademarkMarketplace
```solidity
createListing()          // List for sale/license
buyTrademark()          // Purchase NFT
licenseTrademark()      // Purchase license
getLicensesForToken()   // Get all licenses
hasActiveLicense()      // Check license status
```

---

## 🔄 Typical Workflow

### Register Trademark
```
Connect Wallet → Fill Form → Upload Files → 
Confirm Transaction → Wait for Confirmation → Done!
```

### Create License
```
Go to Trademark → Create License → Set Terms → 
Confirm Transaction → License Available!
```

### Purchase License
```
Browse Marketplace → View Trademark → Licenses Tab → 
Select License → Confirm Purchase → Done!
```

---

## 📱 Testing Checklist

- [ ] Connect MetaMask wallet
- [ ] Register a trademark
- [ ] View trademark in marketplace
- [ ] Create license listing
- [ ] Purchase license (different wallet)
- [ ] View licenses page
- [ ] Check license expiration
- [ ] Verify trademark ownership

---

## 🆘 Quick Help

### Can't connect wallet?
- Check MetaMask is installed
- Switch to Mumbai testnet
- Refresh the page

### Transaction pending forever?
- Check Mumbai network status
- Increase gas price
- Try again later

### Contract not deployed?
1. Get test MATIC
2. Run `npm run deploy`
3. Update contract addresses in `.env.local`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Complete setup instructions |
| `LICENSING_QUICK_START.md` | Licensing user guide |
| `LICENSING_IMPLEMENTATION.md` | Technical details |
| `README.md` | Project overview |
| `QUICK_REFERENCE.md` | This file! |

---

## 💡 Pro Tips

1. **Use demo data**: The app includes sample trademarks for testing
2. **Check console**: Press F12 to see detailed error messages
3. **Test on Mumbai**: Always test on testnet before mainnet
4. **Save private key**: Keep your private key secure and backed up
5. **Monitor gas**: Check gas prices before transactions

---

## 🎉 Success Indicators

✅ Development server running on port 3000
✅ MetaMask connected and showing Mumbai network
✅ Contract addresses in `.env.local`
✅ Test MATIC in wallet
✅ Can register and view trademarks
✅ Can create and purchase licenses

---

**Need more help?** Check `SETUP_GUIDE.md` for detailed instructions!
