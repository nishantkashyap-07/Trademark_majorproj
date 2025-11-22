@echo off
echo ========================================
echo Local Blockchain Demo Setup
echo ========================================
echo.

echo Step 1: Checking if Hardhat node is running...
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Deploying contracts to localhost...
echo.
call npx hardhat run scripts/deploy.js --network localhost

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy the contract addresses above
echo 2. Update .env.local with those addresses
echo 3. Add Localhost network to MetaMask:
echo    - Network Name: Localhost 8545
echo    - RPC URL: http://127.0.0.1:8545
echo    - Chain ID: 31337
echo    - Currency: ETH
echo.
echo 4. Import test account to MetaMask:
echo    Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo.
echo 5. Restart dev server: npm run dev
echo.
echo Press any key to exit...
pause >nul
