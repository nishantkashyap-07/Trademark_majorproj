# Complete Pinata Setup Guide for TrademarkChain

## What is Pinata and Why Do We Need It?

### What is IPFS?
IPFS (InterPlanetary File System) is a decentralized storage network where files are stored across multiple nodes instead of a central server. Each file gets a unique hash (CID - Content Identifier) that can be used to retrieve it from anywhere.

### What is Pinata?
Pinata is a service that "pins" your files on IPFS, ensuring they remain available and accessible. Without pinning, files might disappear from IPFS if no one is hosting them.

### Why We Need It
In TrademarkChain, we store:
1. **Trademark images/documents** - Logo files, certificates, legal documents
2. **Metadata** - JSON files with trademark information
3. **Proof of ownership** - Immutable records linked to blockchain

## Step-by-Step Setup

### Step 1: Create Pinata Account
1. Go to https://app.pinata.cloud/
2. Click "Sign Up" (it's FREE!)
3. Verify your email
4. Complete the onboarding

### Step 2: Get API Keys
1. After login, click on your profile (top right)
2. Go to "API Keys" section
3. Click "New Key" button
4. Configure the key:
   - **Name**: TrademarkChain Development
   - **Permissions**: Check these boxes:
     - ✅ pinFileToIPFS
     - ✅ pinJSONToIPFS
     - ✅ unpin (optional)
   - **Max Uses**: Leave unlimited or set to 1000
5. Click "Create Key"
6. **IMPORTANT**: Copy both keys immediately:
   - API Key (starts with letters/numbers)
   - API Secret (longer string)
   - You won't see the secret again!

### Step 3: Add Keys to Your Project

#### Option A: Create .env file (Recommended)
1. In your project root, create a file named `.env` (if it doesn't exist)
2. Add these lines:

```env
# Pinata IPFS Configuration
PINATA_API_KEY=your_actual_api_key_here
PINATA_SECRET_KEY=your_actual_secret_key_here
NEXT_PUBLIC_PINATA_CONFIGURED=true
```

3. Replace `your_actual_api_key_here` with your real API key
4. Replace `your_actual_secret_key_here` with your real secret key
5. Save the file

#### Option B: Use Environment Variables (Windows)
```cmd
set PINATA_API_KEY=your_actual_api_key_here
set PINATA_SECRET_KEY=your_actual_secret_key_here
set NEXT_PUBLIC_PINATA_CONFIGURED=true
```

### Step 4: Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test the Setup
1. Go to http://localhost:3000/register
2. Fill in the trademark form
3. Upload a test image
4. Click "Register Trademark"
5. Check the console for "Files uploaded to IPFS successfully"

## How It Works - Complete Backend Flow

### Registration Flow (Step by Step)

#### 1. User Fills Form
```
User enters:
- Company Name: "TechCorp"
- Slogan: "Innovation First"
- Registration Number: TM2026001 (auto-generated)
- Category: "Technology"
- Files: logo.png, certificate.pdf
```

#### 2. Frontend Validation
```typescript
// pages/register.tsx
- Validates all required fields
- Checks file sizes (max 10MB each)
- Checks file types (images, PDFs only)
- Verifies registration number is unique
```

#### 3. File Upload to IPFS (Pinata)
```typescript
// utils/ipfs.ts → uploadFilesToIPFS()

Step 3.1: Prepare files
- Creates FormData object
- Adds each file to form data
- Adds metadata (timestamp, name)

Step 3.2: Send to API
- POST request to /api/upload/ipfs
- Sends files as multipart/form-data

Step 3.3: API processes upload
// pages/api/upload/ipfs.ts
- Receives files using formidable
- Validates Pinata credentials
- Creates new FormData for Pinata
- Adds files as streams

Step 3.4: Upload to Pinata
- POST to https://api.pinata.cloud/pinning/pinFileToIPFS
- Headers include API key and secret
- Pinata processes and pins files

Step 3.5: Get IPFS Hash
- Pinata returns: { IpfsHash: "QmXxx..." }
- This is the CID (Content Identifier)
- Files are now on IPFS permanently!

Result: assetsCID = "QmXxx..."
```

#### 4. Create Metadata
```typescript
// utils/ipfs.ts → createTrademarkMetadata()

Creates JSON object:
{
  "name": "Innovation First",
  "description": "TechCorp trademark",
  "image": "ipfs://QmXxx.../logo.png",
  "attributes": [
    { "trait_type": "Company", "value": "TechCorp" },
    { "trait_type": "Registration Number", "value": "TM2026001" },
    { "trait_type": "Category", "value": "Technology" }
  ],
  "files": [
    "ipfs://QmXxx.../logo.png",
    "ipfs://QmXxx.../certificate.pdf"
  ]
}
```

#### 5. Upload Metadata to IPFS
```typescript
// utils/ipfs.ts → uploadMetadataToIPFS()

Step 5.1: Send to API
- POST to /api/upload/metadata
- Sends JSON metadata

Step 5.2: API processes
// pages/api/upload/metadata.ts
- Receives JSON
- Validates Pinata credentials
- Converts to Pinata format

Step 5.3: Upload to Pinata
- POST to https://api.pinata.cloud/pinning/pinJSONToIPFS
- Pinata stores JSON on IPFS

Step 5.4: Get metadata hash
- Returns: { IpfsHash: "QmYyy..." }

Result: metadataCID = "QmYyy..."
```

#### 6. Save to Database (Firebase)
```typescript
// pages/register.tsx → handleSubmit()

POST to /api/trademarks
Body: {
  tokenId: 1234567890,
  creatorAddress: "0xABC...",
  trademarkName: "Innovation First",
  companyName: "TechCorp",
  registrationNumber: "TM2026001",
  ipfsHash: "QmXxx...",  // Assets CID
  category: "Technology",
  description: "...",
  royaltyPercentage: 5,
  tokenURI: "ipfs://QmYyy.../metadata.json",
  verified: false,
  verificationStatus: "pending"
}

// pages/api/trademarks/index.ts
- Validates data
- Calls dbService.createTrademark()

// lib/db-service.ts
- Connects to Firebase Firestore
- Creates document in 'trademarks' collection
- Adds timestamps (createdAt, updatedAt)
- Returns success with document ID
```

#### 7. Optional: Register on Blockchain
```typescript
// If contracts are deployed:

Step 7.1: Connect to wallet
- Uses ethers.js
- Gets signer from MetaMask

Step 7.2: Call smart contract
// utils/contracts.ts → registerTrademark()
- Calls TrademarkNFT.registerTrademark()
- Sends: companyName, sloganText, regNumber, ipfsHash, tokenURI
- Pays gas fee (Polygon MATIC)

Step 7.3: Wait for transaction
- Transaction is mined on Polygon blockchain
- Returns: tokenId, transactionHash

Step 7.4: Update database
- Adds blockchain data to Firebase
- Links tokenId to database record
```

#### 8. Success Response
```typescript
// User sees:
"Trademark registered successfully! Redirecting to dashboard..."

// What happened:
✅ Files uploaded to IPFS (permanent storage)
✅ Metadata uploaded to IPFS (permanent metadata)
✅ Record saved to Firebase (searchable database)
✅ (Optional) NFT minted on blockchain (proof of ownership)
```

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │ 1. Fill form + upload files
       ▼
┌─────────────────────┐
│  pages/register.tsx │
│  (Frontend)         │
└──────┬──────────────┘
       │ 2. Validate & prepare
       ▼
┌─────────────────────┐
│  utils/ipfs.ts      │
│  uploadFilesToIPFS()│
└──────┬──────────────┘
       │ 3. POST /api/upload/ipfs
       ▼
┌──────────────────────┐
│ api/upload/ipfs.ts   │
│ (Backend API)        │
└──────┬───────────────┘
       │ 4. Upload to Pinata
       ▼
┌──────────────────────┐
│   Pinata Cloud       │
│   (IPFS Service)     │
└──────┬───────────────┘
       │ 5. Returns CID: QmXxx...
       ▼
┌─────────────────────┐
│  utils/ipfs.ts      │
│  createMetadata()   │
└──────┬──────────────┘
       │ 6. POST /api/upload/metadata
       ▼
┌──────────────────────┐
│ api/upload/metadata  │
└──────┬───────────────┘
       │ 7. Upload JSON to Pinata
       ▼
┌──────────────────────┐
│   Pinata Cloud       │
└──────┬───────────────┘
       │ 8. Returns CID: QmYyy...
       ▼
┌─────────────────────┐
│ pages/register.tsx  │
└──────┬──────────────┘
       │ 9. POST /api/trademarks
       ▼
┌──────────────────────┐
│ api/trademarks/      │
│ index.ts             │
└──────┬───────────────┘
       │ 10. Save to database
       ▼
┌──────────────────────┐
│  Firebase Firestore  │
│  (Database)          │
└──────┬───────────────┘
       │ 11. Success!
       ▼
┌─────────────┐
│   User      │
│  Dashboard  │
└─────────────┘
```

## File Structure

```
TrademarkChain/
├── pages/
│   ├── register.tsx              # Registration form UI
│   └── api/
│       ├── upload/
│       │   ├── ipfs.ts          # File upload endpoint
│       │   └── metadata.ts      # Metadata upload endpoint
│       └── trademarks/
│           └── index.ts         # Database save endpoint
├── utils/
│   ├── ipfs.ts                  # IPFS helper functions
│   └── contracts.ts             # Blockchain functions
├── lib/
│   └── db-service.ts            # Firebase database service
└── .env                         # Environment variables (API keys)
```

## What Gets Stored Where?

### IPFS (via Pinata)
- **Files**: logo.png, certificate.pdf
- **Metadata**: JSON with trademark info
- **Permanent**: Never deleted, always accessible
- **Decentralized**: Stored across multiple nodes

### Firebase (Database)
- **Trademark records**: All form data
- **IPFS references**: Links to IPFS files
- **User data**: Creator addresses
- **Status**: Verification status, timestamps
- **Searchable**: Can query by category, owner, etc.

### Blockchain (Optional)
- **NFT ownership**: Who owns the trademark
- **Token ID**: Unique identifier
- **Transaction history**: All transfers
- **Immutable**: Cannot be changed or deleted

## Verification Process

After registration, admin can verify:

1. **Admin Dashboard** (`/admin`)
   - Shows pending trademarks
   - Displays IPFS files for review
   - Can approve or reject

2. **Verification API** (`/api/admin/verify-trademark`)
   - Updates verification status
   - Adds verified badge
   - Logs admin action

3. **User Dashboard** (`/dashboard`)
   - Shows verification status
   - Displays verified badge
   - Can view IPFS files

## Testing Your Setup

### Test 1: Check API Keys
```bash
# In your terminal:
echo $PINATA_API_KEY
echo $PINATA_SECRET_KEY
```

Should show your actual keys (not "undefined")

### Test 2: Test Upload
1. Go to https://app.pinata.cloud/pinmanager
2. Click "Upload" → "File"
3. Upload a test image
4. You should see it in your Pinata dashboard
5. Note the CID (starts with "Qm")

### Test 3: Test in App
1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/register
3. Fill form and upload image
4. Check browser console for:
   - "Uploading files to IPFS..."
   - "Files uploaded successfully. CID: QmXxx..."
5. Check Pinata dashboard - your file should appear!

## Troubleshooting

### Error: "Pinata API credentials not configured"
**Solution**: 
- Check .env file exists
- Check keys are correct (no quotes, no spaces)
- Restart dev server

### Error: "Failed to upload to IPFS"
**Solution**:
- Check internet connection
- Verify API keys are valid
- Check Pinata dashboard for rate limits
- Try smaller file size

### Error: "File too large"
**Solution**:
- Max file size is 10MB
- Compress images before upload
- Split large PDFs

### Files not showing in Pinata dashboard
**Solution**:
- Wait 30 seconds (processing time)
- Refresh Pinata dashboard
- Check "Pin Manager" section

## For Your Presentation

### What to Say:
1. **"We use IPFS for decentralized storage"**
   - Files stored permanently
   - No single point of failure
   - Accessible from anywhere

2. **"Pinata ensures files stay available"**
   - Professional pinning service
   - 99.9% uptime guarantee
   - Fast global CDN

3. **"Each file gets a unique hash"**
   - Content-addressed storage
   - Hash proves file integrity
   - Cannot be tampered with

4. **"Metadata stored on IPFS too"**
   - Complete trademark information
   - Linked to blockchain NFT
   - Permanent record

### Demo Flow:
1. Show registration form
2. Upload a real logo file
3. Show console logs (IPFS upload)
4. Show Pinata dashboard (file appears)
5. Show database (record saved)
6. Show verification system (admin can verify)

## Cost and Limits

### Pinata Free Tier:
- ✅ 1 GB storage
- ✅ Unlimited bandwidth
- ✅ 100 requests/month
- ✅ Perfect for demo/presentation!

### For Production:
- Upgrade to paid plan if needed
- More storage and requests
- Priority support

## Summary

Your complete backend flow:
1. User uploads files → Frontend validation
2. Files sent to API → Backend processing
3. API uploads to Pinata → IPFS storage
4. Pinata returns CID → Permanent hash
5. Metadata created → JSON with info
6. Metadata uploaded → Second IPFS hash
7. Data saved to Firebase → Searchable database
8. (Optional) Blockchain → NFT minted
9. Success! → User sees confirmation

Everything is real, permanent, and decentralized! 🚀
