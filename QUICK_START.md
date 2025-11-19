# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Firebase project created
- (Optional) Web3.Storage account for IPFS uploads

## Installation

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Next.js framework
- Firebase SDK
- Ethers.js for blockchain interaction
- Formidable for file uploads
- Web3.Storage for IPFS
- All development dependencies

### 2. Configure Environment Variables

Copy the example environment file:
```bash
copy .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Blockchain Configuration (Required for deployment)
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key
PRIVATE_KEY=your-wallet-private-key
POLYGONSCAN_API_KEY=your-polygonscan-api-key

# IPFS Configuration (Optional - for server-side uploads)
WEB3_STORAGE_TOKEN=your-web3-storage-token

# Contract Addresses (Will be populated after deployment)
NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Enable Storage (for file uploads)
5. Copy your Firebase configuration to `.env.local`

### 4. Compile Smart Contracts
```bash
npm run compile
```

### 5. Deploy Smart Contracts (Optional)

For local testing:
```bash
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

For Polygon Mumbai testnet:
```bash
npm run deploy
```

Update `.env.local` with the deployed contract addresses.

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing the Backend

### Test API Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.45,
    "environment": "development",
    "version": "1.0.0",
    "services": {
      "api": "operational",
      "database": "operational",
      "ipfs": "operational"
    }
  }
}
```

### Test Other Endpoints

Get statistics:
```bash
curl http://localhost:3000/api/stats
```

Get categories:
```bash
curl http://localhost:3000/api/categories
```

Search trademarks:
```bash
curl "http://localhost:3000/api/search?q=tech"
```

## Common Issues

### Firebase Connection Error
- Verify all Firebase environment variables are set correctly
- Check Firebase project settings
- Ensure Firestore is enabled in Firebase Console

### Contract Not Deployed
- Run `npm run compile` first
- Deploy contracts using `npm run deploy`
- Update contract addresses in `.env.local`

### IPFS Upload Not Working
- Server-side uploads require `WEB3_STORAGE_TOKEN`
- Client-side uploads work without server configuration
- Get a free token at [web3.storage](https://web3.storage)

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

## Project Structure

```
├── components/          # React components
├── contexts/           # React contexts (Web3, etc.)
├── contracts/          # Solidity smart contracts
├── lib/               # Backend services
│   ├── api-client.ts      # Frontend API client
│   ├── api-middleware.ts  # API middleware
│   ├── db-service.ts      # Database service
│   └── firebase.ts        # Firebase configuration
├── pages/
│   ├── api/           # API routes
│   │   ├── trademarks/    # Trademark endpoints
│   │   ├── users/         # User endpoints
│   │   ├── search/        # Search endpoint
│   │   ├── stats/         # Statistics endpoint
│   │   ├── categories/    # Categories endpoint
│   │   ├── upload/        # File upload endpoint
│   │   ├── admin/         # Admin endpoints
│   │   └── blockchain/    # Blockchain sync endpoint
│   └── *.tsx          # Frontend pages
├── scripts/           # Deployment scripts
├── styles/            # CSS styles
├── test/              # Smart contract tests
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run compile` - Compile smart contracts
- `npm test` - Run smart contract tests
- `npm run deploy` - Deploy to Polygon Mumbai

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Set up Firebase
4. ✅ Start development server
5. 📝 Test API endpoints
6. 🎨 Customize frontend
7. 🔐 Add authentication
8. 🚀 Deploy to production

## Documentation

- [Backend API Documentation](./BACKEND_API.md)
- [Backend Testing Guide](./BACKEND_TESTING.md)
- [Backend Fixes Summary](./BACKEND_FIXES.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Features Overview](./FEATURES.md)

## Support

For issues or questions:
1. Check the documentation files
2. Review the code comments
3. Test endpoints using the examples provided
4. Check Firebase and blockchain configurations

## Production Deployment

Before deploying to production:
- [ ] Set up production Firebase project
- [ ] Deploy smart contracts to Polygon mainnet
- [ ] Configure production environment variables
- [ ] Set up monitoring and logging
- [ ] Add authentication middleware
- [ ] Configure CORS for specific origins
- [ ] Set up database backups
- [ ] Add rate limiting (consider Redis)
- [ ] Enable HTTPS
- [ ] Set up CI/CD pipeline

---

**Status**: ✅ Backend is fully functional and ready for development
