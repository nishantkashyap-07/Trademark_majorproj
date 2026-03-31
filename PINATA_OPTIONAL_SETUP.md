# Pinata IPFS Setup (Optional)

## Overview
The trademark registration now works in TWO modes:
1. **Mock Mode** (Default) - Works without Pinata, perfect for demos
2. **Production Mode** - Uses real Pinata IPFS storage

## Current Status: Mock Mode ✅

Your application is currently running in **Mock Mode**, which means:
- ✅ Trademark registration works without Pinata
- ✅ Mock IPFS hashes are generated (e.g., `QmMock1234567Assets`)
- ✅ All data is stored in Firebase database
- ✅ Perfect for presentations and demos
- ✅ No additional setup required

## How Mock Mode Works

When you register a trademark:
1. Files are validated but not uploaded to IPFS
2. Mock IPFS CID is generated: `QmMock{timestamp}Assets`
3. Mock metadata CID is generated: `QmMock{timestamp}Metadata`
4. Trademark data is saved to Firebase with mock CIDs
5. Everything works normally, just without real IPFS storage

## When to Use Production Mode

Use Production Mode (real Pinata) when:
- Deploying to production
- Need actual decentralized file storage
- Want real IPFS hashes for files
- Building for real users

## Setting Up Pinata (Optional)

### Step 1: Create Pinata Account
1. Go to https://app.pinata.cloud/
2. Sign up for a free account
3. Verify your email

### Step 2: Get API Keys
1. Go to https://app.pinata.cloud/developers/api-keys
2. Click "New Key"
3. Enable these permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
4. Give it a name (e.g., "TrademarkChain")
5. Click "Create Key"
6. **IMPORTANT**: Copy both keys immediately (you can't see them again!)
   - API Key
   - API Secret

### Step 3: Configure Environment Variables
1. Open your `.env` file (or create one from `.env.example`)
2. Add your Pinata credentials:
```env
PINATA_API_KEY=your_actual_api_key_here
PINATA_SECRET_KEY=your_actual_secret_key_here
NEXT_PUBLIC_PINATA_CONFIGURED=true
```

### Step 4: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### Step 5: Test Upload
1. Go to registration page
2. Fill in trademark details
3. Upload files
4. Click "Register Trademark"
5. Check console for "Uploading files to IPFS..." (not "Using mock IPFS data")

## Verification

### Check if Mock Mode is Active
Look at the console logs when registering:
- **Mock Mode**: "Pinata not configured. Using mock IPFS data for demo..."
- **Production Mode**: "Uploading files to IPFS..."

### Check IPFS Hash Format
- **Mock Mode**: `QmMock1708123456Assets` (contains "Mock" and timestamp)
- **Production Mode**: `QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx` (real IPFS hash)

## Troubleshooting

### Error: "Pinata API credentials not configured"
**Solution**: You're trying to use Production Mode without setting up Pinata
- Either set up Pinata (see above)
- Or use Mock Mode (default, no setup needed)

### Files Not Uploading
**In Mock Mode**: This is normal! Files aren't actually uploaded
**In Production Mode**: 
1. Check API keys are correct
2. Check internet connection
3. Check Pinata dashboard for quota limits
4. Check file size (max 10MB per file)

### Mock CIDs Not Working
**This is expected**: Mock CIDs are for demo purposes only
- They won't resolve to actual files on IPFS
- They're stored in database for reference
- Perfect for presentations where you just need to show the flow

## For Tomorrow's Presentation

### Recommended: Use Mock Mode ✅
- Already configured and working
- No additional setup needed
- Faster registration (no upload time)
- No API rate limits
- No internet dependency for uploads

### If You Want Real IPFS
- Set up Pinata today (takes 5 minutes)
- Test it thoroughly before presentation
- Have backup plan if API fails during demo

## Pinata Free Tier Limits

- **Storage**: 1 GB
- **Bandwidth**: 100 GB/month
- **Requests**: 180 requests/minute
- **Files**: Unlimited

More than enough for demos and testing!

## Cost

- **Free Tier**: $0/month (perfect for demos)
- **Picnic Plan**: $20/month (1TB storage)
- **Production**: Custom pricing

## Alternative: Web3.Storage

If you prefer Web3.Storage instead of Pinata:
1. Get token from https://web3.storage/
2. Set `WEB3_STORAGE_TOKEN` in `.env`
3. Modify upload API to use Web3.Storage

## Summary

### Current Setup (Mock Mode)
```
✅ Works without Pinata
✅ No setup required
✅ Perfect for demos
✅ Fast registration
✅ No API dependencies
```

### With Pinata (Production Mode)
```
✅ Real IPFS storage
✅ Decentralized files
✅ Permanent storage
✅ Real IPFS hashes
⚠️ Requires setup
⚠️ Internet dependent
```

## Quick Decision Guide

**For Tomorrow's Presentation**: Use Mock Mode (current setup)
**For Production Deployment**: Set up Pinata
**For Testing IPFS**: Set up Pinata
**For Quick Demo**: Use Mock Mode

## Need Help?

Check these files:
- `pages/register.tsx` - Registration logic
- `pages/api/upload/ipfs.ts` - Upload API
- `utils/ipfs.ts` - IPFS utilities
- `.env.example` - Environment variables template

The system is designed to work perfectly in both modes, so choose what's best for your use case!
