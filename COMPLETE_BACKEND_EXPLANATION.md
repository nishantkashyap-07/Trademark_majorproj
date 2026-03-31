# Complete Backend Architecture Explanation

## Overview

TrademarkChain uses a **3-tier architecture** combining:
1. **IPFS (Pinata)** - Decentralized file storage
2. **Firebase Firestore** - Real-time database
3. **Polygon Blockchain** - Smart contracts (optional)

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│  Next.js + React + TypeScript + TailwindCSS                  │
│  - User Interface                                             │
│  - Form Validation                                            │
│  - Web3 Integration (MetaMask)                               │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ HTTP Requests
             ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                          │
│  Next.js API Routes (/pages/api/*)                          │
│  - File Upload Endpoints                                      │
│  - Database Operations                                        │
│  - Admin Functions                                            │
└────┬───────────┬──────────────┬────────────────────────────┘
     │           │              │
     │           │              │
     ▼           ▼              ▼
┌─────────┐ ┌──────────┐ ┌────────────┐
│  IPFS   │ │ Firebase │ │  Polygon   │
│ Pinata  │ │Firestore │ │ Blockchain │
│         │ │          │ │  (Optional)│
└─────────┘ └──────────┘ └────────────┘
```

## 1. IPFS Layer (Pinata)

### Purpose
Store trademark files permanently in a decentralized manner.

### What Gets Stored
- Logo images (PNG, JPG, SVG)
- Legal documents (PDF)
- Certificates
- Metadata JSON files

### How It Works

#### File Upload Flow
```typescript
// 1. Frontend prepares files
const formData = new FormData();
formData.append('file', logoFile);

// 2. Send to backend API
POST /api/upload/ipfs
Body: multipart/form-data with files

// 3. Backend receives and processes
// pages/api/upload/ipfs.ts
- Parse multipart form data using formidable
- Validate file types and sizes
- Create streams for each file

// 4. Upload to Pinata
POST https://api.pinata.cloud/pinning/pinFileToIPFS
Headers:
  - pinata_api_key: YOUR_API_KEY
  - pinata_secret_api_key: YOUR_SECRET_KEY
Body: FormData with file streams

// 5. Pinata response
{
  "IpfsHash": "QmXxx...",  // Content Identifier (CID)
  "PinSize": 12345,
  "Timestamp": "2026-02-17T..."
}

// 6. Return to frontend
{
  "success": true,
  "data": {
    "cid": "QmXxx...",
    "url": "https://gateway.pinata.cloud/ipfs/QmXxx...",
    "files": ["logo.png"]
  }
}
```

#### Metadata Upload Flow
```typescript
// 1. Create metadata object
const metadata = {
  name: "Innovation First",
  description: "TechCorp trademark",
  image: "ipfs://QmXxx.../logo.png",
  attributes: [
    { trait_type: "Company", value: "TechCorp" },
    { trait_type: "Registration Number", value: "TM2026001" }
  ]
};

// 2. Send to backend
POST /api/upload/metadata
Body: JSON metadata

// 3. Backend uploads to Pinata
POST https://api.pinata.cloud/pinning/pinJSONToIPFS
Headers: API keys
Body: {
  "pinataContent": metadata,
  "pinataMetadata": { "name": "trademark-metadata" }
}

// 4. Returns metadata CID
{
  "IpfsHash": "QmYyy..."
}
```

### Why IPFS?
- **Permanent**: Files never disappear
- **Decentralized**: No single point of failure
- **Verifiable**: Content hash proves integrity
- **Accessible**: Available from any IPFS gateway

### Code Files
- `pages/api/upload/ipfs.ts` - File upload endpoint
- `pages/api/upload/metadata.ts` - Metadata upload endpoint
- `utils/ipfs.ts` - Helper functions

## 2. Database Layer (Firebase Firestore)

### Purpose
Store searchable, queryable trademark data with real-time updates.

### Collections Structure

#### trademarks
```javascript
{
  id: "auto-generated-id",
  tokenId: 1234567890,
  creatorAddress: "0xABC...",
  trademarkName: "Innovation First",
  companyName: "TechCorp",
  registrationNumber: "TM2026001",
  ipfsHash: "QmXxx...",  // Assets CID
  tokenURI: "ipfs://QmYyy.../metadata.json",
  category: "Technology",
  description: "...",
  royaltyPercentage: 5,
  verified: false,
  verificationStatus: "pending",  // pending | verified | rejected
  createdAt: Timestamp,
  updatedAt: Timestamp,
  verifiedBy: null,  // Admin address
  verifiedAt: null
}
```

#### users
```javascript
{
  address: "0xABC...",  // Document ID
  displayName: "John Doe",
  email: "john@example.com",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  suspended: false,
  suspensionReason: null
}
```

#### listings
```javascript
{
  id: "auto-generated-id",
  tokenId: 1234567890,
  sellerAddress: "0xABC...",
  price: "100",  // In MATIC
  listingType: "sale",  // sale | license
  active: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### licenses
```javascript
{
  id: "auto-generated-id",
  tokenId: 1234567890,
  licensor: "0xABC...",  // Owner
  licensee: "0xDEF...",  // Buyer
  licenseType: "exclusive",
  duration: 365,  // days
  price: "50",
  issuedAt: Timestamp,
  expiresAt: Timestamp
}
```

#### admin_logs
```javascript
{
  id: "auto-generated-id",
  adminAddress: "0xADMIN...",
  action: "verify",  // verify | reject | suspend_user | suspend_listing
  targetType: "trademark",  // trademark | user | listing
  targetId: "1234567890",
  reason: "Verified documents",
  timestamp: Timestamp
}
```

### Database Operations

#### Create Trademark
```typescript
// lib/db-service.ts
async createTrademark(data: any) {
  const trademarkRef = doc(collection(db, 'trademarks'));
  await setDoc(trademarkRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return { success: true, id: trademarkRef.id };
}
```

#### Query Trademarks
```typescript
// Get all trademarks
const q = query(
  collection(db, 'trademarks'),
  orderBy('createdAt', 'desc')
);
const snapshot = await getDocs(q);

// Get by owner
const q = query(
  collection(db, 'trademarks'),
  where('creatorAddress', '==', ownerAddress),
  orderBy('createdAt', 'desc')
);

// Get verified only
const q = query(
  collection(db, 'trademarks'),
  where('verified', '==', true)
);
```

#### Update Trademark
```typescript
async updateTrademark(id: string, data: any) {
  const trademarkRef = doc(db, 'trademarks', id);
  await updateDoc(trademarkRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}
```

### Why Firebase?
- **Real-time**: Live updates across all clients
- **Scalable**: Handles millions of documents
- **Queryable**: Complex queries with indexes
- **Secure**: Built-in authentication and rules
- **Fast**: Global CDN distribution

### Code Files
- `lib/firebase.ts` - Firebase initialization
- `lib/db-service.ts` - Database operations
- `pages/api/trademarks/*.ts` - API endpoints

## 3. Blockchain Layer (Polygon)

### Purpose
Provide immutable proof of ownership and enable NFT functionality.

### Smart Contracts

#### TrademarkNFT.sol
```solidity
contract TrademarkNFT is ERC721URIStorage, Ownable {
    struct Trademark {
        string companyName;
        string sloganText;
        string registrationNumber;
        string ipfsHash;
        address creator;
        uint256 royaltyPercentage;
        bool verified;
    }
    
    mapping(uint256 => Trademark) public trademarks;
    mapping(string => bool) public registrationNumbers;
    
    function registerTrademark(
        string memory _companyName,
        string memory _sloganText,
        string memory _registrationNumber,
        string memory _ipfsHash,
        string memory _tokenURI,
        uint256 _royaltyPercentage
    ) public returns (uint256) {
        require(!registrationNumbers[_registrationNumber], "Already registered");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        trademarks[tokenId] = Trademark({
            companyName: _companyName,
            sloganText: _sloganText,
            registrationNumber: _registrationNumber,
            ipfsHash: _ipfsHash,
            creator: msg.sender,
            royaltyPercentage: _royaltyPercentage,
            verified: false
        });
        
        registrationNumbers[_registrationNumber] = true;
        
        emit TrademarkRegistered(tokenId, msg.sender, _registrationNumber);
        return tokenId;
    }
}
```

#### TrademarkMarketplace.sol
```solidity
contract TrademarkMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    
    function createListing(
        uint256 _tokenId,
        uint256 _price
    ) public {
        require(trademarkNFT.ownerOf(_tokenId) == msg.sender, "Not owner");
        
        listings[_tokenId] = Listing({
            tokenId: _tokenId,
            seller: msg.sender,
            price: _price,
            active: true
        });
        
        emit ListingCreated(_tokenId, msg.sender, _price);
    }
    
    function purchaseTrademark(uint256 _tokenId) public payable nonReentrant {
        Listing memory listing = listings[_tokenId];
        require(listing.active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Transfer NFT
        trademarkNFT.safeTransferFrom(listing.seller, msg.sender, _tokenId);
        
        // Pay seller
        payable(listing.seller).transfer(msg.value);
        
        // Deactivate listing
        listings[_tokenId].active = false;
        
        emit TrademarPurchased(_tokenId, msg.sender, listing.price);
    }
}
```

### Blockchain Integration Flow

```typescript
// 1. Connect to wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. Get contract instance
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// 3. Call contract function
const tx = await contract.registerTrademark(
  companyName,
  sloganText,
  registrationNumber,
  ipfsHash,
  tokenURI,
  royaltyPercentage
);

// 4. Wait for transaction
const receipt = await tx.wait();

// 5. Get token ID from event
const event = receipt.events.find(e => e.event === 'TrademarkRegistered');
const tokenId = event.args.tokenId;
```

### Why Blockchain?
- **Immutable**: Cannot be altered or deleted
- **Transparent**: All transactions public
- **Ownership**: Clear proof of ownership
- **Transferable**: Can sell or license
- **Royalties**: Automatic creator royalties

### Code Files
- `contracts/TrademarkNFT.sol` - NFT contract
- `contracts/TrademarkMarketplace.sol` - Marketplace contract
- `utils/contracts.ts` - Contract interaction helpers
- `hardhat.config.js` - Deployment configuration

## Complete Registration Flow

### Step-by-Step Process

```
1. USER ACTION
   └─> Fill registration form
   └─> Upload logo.png (2MB)
   └─> Click "Register Trademark"

2. FRONTEND VALIDATION
   └─> Check all required fields
   └─> Validate file size (< 10MB)
   └─> Validate file type (image/pdf)
   └─> Check registration number unique

3. IPFS UPLOAD (Files)
   └─> POST /api/upload/ipfs
   └─> Backend receives file
   └─> Upload to Pinata
   └─> Get CID: QmXxx...
   └─> Return to frontend

4. CREATE METADATA
   └─> Build JSON object
   └─> Include IPFS file links
   └─> Add trademark attributes

5. IPFS UPLOAD (Metadata)
   └─> POST /api/upload/metadata
   └─> Backend receives JSON
   └─> Upload to Pinata
   └─> Get CID: QmYyy...
   └─> Return to frontend

6. DATABASE SAVE
   └─> POST /api/trademarks
   └─> Validate data
   └─> Call dbService.createTrademark()
   └─> Save to Firestore
   └─> Return document ID

7. BLOCKCHAIN (Optional)
   └─> Connect to MetaMask
   └─> Call contract.registerTrademark()
   └─> Pay gas fee
   └─> Wait for confirmation
   └─> Get token ID
   └─> Update database with tokenId

8. SUCCESS
   └─> Show success message
   └─> Redirect to dashboard
   └─> Display new trademark
```

## API Endpoints Reference

### Upload Endpoints
```
POST /api/upload/ipfs
- Upload files to IPFS via Pinata
- Body: multipart/form-data
- Returns: { cid, url, files }

POST /api/upload/metadata
- Upload JSON metadata to IPFS
- Body: JSON object
- Returns: { cid, url }
```

### Trademark Endpoints
```
GET /api/trademarks
- Get all trademarks
- Returns: { success, data: Trademark[] }

POST /api/trademarks
- Create new trademark
- Body: Trademark data
- Returns: { success, id }

GET /api/trademarks/[id]
- Get single trademark
- Returns: { success, data: Trademark }

GET /api/trademarks/lookup
- Search by registration number or token ID
- Query: ?regNumber=TM2026001 or ?tokenId=123
- Returns: { success, data: Trademark }
```

### Admin Endpoints
```
POST /api/admin/verify-trademark
- Verify a trademark
- Body: { tokenId, adminAddress }
- Returns: { success }

POST /api/admin/reject-trademark
- Reject a trademark
- Body: { tokenId, reason, adminAddress }
- Returns: { success }

POST /api/admin/suspend-user
- Suspend a user
- Body: { address, reason, adminAddress }
- Returns: { success }

GET /api/admin/logs
- Get admin action logs
- Returns: { success, data: Log[] }
```

### Stats Endpoints
```
GET /api/stats
- Get platform statistics
- Returns: {
    overview: { totalSlogans, verifiedSlogans, ... },
    recentActivity: Activity[]
  }
```

## Security Considerations

### API Security
- Environment variables for sensitive keys
- Input validation on all endpoints
- File type and size restrictions
- Rate limiting (via Pinata)

### Database Security
- Firebase security rules
- User authentication required
- Admin role verification
- Timestamp validation

### Blockchain Security
- Smart contract auditing
- Reentrancy guards
- Access control (Ownable)
- Input validation

## Performance Optimizations

### Caching
- 5-minute cache for dashboard data
- localStorage for client-side cache
- Automatic cache invalidation

### Lazy Loading
- Dynamic imports for heavy components
- Spline 3D model lazy loaded
- Image optimization

### Database Indexing
- Index on creatorAddress
- Index on verified status
- Index on createdAt for sorting

## Error Handling

### IPFS Errors
```typescript
try {
  const cid = await uploadFilesToIPFS(files);
} catch (error) {
  if (error.message.includes('credentials')) {
    // Pinata not configured
    showError('IPFS service not configured');
  } else if (error.message.includes('size')) {
    // File too large
    showError('File exceeds 10MB limit');
  } else {
    // Generic error
    showError('Upload failed. Please try again.');
  }
}
```

### Database Errors
```typescript
try {
  await dbService.createTrademark(data);
} catch (error) {
  if (error.code === 'permission-denied') {
    showError('Authentication required');
  } else if (error.code === 'already-exists') {
    showError('Trademark already registered');
  } else {
    showError('Database error. Please try again.');
  }
}
```

### Blockchain Errors
```typescript
try {
  const tx = await contract.registerTrademark(...);
  await tx.wait();
} catch (error) {
  if (error.code === 4001) {
    // User rejected
    showError('Transaction rejected');
  } else if (error.code === -32603) {
    // Insufficient funds
    showError('Insufficient MATIC for gas');
  } else {
    showError('Blockchain error. Please try again.');
  }
}
```

## Monitoring and Logging

### Console Logs
```typescript
console.log('Uploading files to IPFS...');
console.log('Files uploaded successfully. CID:', cid);
console.log('Creating metadata...');
console.log('Metadata uploaded successfully. CID:', metadataCID);
console.log('Saving to database...');
console.log('Trademark registered successfully!');
```

### Admin Logs
All admin actions logged to database:
- Verification/rejection
- User suspension
- Listing suspension
- Includes timestamp and reason

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing Checklist
- [ ] Upload file to IPFS
- [ ] Create trademark
- [ ] Verify trademark (admin)
- [ ] Search trademark
- [ ] View on dashboard
- [ ] Check Pinata dashboard
- [ ] Check Firebase console

## Deployment

### Environment Setup
1. Configure Pinata API keys
2. Configure Firebase credentials
3. Deploy smart contracts (optional)
4. Update contract addresses

### Production Checklist
- [ ] Environment variables set
- [ ] Firebase security rules configured
- [ ] Smart contracts deployed and verified
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Monitoring enabled

## Summary

Your complete backend consists of:

1. **IPFS (Pinata)** - Permanent file storage
2. **Firebase** - Real-time database
3. **Polygon** - Blockchain ownership (optional)

All three work together to provide:
- Decentralized storage
- Fast queries
- Immutable records
- Real-time updates
- Secure ownership

Perfect for your presentation! 🚀
