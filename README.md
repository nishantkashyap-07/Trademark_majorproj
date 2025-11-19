# 🔐 TrademarkChain - Blockchain Trademark Verification Platform

> A decentralized platform for registering, verifying, and trading trademarks as NFTs on the Polygon blockchain.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-orange)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🌟 Overview

**TrademarkChain** revolutionizes intellectual property protection by leveraging blockchain technology to create immutable, verifiable trademark records. Our platform enables businesses to register trademarks as NFTs, verify authenticity instantly, and trade intellectual property securely.

### 🎯 Key Features

- 🔗 **Blockchain Registration** - Register trademarks as NFTs with immutable on-chain records
- 📦 **IPFS Storage** - Decentralized storage for trademark assets and metadata
- ⚡ **Instant Verification** - Verify trademark authenticity using QR codes or registration numbers
- 🏪 **NFT Marketplace** - Buy, sell, and license trademarks with automated royalty distribution
- 📊 **Activity Monitoring** - Real-time marketplace activity tracking (listings, sales, verifications)
- ✅ **Admin Verification** - Secure admin dashboard for trademark verification
- 📱 **Product Authentication** - QR code-based product verification system
- 🎨 **Modern UI/UX** - Clean, aesthetic interface with responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MetaMask or compatible Web3 wallet
- Firebase project (for backend)
- Alchemy account (for blockchain RPC)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd trademark-verification-system

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Compile smart contracts
npm run compile

# 5. Start development server
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 📋 Environment Setup

Create `.env.local` file with the following variables:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key
PRIVATE_KEY=your-wallet-private-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key

# IPFS Configuration (Optional)
WEB3_STORAGE_TOKEN=your-web3-storage-token
```

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Web3**: Ethers.js v6
- **State Management**: React Context API

### Backend
- **API**: Next.js API Routes
- **Database**: Firebase Firestore
- **Storage**: IPFS via Web3.Storage
- **Middleware**: Custom error handling, CORS, rate limiting

### Blockchain
- **Smart Contracts**: Solidity 0.8.20
- **Development**: Hardhat
- **Network**: Polygon Mumbai Testnet
- **Standards**: ERC-721, ERC-2981 (Royalties)
- **Libraries**: OpenZeppelin Contracts

---

## 📁 Project Structure

```
trademark-verification-system/
├── components/              # React components
├── contexts/               # React contexts
├── contracts/              # Solidity smart contracts
├── lib/                    # Backend services
│   ├── api-client.ts       # Frontend API client
│   ├── api-middleware.ts   # API middleware
│   ├── db-service.ts       # Database service
│   ├── firebase.ts         # Firebase config
│   └── demo-data.ts        # Demo data
├── pages/                  # Next.js pages
│   ├── index.tsx           # Homepage
│   ├── marketplace.tsx     # Marketplace
│   ├── register.tsx        # Registration
│   ├── verify.tsx          # Verification
│   ├── dashboard.tsx       # Dashboard
│   └── api/                # API routes
├── scripts/                # Deployment scripts
├── styles/                 # CSS styles
├── test/                   # Smart contract tests
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

---

## 🎯 Core Functionality

### 1. Trademark Registration
1. Connect wallet
2. Fill registration form
3. Upload logo/assets to IPFS
4. Mint NFT on blockchain
5. Store metadata in Firestore
6. Await admin verification

### 2. Trademark Verification
1. Enter token ID, registration number, or scan QR
2. Query blockchain for ownership
3. Retrieve metadata from IPFS
4. Display verification results

### 3. Marketplace Activity
- **New Listings**: Trademarks listed for sale
- **Sales**: Completed trademark purchases
- **Verifications**: Newly verified trademarks

---

## 🔐 Smart Contracts

### TrademarkNFT.sol
- ERC-721 NFT contract for trademarks
- Mints unique tokens for each trademark
- Stores IPFS hash and metadata
- Implements ERC-2981 royalty standard

### TrademarkMarketplace.sol
- Marketplace for trading trademarks
- Automated royalty distribution
- Escrow functionality
- License management

---

## 📊 Demo Data

The platform includes comprehensive demo data:

- **12 Trademarks** across 12 different categories
- **9 Verified** trademarks
- **8 Marketplace Activities**
- **Real-time Statistics**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRESENTATION_GUIDE.md](./PRESENTATION_GUIDE.md) | Complete presentation guide |
| [BACKEND_API.md](./BACKEND_API.md) | API documentation |
| [UI_UX_IMPROVEMENTS.md](./UI_UX_IMPROVEMENTS.md) | UI/UX design docs |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Deployment instructions |
| [QUICK_START.md](./QUICK_START.md) | Quick start guide |

---

## 🧪 Testing

```bash
# Smart contract tests
npm test

# API testing
# See test-api.http for examples
```

---

## 🌐 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

### Smart Contracts (Polygon)
```bash
npm run deploy
```

---

## 🎨 UI/UX Highlights

- Clean, minimal design
- Consistent components
- Responsive layout
- Accessible (WCAG compliant)
- Fast performance
- Intuitive navigation

---

## 🔒 Security Features

- ✅ Wallet-based authentication
- ✅ Smart contract verification
- ✅ IPFS content addressing
- ✅ API rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Admin verification system

---

## 📈 Roadmap

### Phase 1 - Q2 2024
- Mobile app
- Advanced search
- Bulk registration
- Email notifications

### Phase 2 - Q3 2024
- Multi-chain support
- DAO governance
- Trademark insurance
- Legal integration

### Phase 3 - Q4 2024
- Enterprise API
- White-label solutions
- Global database
- AI infringement detection

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

- [Polygon Documentation](https://docs.polygon.technology/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## ✅ Project Status

**Status**: ✅ 100% Complete and Presentation-Ready

### Completed Features
- ✅ Frontend UI/UX (100%)
- ✅ Backend API (100%)
- ✅ Smart Contracts (100%)
- ✅ Database Integration (100%)
- ✅ IPFS Integration (100%)
- ✅ Demo Data (100%)
- ✅ Documentation (100%)
- ✅ Responsive Design (100%)

---

<div align="center">

**Built with ❤️ using blockchain technology**

[⭐ Star this repo](#) | [🐛 Report Bug](#) | [✨ Request Feature](#)

</div>
