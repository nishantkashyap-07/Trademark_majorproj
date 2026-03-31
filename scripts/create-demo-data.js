// Demo Data Creation Script
// Run this after deploying contracts to create sample data

const { ethers } = require('hardhat');

async function main() {
  console.log('🎬 Creating Demo Data for Presentation...\n');

  // Get contract addresses from environment
  const TRADEMARK_NFT_ADDRESS = process.env.NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS;
  const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;

  if (!TRADEMARK_NFT_ADDRESS || !MARKETPLACE_ADDRESS) {
    console.error('❌ Contract addresses not found in environment variables!');
    console.log('Please update your .env.local file with deployed contract addresses.');
    process.exit(1);
  }

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log('📝 Using account:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'MATIC\n');

  if (balance < ethers.parseEther('0.5')) {
    console.error('❌ Insufficient balance! Need at least 0.5 MATIC');
    console.log('Get test MATIC from: https://faucet.polygon.technology/');
    process.exit(1);
  }

  // Get contract instances
  const TrademarkNFT = await ethers.getContractFactory('TrademarkNFT');
  const trademarkNFT = TrademarkNFT.attach(TRADEMARK_NFT_ADDRESS);

  const TrademarkMarketplace = await ethers.getContractFactory('TrademarkMarketplace');
  const marketplace = TrademarkMarketplace.attach(MARKETPLACE_ADDRESS);

  console.log('📄 Contracts loaded:');
  console.log('   NFT:', TRADEMARK_NFT_ADDRESS);
  console.log('   Marketplace:', MARKETPLACE_ADDRESS);
  console.log('');

  // Demo trademarks data
  const demoTrademarks = [
    {
      ipfsHash: 'QmDemo1TechCorp',
      category: 'Technology',
      royaltyBps: 500, // 5%
      name: 'TechCorp - Innovation Starts Here'
    },
    {
      ipfsHash: 'QmDemo2StyleHub',
      category: 'Fashion',
      royaltyBps: 1000, // 10%
      name: 'StyleHub - Wear Your Confidence'
    },
    {
      ipfsHash: 'QmDemo3FreshBite',
      category: 'Food & Beverage',
      royaltyBps: 700, // 7%
      name: 'FreshBite - Taste the Freshness'
    }
  ];

  console.log('🎨 Minting Demo Trademarks...\n');

  const mintedTokens = [];

  for (let i = 0; i < demoTrademarks.length; i++) {
    const trademark = demoTrademarks[i];
    console.log(`${i + 1}. Minting: ${trademark.name}`);
    
    try {
      const tx = await trademarkNFT.mint(
        deployer.address,
        trademark.ipfsHash,
        trademark.category,
        trademark.royaltyBps
      );
      
      console.log('   ⏳ Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      // Get token ID from event
      const event = receipt.logs.find(log => {
        try {
          return trademarkNFT.interface.parseLog(log).name === 'TrademarkMinted';
        } catch {
          return false;
        }
      });
      
      const tokenId = event ? trademarkNFT.interface.parseLog(event).args.tokenId : i + 1;
      mintedTokens.push(tokenId);
      
      console.log('   ✅ Minted! Token ID:', tokenId.toString());
      console.log('   🔗 View on PolygonScan:');
      console.log(`      https://mumbai.polygonscan.com/tx/${tx.hash}\n`);
      
      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log('   Trademarks Minted:', mintedTokens.length);
  console.log('   Token IDs:', mintedTokens.map(id => id.toString()).join(', '));
  console.log('');

  // Create marketplace listings
  if (mintedTokens.length > 0) {
    console.log('🏪 Creating Marketplace Listings...\n');

    // Approve marketplace to handle NFTs
    console.log('1. Approving marketplace...');
    const approveTx = await trademarkNFT.setApprovalForAll(MARKETPLACE_ADDRESS, true);
    await approveTx.wait();
    console.log('   ✅ Marketplace approved\n');

    // Create a sale listing
    if (mintedTokens[0]) {
      console.log('2. Creating SALE listing for Token', mintedTokens[0].toString());
      try {
        const listingTx = await marketplace.createListing(
          mintedTokens[0],
          ethers.parseEther('0.1'), // 0.1 MATIC
          false, // Not a license, it's a sale
          0, // No duration for sales
          0 // No expiration
        );
        await listingTx.wait();
        console.log('   ✅ Sale listing created!');
        console.log('   💰 Price: 0.1 MATIC');
        console.log(`   🔗 https://mumbai.polygonscan.com/tx/${listingTx.hash}\n`);
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }
    }

    // Create a license listing (30 days)
    if (mintedTokens[1]) {
      console.log('3. Creating LICENSE listing for Token', mintedTokens[1].toString());
      try {
        const listingTx = await marketplace.createListing(
          mintedTokens[1],
          ethers.parseEther('0.05'), // 0.05 MATIC
          true, // This is a license
          30 * 24 * 60 * 60, // 30 days in seconds
          0 // No expiration
        );
        await listingTx.wait();
        console.log('   ✅ License listing created!');
        console.log('   💰 Price: 0.05 MATIC');
        console.log('   ⏱️  Duration: 30 days');
        console.log(`   🔗 https://mumbai.polygonscan.com/tx/${listingTx.hash}\n`);
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }
    }

    // Create a perpetual license listing
    if (mintedTokens[2]) {
      console.log('4. Creating PERPETUAL LICENSE for Token', mintedTokens[2].toString());
      try {
        const listingTx = await marketplace.createListing(
          mintedTokens[2],
          ethers.parseEther('0.08'), // 0.08 MATIC
          true, // This is a license
          0, // 0 = perpetual
          0 // No expiration
        );
        await listingTx.wait();
        console.log('   ✅ Perpetual license listing created!');
        console.log('   💰 Price: 0.08 MATIC');
        console.log('   ⏱️  Duration: Perpetual');
        console.log(`   🔗 https://mumbai.polygonscan.com/tx/${listingTx.hash}\n`);
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }
    }
  }

  console.log('\n✅ Demo Data Creation Complete!\n');
  console.log('📋 Next Steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Connect your wallet');
  console.log('3. View your trademarks in Dashboard');
  console.log('4. Check Marketplace for listings');
  console.log('5. Practice your demo presentation!');
  console.log('');
  console.log('🔗 View contracts on PolygonScan:');
  console.log(`   NFT: https://mumbai.polygonscan.com/address/${TRADEMARK_NFT_ADDRESS}`);
  console.log(`   Marketplace: https://mumbai.polygonscan.com/address/${MARKETPLACE_ADDRESS}`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
