const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Testing blockchain connection...");
  console.log("RPC URL:", process.env.POLYGON_RPC_URL);
  console.log("Private Key exists:", !!process.env.PRIVATE_KEY);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "MATIC");
    
    const network = await deployer.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
  } catch (error) {
    console.error("Connection test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
