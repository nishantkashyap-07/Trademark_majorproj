# ✅ TrademarkChain Setup Checklist

Use this checklist to track your setup progress. Check off each item as you complete it.

---

## 📋 Pre-Setup Requirements

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] MetaMask browser extension installed
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

---

## 🔧 Initial Setup

- [ ] Repository cloned or files downloaded
- [ ] Navigated to project directory in terminal
- [ ] Ran `npm install` successfully
- [ ] All dependencies installed without errors
- [ ] `.env.local` file created from `.env.example`

---

## 🔑 API Keys & Configuration

### Blockchain (Required for Smart Contracts)
- [ ] Alchemy account created
- [ ] Alchemy API key obtained
- [ ] `POLYGON_RPC_URL` added to `.env.local`
- [ ] MetaMask private key exported
- [ ] `PRIVATE_KEY` added to `.env.local` (⚠️ Keep secure!)
- [ ] Polygonscan account created
- [ ] `POLYGONSCAN_API_KEY` added to `.env.local`

### IPFS (Optional - for file uploads)
- [ ] Web3.Storage account created OR
- [ ] Pinata account created
- [ ] IPFS token added to `.env.local`

### Firebase (Optional - for backend database)
- [ ] Firebase project created
- [ ] Firebase config values obtained
- [ ] All `NEXT_PUBLIC_FIREBASE_*` variables added to `.env.local`
- [ ] Firestore database enabled

---

## ⛓️ Blockchain Setup

- [ ] MetaMask installed and set up
- [ ] Mumbai testnet added to MetaMask
  - Network Name: Polygon Mumbai
  - RPC URL: https://rpc-mumbai.maticvigil.com/
  - Chain ID: 80001
  - Currency: MATIC
- [ ] Test MATIC obtained from faucet
- [ ] Wallet balance confirmed (at least 0.5 MATIC)
- [ ] Smart contracts compiled (`npm run compile`)
- [ ] Smart contracts deployed (`npm run deploy`)
- [ ] Contract addresses copied
- [ ] `NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS` updated in `.env.local`
- [ ] `NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS` updated in `.env.local`
- [ ] Contract addresses updated in `utils/constants.ts`

---

## 🎨 Frontend Setup

- [ ] Development server started (`npm run dev`)
- [ ] Browser opened to http://localhost:3000
- [ ] Homepage loads without errors
- [ ] No console errors (press F12 to check)
- [ ] Navigation menu works
- [ ] All pages accessible

---

## 🔌 Wallet Connection

- [ ] "Connect Wallet" button visible
- [ ] Clicked "Connect Wallet"
- [ ] MetaMask popup appeared
- [ ] Connection approved in MetaMask
- [ ] Wallet address displayed in navbar
- [ ] Correct network (Mumbai) shown in MetaMask

---

## ✨ Feature Testing

### Basic Features
- [ ] Can navigate to all pages
- [ ] Marketplace page loads
- [ ] Categories page displays
- [ ] Verify page accessible
- [ ] Dashboard accessible

### Trademark Registration
- [ ] Registration form loads
- [ ] Can fill in all fields
- [ ] Can upload files
- [ ] Can submit form
- [ ] MetaMask transaction popup appears
- [ ] Transaction confirmed
- [ ] Trademark appears in dashboard

### License Management (NEW!)
- [ ] Can view trademark detail page
- [ ] "Licenses" tab visible
- [ ] "Create License Listing" button works
- [ ] License modal opens
- [ ] Can set price and duration
- [ ] Can create license listing
- [ ] Transaction confirmed
- [ ] License appears on trademark page
- [ ] Can navigate to `/licenses` page
- [ ] Licenses page displays correctly

### Marketplace
- [ ] Can browse trademarks
- [ ] Can filter by category
- [ ] Can search trademarks
- [ ] Trademark cards display correctly
- [ ] Can click on trademark to view details

---

## 🧪 Advanced Testing (Optional)

- [ ] Smart contract tests run (`npm test`)
- [ ] All tests pass
- [ ] Can verify trademark ownership
- [ ] Can purchase license (with different wallet)
- [ ] License shows in "Purchased Licenses" tab
- [ ] License expiration countdown works
- [ ] Can view license details

---

## 📚 Documentation Review

- [ ] Read `SETUP_GUIDE.md`
- [ ] Read `QUICK_REFERENCE.md`
- [ ] Read `LICENSING_QUICK_START.md`
- [ ] Understand project structure
- [ ] Know where to find help

---

## 🚨 Troubleshooting Completed

If you encountered issues, check these off after resolving:

- [ ] Resolved "module not found" errors
- [ ] Fixed MetaMask connection issues
- [ ] Resolved transaction failures
- [ ] Fixed compilation errors
- [ ] Resolved IPFS upload issues
- [ ] Fixed Firebase configuration

---

## 🎉 Final Verification

- [ ] All environment variables configured
- [ ] Smart contracts deployed and verified
- [ ] Can register trademarks
- [ ] Can create license listings
- [ ] Can purchase licenses
- [ ] Can view licenses page
- [ ] All features working as expected
- [ ] No critical errors in console
- [ ] Ready for development/testing

---

## 📊 Setup Status

Count your checkmarks:

- **0-20 checks**: Just getting started
- **21-40 checks**: Making good progress
- **41-60 checks**: Almost there!
- **61-80 checks**: Excellent progress!
- **81+ checks**: Setup complete! 🎉

---

## 🆘 Need Help?

If you're stuck on any item:

1. ✅ Check the item's section in `SETUP_GUIDE.md`
2. ✅ Review the troubleshooting section
3. ✅ Check browser console for errors (F12)
4. ✅ Verify all previous steps are completed
5. ✅ Review error messages carefully

---

## 🎯 Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Compile contracts
npm run compile

# Deploy contracts
npm run deploy

# Run tests
npm test
```

---

## 📝 Notes Section

Use this space to track any custom configurations or issues:

```
Date: _______________

Notes:
_____________________________________
_____________________________________
_____________________________________
_____________________________________
_____________________________________

Issues Encountered:
_____________________________________
_____________________________________
_____________________________________

Solutions Applied:
_____________________________________
_____________________________________
_____________________________________
```

---

**✅ Once all items are checked, you're ready to start developing!**

**🚀 Happy coding!**
