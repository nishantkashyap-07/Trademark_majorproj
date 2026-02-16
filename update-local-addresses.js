const fs = require('fs');
const path = require('path');

// Default local addresses (these are deterministic for Hardhat)
const LOCAL_ADDRESSES = {
  TRADEMARK_NFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MARKETPLACE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
};

function updateEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update contract addresses
    envContent = envContent.replace(
      /NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=${LOCAL_ADDRESSES.TRADEMARK_NFT}`
    );
    
    envContent = envContent.replace(
      /NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${LOCAL_ADDRESSES.MARKETPLACE}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env.local updated with local contract addresses!');
    console.log('');
    console.log('Contract Addresses:');
    console.log('TrademarkNFT:', LOCAL_ADDRESSES.TRADEMARK_NFT);
    console.log('Marketplace:', LOCAL_ADDRESSES.MARKETPLACE);
    console.log('');
    console.log('Next step: Restart your dev server (npm run dev)');
    
  } catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
    process.exit(1);
  }
}

updateEnvFile();
