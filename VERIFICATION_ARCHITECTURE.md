# Verification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION SYSTEM                           │
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   User UI    │         │  Admin UI    │                      │
│  │  /verify     │         │   /admin     │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
│         └────────┬───────────────┘                               │
│                  │                                               │
│         ┌────────▼────────┐                                      │
│         │  Verification   │                                      │
│         │   Components    │                                      │
│         └────────┬────────┘                                      │
│                  │                                               │
│         ┌────────▼────────┐                                      │
│         │   API Layer     │                                      │
│         └────────┬────────┘                                      │
│                  │                                               │
│    ┌─────────────┼─────────────┐                                │
│    │             │             │                                │
│ ┌──▼──┐      ┌──▼──┐      ┌──▼──┐                              │
│ │Smart│      │Fire-│      │IPFS │                              │
│ │Cont-│      │base │      │     │                              │
│ │ract │      │     │      │     │                              │
│ └─────┘      └─────┘      └─────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### User Verification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VERIFICATION                         │
└─────────────────────────────────────────────────────────────┘

1. User Input
   ┌──────────────────────────────────┐
   │  VerificationSystem Component    │
   │  - Registration Number Input     │
   │  - Token ID Input                │
   │  - Search Button                 │
   └──────────────┬───────────────────┘
                  │
                  ▼
2. Lookup Method Selection
   ┌──────────────────────────────────┐
   │  Search Type: Registration / ID  │
   └──────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   Registration         Token ID
   Number Lookup        Direct Lookup
        │                   │
        ▼                   │
   Smart Contract          │
   getTokenIdBy            │
   Registration()          │
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
3. Get Trademark Info
   ┌──────────────────────────────────┐
   │  Smart Contract                  │
   │  getTrademarkInfo(tokenId)       │
   └──────────────┬───────────────────┘
                  │
                  ▼
4. Generate QR Code
   ┌──────────────────────────────────┐
   │  QRCode.toDataURL()              │
   │  - Verification URL              │
   │  - Custom Styling                │
   └──────────────┬───────────────────┘
                  │
                  ▼
5. Display Results
   ┌──────────────────────────────────┐
   │  Verification Result UI          │
   │  - Status Badge                  │
   │  - Trademark Details             │
   │  - QR Code Image                 │
   │  - Download Button               │
   └──────────────────────────────────┘
```

### Admin Verification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN VERIFICATION                         │
└─────────────────────────────────────────────────────────────┘

1. Admin Dashboard
   ┌──────────────────────────────────┐
   │  Admin Index Page                │
   │  - Pending Trademarks List       │
   │  - Verified Trademarks List      │
   │  - Reports List                  │
   └──────────────┬───────────────────┘
                  │
                  ▼
2. Select Trademark
   ┌──────────────────────────────────┐
   │  Click "Review & Verify"         │
   └──────────────┬───────────────────┘
                  │
                  ▼
3. Verification Panel Opens
   ┌──────────────────────────────────┐
   │  AdminVerificationPanel          │
   │  ┌────────────────────────────┐  │
   │  │  Left Column               │  │
   │  │  - Basic Info              │  │
   │  │  - Blockchain Data         │  │
   │  │  - IPFS Metadata           │  │
   │  └────────────────────────────┘  │
   │  ┌────────────────────────────┐  │
   │  │  Right Column              │  │
   │  │  - QR Code Preview         │  │
   │  │  - Verification Checklist  │  │
   │  │  - Action Buttons          │  │
   │  └────────────────────────────┘  │
   └──────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   APPROVE              REJECT
        │                   │
        ▼                   ▼
   Call Smart          Require
   Contract            Reason
   verifyTrademark()        │
        │                   │
        ▼                   ▼
   Update              Update
   Database            Database
        │                   │
        ▼                   ▼
   Create              Create
   Admin Log           Admin Log
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
4. Close Panel & Refresh
   ┌──────────────────────────────────┐
   │  Updated Trademark List          │
   └──────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        DATA FLOW                             │
└─────────────────────────────────────────────────────────────┘

User/Admin Input
      │
      ▼
┌─────────────┐
│  Frontend   │
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Web3      │
│  Context    │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Smart     │    │  Firebase   │
│  Contract   │    │  Database   │
│  (Polygon)  │    │             │
└──────┬──────┘    └──────┬──────┘
       │                  │
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    IPFS     │    │   Admin     │
│  Metadata   │    │    Logs     │
└─────────────┘    └─────────────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
         ┌─────────────┐
         │  QR Code    │
         │  Generator  │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │   Display   │
         │   Results   │
         └─────────────┘
```

