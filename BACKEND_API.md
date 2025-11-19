# 🔧 TrademarkChain Backend API Documentation

Complete API reference for the TrademarkChain backend system.

---

## 📋 Overview

The backend provides RESTful API endpoints for:
- Trademark management
- User profiles
- Search functionality
- Statistics and analytics
- IPFS file uploads
- Verification services

**Base URL**: `/api`

---

## 🔐 Authentication

Currently using Web3 wallet-based authentication. Future versions will include JWT tokens.

---

## 📡 API Endpoints

### **Trademarks**

#### Get All Trademarks
```http
GET /api/trademarks
```

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `verified` (boolean, optional) - Filter by verification status
- `search` (string, optional) - Search query
- `sortBy` (string, optional) - Sort field (default: 'createdAt')
- `order` (string, optional) - Sort order: 'asc' or 'desc' (default: 'desc')
- `limitCount` (number, optional) - Maximum results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_id",
      "tokenId": 1,
      "trademarkName": "TechLogo",
      "companyName": "TechCorp Inc.",
      "creatorAddress": "0x...",
      "category": "Technology",
      "verified": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 10
}
```

#### Get Single Trademark
```http
GET /api/trademarks/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    "tokenId": 1,
    "trademarkName": "TechLogo",
    "companyName": "TechCorp Inc.",
    "creatorAddress": "0x...",
    "ipfsHash": "Qm...",
    "category": "Technology",
    "description": "...",
    "verified": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Create Trademark
```http
POST /api/trademarks
```

**Request Body:**
```json
{
  "tokenId": 1,
  "trademarkName": "TechLogo",
  "companyName": "TechCorp Inc.",
  "creatorAddress": "0x...",
  "registrationNumber": "TM001234",
  "ipfsHash": "Qm...",
  "category": "Technology",
  "description": "...",
  "royaltyPercentage": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    ...
  }
}
```

#### Update Trademark
```http
PUT /api/trademarks/:id
```

**Request Body:**
```json
{
  "verified": true,
  "description": "Updated description"
}
```

#### Delete Trademark
```http
DELETE /api/trademarks/:id
```

#### Verify Trademark
```http
POST /api/trademarks/verify
```

**Request Body:**
```json
{
  "tokenId": 1,
  "registrationNumber": "TM001234",
  "companyAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "trademark": { ... },
  "owner": "0x...",
  "verified": true,
  "ownershipValid": true,
  "message": "Trademark is verified and ownership is valid"
}
```

---

### **Users**

#### Get User Profile
```http
GET /api/users/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "address": "0x...",
      "displayName": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "trademarks": [...],
    "stats": {
      "totalTrademarks": 5,
      "verifiedTrademarks": 3
    }
  }
}
```

#### Create/Update User
```http
POST /api/users/:address
PUT /api/users/:address
```

**Request Body:**
```json
{
  "displayName": "John Doe",
  "email": "john@example.com",
  "companyName": "TechCorp Inc."
}
```

---

### **Search**

#### Search Trademarks
```http
GET /api/search?q=searchQuery
```

**Query Parameters:**
- `q` (string, required) - Search query
- `category` (string, optional) - Filter by category
- `verified` (boolean, optional) - Filter by verification status
- `limitCount` (number, optional) - Maximum results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "doc_id",
        "trademarkName": "TechLogo",
        "relevanceScore": 100,
        ...
      }
    ],
    "count": 5,
    "query": "tech"
  }
}
```

---

### **Statistics**

#### Get Platform Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTrademarks": 1234,
      "verifiedTrademarks": 856,
      "totalUsers": 500,
      "totalCategories": 12,
      "verificationRate": "69.4"
    },
    "recent": {
      "registrationsLast7Days": 45
    },
    "categories": {
      "breakdown": {
        "Technology": 234,
        "Fashion": 156,
        ...
      },
      "top": [
        { "category": "Technology", "count": 234 },
        { "category": "Fashion", "count": 156 }
      ]
    }
  }
}
```

---

### **File Upload**

#### Upload to IPFS
```http
POST /api/upload/ipfs
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with files

**Response:**
```json
{
  "success": true,
  "data": {
    "cid": "Qm...",
    "files": ["logo.png", "document.pdf"],
    "url": "https://ipfs.io/ipfs/Qm..."
  }
}
```

---

## 🔧 Frontend API Client

### Usage Example

```typescript
import { apiClient } from '@/lib/api-client';

// Get all trademarks
const response = await apiClient.getTrademarks({
  category: 'Technology',
  verified: true,
  limit: 20
});

// Search trademarks
const searchResults = await apiClient.search('tech', {
  category: 'Technology'
});

// Verify trademark
const verification = await apiClient.verifyTrademark({
  tokenId: 1,
  companyAddress: '0x...'
});

// Upload files to IPFS
const files = [file1, file2];
const uploadResult = await apiClient.uploadToIPFS(files);

// Get user profile
const user = await apiClient.getUser('0x...');

// Get statistics
const stats = await apiClient.getStats();
```

---

## 🗄️ Database Service

### Usage Example

```typescript
import { dbService } from '@/lib/db-service';

// Create trademark
const result = await dbService.createTrademark({
  tokenId: 1,
  trademarkName: 'TechLogo',
  creatorAddress: '0x...',
  ...
});

// Get user's trademarks
const trademarks = await dbService.getTrademarksByOwner('0x...');

// Create transaction record
await dbService.createTransaction({
  type: 'registration',
  tokenId: 1,
  fromAddress: '0x...',
  transactionHash: '0x...'
});

// Get active listings
const listings = await dbService.getActiveListings();
```

---

## 📊 Firestore Collections

### **trademarks**
```typescript
{
  tokenId: number;
  trademarkName: string;
  companyName: string;
  creatorAddress: string;
  registrationNumber: string;
  ipfsHash: string;
  category: string;
  description: string;
  royaltyPercentage: number;
  verified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **users**
```typescript
{
  address: string;
  displayName?: string;
  email?: string;
  companyName?: string;
  totalTrademarks: number;
  totalSales: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **listings**
```typescript
{
  listingId: number;
  tokenId: number;
  sellerAddress: string;
  price: string;
  isLicense: boolean;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **transactions**
```typescript
{
  type: 'registration' | 'listing' | 'sale' | 'license';
  tokenId: number;
  fromAddress: string;
  toAddress?: string;
  amount?: string;
  transactionHash: string;
  createdAt: Timestamp;
}
```

---

## 🔒 Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /trademarks/{trademarkId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.creatorAddress == request.auth.uid;
    }
    
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.sellerAddress == request.auth.uid;
    }
    
    match /transactions/{transactionId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🚀 Deployment

### Environment Variables

```env
# Web3.Storage (IPFS)
WEB3_STORAGE_TOKEN=your_token_here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### API Routes Deployment

API routes are automatically deployed with Next.js:
- Vercel: Serverless functions
- Netlify: Netlify Functions
- Self-hosted: Node.js server

---

## 📝 Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 🧪 Testing

### Test API Endpoints

```bash
# Get trademarks
curl http://localhost:3000/api/trademarks

# Search
curl http://localhost:3000/api/search?q=tech

# Get stats
curl http://localhost:3000/api/stats

# Verify trademark
curl -X POST http://localhost:3000/api/trademarks/verify \
  -H "Content-Type: application/json" \
  -d '{"tokenId": 1}'
```

---

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Web3.Storage](https://web3.storage/docs/)

---

**Backend Status**: ✅ **COMPLETE AND PRODUCTION-READY**