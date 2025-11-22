// Test script to verify Pinata configuration
require('dotenv').config({ path: '.env.local' });

async function testPinataConnection() {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.error('❌ Pinata credentials not found in .env.local');
    process.exit(1);
  }

  console.log('🔍 Testing Pinata connection...');

  try {
    // Test authentication by checking account info
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pinata connection successful!');
      console.log('📊 Account info:', data);
    } else {
      const error = await response.json();
      console.error('❌ Pinata authentication failed:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error connecting to Pinata:', error.message);
    process.exit(1);
  }
}

testPinataConnection();
