#!/bin/bash

# TrademarkChain Demo Setup Script
# This script helps you quickly set up the demo environment

echo "🚀 TrademarkChain Demo Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Please edit .env.local with your configuration"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile
if [ $? -eq 0 ]; then
    echo "✅ Contracts compiled successfully"
else
    echo "❌ Contract compilation failed"
    exit 1
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed"
fi
echo ""

echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Get test MATIC from faucet"
echo "2. Deploy contracts: npm run deploy"
echo "3. Update contract addresses in .env.local"
echo "4. Start dev server: npm run dev"
echo ""
echo "📖 See DEMO_DEPLOYMENT_GUIDE.md for detailed instructions"
