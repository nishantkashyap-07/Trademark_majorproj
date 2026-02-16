#!/usr/bin/env node
/**
 * Environment Configuration Checker
 * Verifies that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please create .env.local from .env.example\n');
  console.log('Run: cp .env.example .env.local\n');
  process.exit(1);
}

console.log('✅ .env.local file found\n');

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Required variables
const required = {
  firebase: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  blockchain: [
    'POLYGON_RPC_URL',
    'PRIVATE_KEY',
  ],
  optional: [
    'WEB3_STORAGE_TOKEN',
    'PINATA_API_KEY',
    'NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS',
  ],
};

let allGood = true;

// Check Firebase config
console.log('🔥 Firebase Configuration:');
required.firebase.forEach(key => {
  const value = envVars[key];
  if (value && value !== 'your-firebase-api-key' && value !== 'your-project-id' && value !== 'your-project.firebaseapp.com' && value !== 'your-project.appspot.com' && value !== 'your-sender-id' && value !== 'your-app-id') {
    console.log(`  ✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${key}: NOT SET`);
    allGood = false;
  }
});

// Check Blockchain config
console.log('\n⛓️  Blockchain Configuration:');
required.blockchain.forEach(key => {
  const value = envVars[key];
  if (value && value !== 'your-wallet-private-key' && value !== 'https://polygon-mumbai.g.alchemy.com/v2/your-api-key') {
    console.log(`  ✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`  ⚠️  ${key}: NOT SET (optional for demo)`);
  }
});

// Check Optional config
console.log('\n📦 Optional Configuration:');
required.optional.forEach(key => {
  const value = envVars[key];
  if (value && value.length > 0) {
    console.log(`  ✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ⚠️  ${key}: NOT SET (optional)`);
  }
});

console.log('\n' + '='.repeat(60));

if (allGood) {
  console.log('\n✨ All required environment variables are configured!');
  console.log('\n📋 Next Steps:');
  console.log('  1. Run: npx ts-node scripts/seed-database.ts');
  console.log('  2. Run: npm run dev');
  console.log('  3. Open: http://localhost:3000\n');
} else {
  console.log('\n⚠️  Some required variables are missing!');
  console.log('\n📋 To fix:');
  console.log('  1. Create Firebase project at https://console.firebase.google.com');
  console.log('  2. Copy configuration values to .env.local');
  console.log('  3. Run this script again to verify\n');
  console.log('📖 See REAL_DATA_SETUP.md for detailed instructions\n');
  process.exit(1);
}
