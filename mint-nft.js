const { ethers } = require('hardhat');

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Get the contract
  const trademarkNFT = await ethers.getContractAt(
    'TrademarkNFT',
    process.env.NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS
  );
  
  // Check if token exists
  const tokenId = process.argv[2] || 1;
  
  try {
    const owner = await trademarkNFT.ownerOf(tokenId);
    console.log(`✓ Token ${tokenId} already exists, owned by: ${owner}`);
  } catch (err) {
    console.log(`✗ Token ${tokenId} does not exist on blockchain`);
    console.log('\nTo mint it, you need to:');
    console.log('1. Go to the registration page');
    console.log('2. Re-register the trademark');
    console.log('3. Make sure to complete the blockchain transaction');
  }
}

main().catch(console.error).finally(() => process.exit());