## Component Hierarchy

```
App
│
├── Navbar
│
├── Pages
│   │
│   ├── /verify
│   │   ├── VerificationSystem
│   │   │   ├── Search Input
│   │   │   ├── Search Type Toggle
│   │   │   ├── Verify Button
│   │   │   └── Results Display
│   │   │       ├── Status Badge
│   │   │       ├── Trademark Details
│   │   │       ├── QR Code Image
│   │   │       └── Download Button
│   │   │
│   │   └── ProductVerification (Demo)
│   │
│   └── /admin
│       ├── Stats Cards
│       ├── Tabs (Pending/Verified/Reports)
│       ├── Trademark List
│       │   └── Trademark Card
│       │       └── Review Button
│       │
│       └── AdminVerificationPanel (Modal)
│           ├── Header
│           ├── Status Banner
│           ├── Left Column
│           │   ├── Basic Info Card
│           │   ├── Blockchain Data Card
│           │   └── IPFS Data Card
│           │
│           └── Right Column
│               ├── QR Code Card
│               ├── Checklist Card
│               └── Action Buttons
│                   ├── Approve Button
│                   └── Reject Button
│                       └── Rejection Modal
│
└── Footer
```

## API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                           │
└─────────────────────────────────────────────────────────────┘

Public Endpoints
├── GET /api/trademarks/lookup
│   ├── Query: registrationNumber
│   ├── Query: tokenId
│   └── Returns: Trademark data
│
├── GET /api/trademarks/[id]
│   └── Returns: Single trademark
│
└── GET /api/trademarks
    └── Returns: All trademarks

Admin Endpoints (Authenticated)
├── POST /api/admin/verify-trademark
│   ├── Body: { trademarkId, tokenId, adminAddress }
│   └── Returns: Success/Error
│
├── POST /api/admin/reject-trademark
│   ├── Body: { trademarkId, reason, adminAddress }
│   └── Returns: Success/Error
│
├── GET /api/admin/reports
│   ├── Query: status
│   └── Returns: Reports list
│
└── GET /api/admin/logs
    └── Returns: Admin activity logs
```

## Smart Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SMART CONTRACT STRUCTURE                    │
└─────────────────────────────────────────────────────────────┘

TrademarkNFT Contract
│
├── State Variables
│   ├── _tokenIdCounter
│   ├── trademarks (mapping)
│   └── registrationToTokenId (mapping)
│
├── Structs
│   └── Trademark
│       ├── tokenId
│       ├── creator
│       ├── companyName
│       ├── sloganText
│       ├── registrationNumber
│       ├── ipfsHash
│       ├── category
│       ├── royaltyBps
│       ├── createdAt
│       └── verified
│
├── Public Functions
│   ├── registerTrademark()
│   ├── getTrademarkInfo()
│   ├── getTokenIdByRegistration()
│   ├── isRegistrationNumberUsed()
│   └── totalSupply()
│
└── Admin Functions (onlyOwner)
    └── verifyTrademark()
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRESTORE COLLECTIONS                     │
└─────────────────────────────────────────────────────────────┘

trademarks/
├── {trademarkId}
│   ├── tokenId: number
│   ├── companyName: string
│   ├── trademarkName: string
│   ├── registrationNumber: string
│   ├── category: string
│   ├── creatorAddress: string
│   ├── ipfsHash: string
│   ├── verified: boolean
│   ├── verificationStatus: string
│   ├── verifiedBy?: string
│   ├── verifiedAt?: Timestamp
│   ├── rejectionReason?: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp

admin_logs/
├── {logId}
│   ├── adminAddress: string
│   ├── action: string
│   ├── targetType: string
│   ├── targetId: string
│   ├── reason?: string
│   └── timestamp: Timestamp

users/
├── {userAddress}
│   ├── address: string
│   ├── suspended: boolean
│   ├── suspensionReason?: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp

reports/
├── {reportId}
│   ├── type: string
│   ├── targetType: string
│   ├── targetId: string
│   ├── reason: string
│   ├── description?: string
│   ├── reporterAddress: string
│   ├── status: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

Layer 1: Frontend Validation
├── Input sanitization
├── Format validation
├── Client-side checks
└── Error handling

Layer 2: API Authentication
├── Wallet signature verification
├── Admin address validation
├── Rate limiting
└── Request validation

Layer 3: Smart Contract Security
├── onlyOwner modifier
├── ReentrancyGuard
├── Input validation
└── Access control

Layer 4: Database Security
├── Firestore rules
├── Field validation
├── Timestamp verification
└── Data integrity checks

Layer 5: IPFS Security
├── Hash verification
├── Content validation
├── Gateway security
└── Pinning service auth
```

