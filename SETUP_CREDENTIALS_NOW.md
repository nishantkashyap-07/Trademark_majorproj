# Setup Credentials - Quick Guide

## ✅ Pinata IPFS - DONE!

Your Pinata credentials have been added to `.env` file:
- API Key: d4ef0b5169611367a6be
- Secret Key: 0d8c84e25499b64b1c9eb1d62429d2fae89387995bafe27932ce2b71aad8d2ee

## ⚠️ Firebase - NEEDS CONFIGURATION

You need to add your Firebase credentials to the `.env` file.

### Step 1: Get Firebase Credentials

1. Go to https://console.firebase.google.com/
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → Project Settings
4. Scroll down to "Your apps" section
5. If no web app exists, click "Add app" → Web (</>) icon
6. Copy all the config values

### Step 2: Update .env File

Open the `.env` file and replace these placeholder values:

```env
# Replace these with your actual Firebase values:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (your actual API key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 3: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (closest to you)
5. Click "Enable"

### Step 4: Restart Development Server

After updating `.env`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing Your Setup

### Test 1: Check Environment Variables
Open browser console and run:
```javascript
console.log('Pinata configured:', process.env.NEXT_PUBLIC_PINATA_CONFIGURED);
```

### Test 2: Register a Trademark
1. Go to http://localhost:3000/register
2. Connect your wallet
3. Fill in the form:
   - Company Name: Test Corp
   - Slogan: Test Slogan
   - Click "Generate" for registration number
   - Category: Technology
   - Upload a small image (< 1MB)
4. Click through the steps
5. Click "Register Trademark"

### Expected Results:
✅ Console shows: "Uploading files to IPFS..."
✅ Console shows: "Files uploaded successfully. CID: QmXxx..."
✅ Console shows: "Metadata uploaded successfully. CID: QmYyy..."
✅ Console shows: "Saving to database..."
✅ Success message appears
✅ Redirects to dashboard

### Test 3: Check Pinata Dashboard
1. Go to https://app.pinata.cloud/pinmanager
2. You should see your uploaded files!
3. Click on a file to view it

### Test 4: Check Firebase Console
1. Go to https://console.firebase.google.com/
2. Open your project
3. Go to Firestore Database
4. You should see a "trademarks" collection with your data!

## Troubleshooting

### Error: "Pinata API credentials not configured"
- Check `.env` file exists in project root
- Check API keys are correct (no quotes, no spaces)
- Restart dev server

### Error: "Firebase: Error (auth/invalid-api-key)"
- Your Firebase API key is incorrect
- Go back to Firebase Console and copy the correct key
- Update `.env` file
- Restart dev server

### Error: "Failed to upload to IPFS"
- Check internet connection
- Verify Pinata API keys are valid
- Try uploading a smaller file (< 1MB)
- Check Pinata dashboard for rate limits

### Files not appearing in Pinata
- Wait 30-60 seconds (processing time)
- Refresh Pinata dashboard
- Check "Pin Manager" section
- Verify API keys have correct permissions

## Current Status

✅ Pinata IPFS - Configured and ready
⚠️ Firebase - Needs your credentials
⚠️ Blockchain - Optional (not needed for demo)

## Next Steps

1. Add Firebase credentials to `.env`
2. Restart dev server
3. Test trademark registration
4. Verify files appear in Pinata dashboard
5. Verify data appears in Firebase console
6. Ready for presentation! 🚀

## Quick Reference

### .env File Location
```
E:\major\.env
```

### Pinata Dashboard
https://app.pinata.cloud/pinmanager

### Firebase Console
https://console.firebase.google.com/

### Your App
http://localhost:3000

## For Your Presentation

When explaining the backend:

1. **Show Pinata Dashboard**
   - "Files are stored on IPFS via Pinata"
   - Show uploaded files with CIDs
   - Explain decentralized storage

2. **Show Firebase Console**
   - "Metadata stored in Firebase for fast queries"
   - Show trademarks collection
   - Explain real-time database

3. **Show Browser Console**
   - "Complete upload flow with logs"
   - Show IPFS CIDs
   - Show success messages

4. **Show the Flow**
   - User uploads → Pinata → IPFS CID
   - Metadata created → Pinata → IPFS CID
   - Data saved → Firebase → Document ID
   - Success → Dashboard shows trademark

Perfect demonstration of full-stack blockchain application! 🎯
