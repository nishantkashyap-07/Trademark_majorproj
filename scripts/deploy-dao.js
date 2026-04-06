const hre = require("hardhat");

async function main() {
  console.log("Deploying TrademarkDAO contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Deploy TrademarkDAO
  const TrademarkDAO = await hre.ethers.getContractFactory("TrademarkDAO");
  const dao = await TrademarkDAO.deploy();
  await dao.waitForDeployment();

  const daoAddress = await dao.getAddress();
  console.log("TrademarkDAO deployed to:", daoAddress);

  // Register some initial voters (optional)
  console.log("\nRegistering initial voters...");
  
  // You can add more voters here
  // await dao.registerVoter("0xVoterAddress", 5);
  
  console.log("\n=== Deployment Summary ===");
  console.log("TrademarkDAO Address:", daoAddress);
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=${daoAddress}`);
  
  console.log("\n=== Verification Command ===");
  console.log(`npx hardhat verify --network polygon ${daoAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