## QR Code Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  QR CODE GENERATION                          │
└─────────────────────────────────────────────────────────────┘

1. Trademark Verified
        │
        ▼
2. Generate Verification URL
   ┌──────────────────────────────────┐
   │  ${origin}/verify?tokenId=${id}  │
   └──────────────┬───────────────────┘
                  │
                  ▼
3. QRCode Library
   ┌──────────────────────────────────┐
   │  QRCode.toDataURL(url, options)  │
   │  - Width: 300px                  │
   │  - Margin: 2                     │
   │  - Dark: #1e293b                 │
   │  - Light: #ffffff                │
   └──────────────┬───────────────────┘
                  │
                  ▼
4. Base64 Data URL
   ┌──────────────────────────────────┐
   │  data:image/png;base64,...       │
   └──────────────┬───────────────────┘
                  │
                  ▼
5. Display & Download
   ┌──────────────────────────────────┐
   │  <img src={qrCodeUrl} />         │
   │  <button onClick={download} />   │
   └──────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
└─────────────────────────────────────────────────────────────┘

Global State (Web3Context)
├── account: string | null
├── isConnected: boolean
├── trademarkNFTContract: Contract | null
├── marketplaceContract: Contract | null
└── provider: Provider | null

Component State (VerificationSystem)
├── searchType: 'registration' | 'tokenId'
├── searchValue: string
├── isVerifying: boolean
├── result: VerificationResult | null
└── toast: Toast | null

Component State (AdminVerificationPanel)
├── isLoading: boolean
├── qrCodeUrl: string
├── blockchainData: any | null
├── rejectionReason: string
└── showRejectModal: boolean
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                            │
└─────────────────────────────────────────────────────────────┘

User Action
    │
    ▼
Try Block
    │
    ├─ Success ──────────────┐
    │                        │
    └─ Error                 │
        │                    │
        ▼                    │
    Catch Block              │
        │                    │
        ├─ Log Error         │
        ├─ Show Toast        │
        └─ Update State      │
                             │
                             ▼
                      Display Result
                             │
                             ▼
                      User Feedback
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                  PERFORMANCE STRATEGIES                      │
└─────────────────────────────────────────────────────────────┘

Frontend
├── Lazy loading components
├── Memoized callbacks
├── Debounced inputs
├── Optimized re-renders
└── Code splitting

Backend
├── Cached contract instances
├── Indexed database queries
├── Batch operations
├── Connection pooling
└── CDN for static assets

Blockchain
├── Efficient contract calls
├── Event listening
├── Gas optimization
└── Read-only operations

IPFS
├── Gateway caching
├── Pinning service
├── Content addressing
└── Parallel fetching
```

---

**Architecture Version:** 1.0.0
**Last Updated:** 2024
**Status:** Production Ready
