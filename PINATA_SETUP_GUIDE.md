# Pinata IPFS Setup Guide

Your project has been successfully configured to use Pinata for IPFS storage instead of Web3.Storage.

## What Changed

### 1. Updated Files
- `utils/ipfs.ts` - Now uses Pinata API via backend endpoints
- `pages/api/upload/ipfs.ts` - Server-side file upload to Pinata
- `pages/api/upload/metadata.ts` - Server-side JSON metadata upload to Pinata
- `utils/constants.ts` - Pinata gateway prioritized in IPFS_CONFIG
- `.env.local` - Removed Web3.Storage token

### 2. New Dependencies
- `form-data` - For multipart form uploads to Pinata
- `@types/form-data` - TypeScript types

## Getting Pinata API Keys

Your current API keys appear to be invalid. Follow these steps to get new ones:

1. **Sign up for Pinata**
   - Go to https://www.pinata.cloud/
   - Click "Sign Up" and create a free account
   - Verify your email address

2. **Generate API Keys**
   - Log in to your Pinata dashboard
   - Click on "API Keys" in the left sidebar
   - Click "New Key" button
   - Give your key a name (e.g., "Trademark NFT Marketplace")
   - Enable the following permissions:
     - ✅ pinFileToIPFS
     - ✅ pinJSONToIPFS
     - ✅ unpin (optional)
   - Click "Create Key"
   - **IMPORTANT**: Copy both the API Key and API Secret immediately (you won't be able to see the secret again)

3. **Update .env.local**
   ```env
   # IPFS Configuration (Pinata)
   PINATA_API_KEY=your_actual_api_key_here
   PINATA_SECRET_KEY=your_actual_secret_key_here
   ```

4. **Test the Connection**
   ```bash
   node scripts/test-pinata.js
   ```

   You should see:
   ```
   ✅ Pinata connection successful!
   📊 Account info: { message: 'Congratulations! You are communicating with the Pinata API!' }
   ```

## How It Works

### File Upload Flow
1. User selects files in the frontend
2. Files are sent to `/api/upload/ipfs` endpoint
3. Server uploads files to Pinata using their API
4. Returns IPFS hash (CID) to the frontend
5. Frontend uses the CID to create metadata

### Metadata Upload Flow
1. Frontend creates metadata object with IPFS references
2. Metadata is sent to `/api/upload/metadata` endpoint
3. Server uploads JSON to Pinata
4. Returns metadata CID
5. This CID is stored on the blockchain

### IPFS Gateway
Files are accessible via multiple gateways (with Pinata prioritized):
- `https://gateway.pinata.cloud/ipfs/{CID}`
- `https://ipfs.io/ipfs/{CID}`
- `https://dweb.link/ipfs/{CID}`

## Pinata Free Tier Limits

- **Storage**: 1 GB
- **Bandwidth**: Unlimited
- **Requests**: Unlimited
- **Files**: Unlimited

This is more than enough for development and testing!

## Testing the Integration

After setting up your API keys, test the upload functionality:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the trademark registration page
3. Try uploading an image file
4. Check the browser console for upload progress
5. Verify the file appears on Pinata dashboard

## Troubleshooting

### "Invalid API key" Error
- Double-check your API keys in .env.local
- Make sure there are no extra spaces or quotes
- Regenerate keys if needed

### "Failed to upload" Error
- Check your internet connection
- Verify Pinata service status at https://status.pinata.cloud/
- Check file size (max 10MB per file)

### Files Not Accessible
- Wait a few seconds for IPFS propagation
- Try different gateway URLs
- Check if the CID is correct

## Benefits of Pinata

✅ **Reliable**: Enterprise-grade IPFS infrastructure
✅ **Fast**: Dedicated gateways for quick retrieval
✅ **Simple**: Easy-to-use API
✅ **Free Tier**: Generous limits for development
✅ **Dashboard**: Visual interface to manage your files
✅ **Pinning**: Files stay permanently available

## Next Steps

1. Get your Pinata API keys
2. Update .env.local with the new keys
3. Run the test script to verify connection
4. Test file uploads in your application
5. Monitor usage in Pinata dashboard

Your trademark NFT marketplace is now ready to use Pinata for decentralized storage! 🚀
