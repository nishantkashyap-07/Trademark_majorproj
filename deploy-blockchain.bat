@echo off
echo ========================================
echo   BLOCKCHAIN DEPLOYMENT SCRIPT
echo ========================================
echo.

echo Step 1: Checking environment...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file first.
    pause
    exit /b 1
)

echo Step 2: Compiling smart contracts...
call npx hardhat compile
if errorlevel 1 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying to Polygon Amoy testnet...
echo This will take 2-3 minutes...
echo.
call npx hardhat run scripts/deploy.js --network polygon

if errorlevel 1 (
    echo.
    echo ========================================
    echo   DEPLOYMENT FAILED!
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Insufficient MATIC - Get test MATIC from faucets
    echo 2. Wrong network - Check you're on Polygon Amoy
    echo 3. Invalid private key - Check PRIVATE_KEY in .env
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo IMPORTANT: Copy the contract addresses above
echo and update your .env file with:
echo.
echo NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=0x...
echo NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...
echo.
echo Then restart your dev server:
echo npm run dev
echo.
pause
