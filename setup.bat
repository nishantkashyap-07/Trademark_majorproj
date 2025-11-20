@echo off
REM TrademarkChain Setup Script for Windows
REM This script automates the initial setup process

echo ========================================
echo TrademarkChain Setup Script
echo ========================================
echo.

REM Check Node.js installation
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detected
node -v

REM Check npm installation
echo.
echo Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)
echo [OK] npm detected
npm -v

REM Install dependencies
echo.
echo Installing dependencies...
echo This may take a few minutes...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo [OK] Dependencies installed successfully
) else (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Check for .env.local file
echo.
echo Checking environment configuration...
if not exist .env.local (
    echo [WARNING] .env.local file not found
    echo Creating from .env.example...
    copy .env.example .env.local
    echo [OK] Created .env.local file
    echo.
    echo [IMPORTANT] You need to configure .env.local with your API keys!
    echo Required configurations:
    echo - POLYGON_RPC_URL (from Alchemy)
    echo - PRIVATE_KEY (from MetaMask)
    echo - WEB3_STORAGE_TOKEN (optional, for IPFS)
    echo - Firebase credentials (optional, for backend)
    echo.
    echo See SETUP_GUIDE.md for detailed instructions.
) else (
    echo [OK] .env.local file exists
)

REM Compile smart contracts
echo.
echo Compiling smart contracts...
call npm run compile

if %ERRORLEVEL% EQU 0 (
    echo [OK] Smart contracts compiled successfully
) else (
    echo [WARNING] Smart contract compilation failed
    echo This is normal if you haven't configured blockchain settings yet.
)

REM Final instructions
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Configure .env.local with your API keys
echo    See SETUP_GUIDE.md for detailed instructions
echo.
echo 2. Get test MATIC from faucet:
echo    https://faucet.polygon.technology/
echo.
echo 3. Deploy smart contracts:
echo    npm run deploy
echo.
echo 4. Start development server:
echo    npm run dev
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo Documentation:
echo    - SETUP_GUIDE.md - Complete setup instructions
echo    - LICENSING_QUICK_START.md - Licensing features guide
echo    - README.md - Project overview
echo.
echo Need help? Check SETUP_GUIDE.md troubleshooting section
echo.
pause
