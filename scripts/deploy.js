const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");
  
  // Deploy TrademarkNFT contract
  console.log("\nDeploying TrademarkNFT contract...");
  const TrademarkNFT = await ethers.getContractFactory("TrademarkNFT");
  const trademarkNFT = await TrademarkNFT.deploy();
  await trademarkNFT.waitForDeployment();
  
  const trademarkNFTAddress = await trademarkNFT.getAddress();
  console.log("TrademarkNFT deployed to:", trademarkNFTAddress);
  
  // Deploy TrademarkMarketplace contract
  console.log("\nDeploying TrademarkMarketplace contract...");
  const TrademarkMarketplace = await ethers.getContractFactory("TrademarkMarketplace");
  const marketplace = await TrademarkMarketplace.deploy(trademarkNFTAddress);
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("TrademarkMarketplace deployed to:", marketplaceAddress);
  
  // Verify deployment
  console.log("\nVerifying deployment...");
  const nftName = await trademarkNFT.name();
  const nftSymbol = await trademarkNFT.symbol();
  const marketplaceFee = await marketplace.marketplaceFee();
  
  console.log("NFT Contract Name:", nftName);
  console.log("NFT Contract Symbol:", nftSymbol);
  console.log("Marketplace Fee:", marketplaceFee.toString(), "basis points");
  
  // Save deployment info
  const deploymentInfo = {
    network: "polygon-mumbai",
    trademarkNFT: trademarkNFTAddress,
    marketplace: marketplaceAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber()
  };
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Contract Addresses:");
  console.log("TrademarkNFT:", trademarkNFTAddress);
  console.log("TrademarkMarketplace:", marketplaceAddress);
  console.log("\nAdd these to your .env file:");
  console.log(`NEXT_PUBLIC_TRADEMARK_CONTRACT_ADDRESS=${trademarkNFTAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=${marketplaceAddress}`);
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });