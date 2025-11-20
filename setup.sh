#!/bin/bash

# TrademarkChain Setup Script
# This script automates the initial setup process

echo "🚀 TrademarkChain Setup Script"
echo "================================"
echo ""

# Check Node.js installation
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version is $NODE_VERSION. Version 18+ is recommended."
else
    echo "✅ Node.js $(node -v) detected"
fi

# Check npm installation
echo ""
echo "📦 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
echo "   This may take a few minutes..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check for .env.local file
echo ""
echo "🔐 Checking environment configuration..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found"
    echo "   Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local file"
    echo ""
    echo "⚠️  IMPORTANT: You need to configure .env.local with your API keys!"
    echo "   Required configurations:"
    echo "   - POLYGON_RPC_URL (from Alchemy)"
    echo "   - PRIVATE_KEY (from MetaMask)"
    echo "   - WEB3_STORAGE_TOKEN (optional, for IPFS)"
    echo "   - Firebase credentials (optional, for backend)"
    echo ""
    echo "   See SETUP_GUIDE.md for detailed instructions."
else
    echo "✅ .env.local file exists"
fi

# Compile smart contracts
echo ""
echo "🔨 Compiling smart contracts..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully"
else
    echo "⚠️  Smart contract compilation failed"
    echo "   This is normal if you haven't configured blockchain settings yet."
fi

# Check if contracts are deployed
echo ""
echo "⛓️  Checking contract deployment..."
if grep -q "NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=" .env.local && \
   ! grep -q "NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=$" .env.local; then
    echo "✅ Contract addresses found in .env.local"
else
    echo "⚠️  Contract addresses not configured"
    echo "   You need to:"
    echo "   1. Get test MATIC from: https://faucet.polygon.technology/"
    echo "   2. Run: npm run deploy"
    echo "   3. Update contract addresses in .env.local"
fi

# Final instructions
echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure .env.local with your API keys"
echo "   See SETUP_GUIDE.md for detailed instructions"
echo ""
echo "2. Get test MATIC from faucet:"
echo "   https://faucet.polygon.technology/"
echo ""
echo "3. Deploy smart contracts:"
echo "   npm run deploy"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - SETUP_GUIDE.md - Complete setup instructions"
echo "   - LICENSING_QUICK_START.md - Licensing features guide"
echo "   - README.md - Project overview"
echo ""
echo "🆘 Need help? Check SETUP_GUIDE.md troubleshooting section"
echo ""
