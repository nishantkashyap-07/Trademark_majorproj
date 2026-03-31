@echo off
echo ========================================
echo   TrademarkChain - Pinata Setup
echo ========================================
echo.

echo This script will help you set up Pinata IPFS for your project.
echo.

echo Step 1: Get your Pinata API keys
echo --------------------------------
echo 1. Go to https://app.pinata.cloud/
echo 2. Sign up or log in (FREE account)
echo 3. Go to API Keys section
echo 4. Create a new key with pinFileToIPFS and pinJSONToIPFS permissions
echo 5. Copy both the API Key and API Secret
echo.
pause

echo.
echo Step 2: Enter your Pinata credentials
echo -------------------------------------
echo.

set /p PINATA_API_KEY="Enter your Pinata API Key: "
set /p PINATA_SECRET_KEY="Enter your Pinata API Secret: "

echo.
echo Step 3: Creating .env file...
echo.

(
echo # Pinata IPFS Configuration
echo PINATA_API_KEY=%PINATA_API_KEY%
echo PINATA_SECRET_KEY=%PINATA_SECRET_KEY%
echo NEXT_PUBLIC_PINATA_CONFIGURED=true
echo.
echo # Firebase Configuration ^(Required for Database^)
echo NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
echo NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
echo.
echo # Contract Addresses ^(Optional^)
echo NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=
echo NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=
) > .env

echo ✓ .env file created successfully!
echo.

echo Step 4: Testing your setup
echo --------------------------
echo.
echo Your Pinata credentials have been saved to .env file.
echo.
echo Next steps:
echo 1. Make sure you have Firebase configured in .env
echo 2. Restart your development server: npm run dev
echo 3. Go to http://localhost:3000/register
echo 4. Try uploading a trademark with a real image
echo 5. Check your Pinata dashboard to see the uploaded file!
echo.
echo For detailed instructions, see: PINATA_SETUP_COMPLETE_GUIDE.md
echo.

pause
