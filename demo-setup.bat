@echo off
REM TrademarkChain Demo Setup Script for Windows
REM This script helps you quickly set up the demo environment

echo ========================================
echo TrademarkChain Demo Setup
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [ERROR] .env.local not found!
    echo [INFO] Creating .env.local from .env.example...
    copy .env.example .env.local
    echo [SUCCESS] Please edit .env.local with your configuration
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Environment file found
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed
echo.

REM Compile contracts
echo [INFO] Compiling smart contracts...
call npm run compile
if %errorlevel% neq 0 (
    echo [ERROR] Contract compilation failed
    pause
    exit /b 1
)
echo [SUCCESS] Contracts compiled successfully
echo.

REM Run tests
echo [INFO] Running tests...
call npm test
if %errorlevel% neq 0 (
    echo [WARNING] Some tests failed
) else (
    echo [SUCCESS] All tests passed
)
echo.

echo ========================================
echo [SUCCESS] Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get test MATIC from faucet
echo 2. Deploy contracts: npm run deploy
echo 3. Update contract addresses in .env.local
echo 4. Start dev server: npm run dev
echo.
echo See DEMO_DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause
