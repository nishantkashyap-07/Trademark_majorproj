const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrademarkNFT", function () {
  let trademarkNFT;
  let owner, addr1, addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const TrademarkNFT = await ethers.getContractFactory("TrademarkNFT");
    trademarkNFT = await TrademarkNFT.deploy();
    await trademarkNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await trademarkNFT.name()).to.equal("TrademarkNFT");
      expect(await trademarkNFT.symbol()).to.equal("TMNFT");
    });
    
    it("Should set the correct owner", async function () {
      expect(await trademarkNFT.owner()).to.equal(owner.address);
    });
  });
  
  describe("Trademark Registration", function () {
    const sampleTrademark = {
      companyName: "Test Company",
      trademarkName: "Test Brand",
      registrationNumber: "TM123456",
      ipfsHash: "QmTestHash123",
      category: "Technology",
      royaltyBps: 1000, // 10%
      tokenURI: "https://ipfs.io/ipfs/QmTestMetadata"
    };
    
    it("Should register a trademark successfully", async function () {
      const tx = await trademarkNFT.connect(addr1).registerTrademark(
        sampleTrademark.companyName,
        sampleTrademark.trademarkName,
        sampleTrademark.registrationNumber,
        sampleTrademark.ipfsHash,
        sampleTrademark.category,
        sampleTrademark.royaltyBps,
        sampleTrademark.tokenURI
      );
      
      await expect(tx)
        .to.emit(trademarkNFT, "TrademarkRegistered")
        .withArgs(
          1,
          addr1.address,
          sampleTrademark.companyName,
          sampleTrademark.trademarkName,
          sampleTrademark.registrationNumber,
          sampleTrademark.ipfsHash,
          sampleTrademark.category,
          sampleTrademark.royaltyBps
        );
      
      // Check ownership
      expect(await trademarkNFT.ownerOf(1)).to.equal(addr1.address);
      
      // Check trademark data
      const trademark = await trademarkNFT.getTrademarkInfo(1);
      expect(trademark.companyName).to.equal(sampleTrademark.companyName);
      expect(trademark.sloganText).to.equal(sampleTrademark.trademarkName);
      expect(trademark.registrationNumber).to.equal(sampleTrademark.registrationNumber);
      expect(trademark.creator).to.equal(addr1.address);
      expect(trademark.verified).to.equal(false);
    });
    
    it("Should prevent duplicate registration numbers", async function () {
      // Register first trademark
      await trademarkNFT.connect(addr1).registerTrademark(
        sampleTrademark.companyName,
        sampleTrademark.trademarkName,
        sampleTrademark.registrationNumber,
        sampleTrademark.ipfsHash,
        sampleTrademark.category,
        sampleTrademark.royaltyBps,
        sampleTrademark.tokenURI
      );
      
      // Try to register with same registration number
      await expect(
        trademarkNFT.connect(addr2).registerTrademark(
          "Another Company",
          "Another Brand",
          sampleTrademark.registrationNumber, // Same registration number
          "QmAnotherHash",
          "Fashion",
          500,
          "https://ipfs.io/ipfs/QmAnotherMetadata"
        )
      ).to.be.revertedWith("Registration number already exists");
    });
    
    it("Should validate royalty percentage", async function () {
      // Test maximum royalty (contract only checks max, not min)
      await expect(
        trademarkNFT.connect(addr1).registerTrademark(
          sampleTrademark.companyName,
          sampleTrademark.trademarkName,
          "TM123458",
          sampleTrademark.ipfsHash,
          sampleTrademark.category,
          3000, // Above maximum (2500)
          sampleTrademark.tokenURI
        )
      ).to.be.revertedWith("Royalty cannot exceed 25%");
      
      // Test valid royalty at boundary
      await expect(
        trademarkNFT.connect(addr1).registerTrademark(
          sampleTrademark.companyName,
          sampleTrademark.trademarkName,
          "TM123457",
          sampleTrademark.ipfsHash,
          sampleTrademark.category,
          2500, // Exactly 25% (should pass)
          sampleTrademark.tokenURI
        )
      ).to.not.be.reverted;
    });
    
    it("Should validate required fields", async function () {
      await expect(
        trademarkNFT.connect(addr1).registerTrademark(
          "", // Empty company name
          sampleTrademark.trademarkName,
          "TM999999",
          sampleTrademark.ipfsHash,
          sampleTrademark.category,
          sampleTrademark.royaltyBps,
          sampleTrademark.tokenURI
        )
      ).to.be.revertedWith("Company name required");
    });
  });
  
  describe("Trademark Verification", function () {
    beforeEach(async function () {
      await trademarkNFT.connect(addr1).registerTrademark(
        "Test Company",
        "Test Brand",
        "TM123456",
        "QmTestHash123",
        "Technology",
        1000,
        "https://ipfs.io/ipfs/QmTestMetadata"
      );
    });
    
    it("Should allow owner to verify trademark", async function () {
      await expect(trademarkNFT.verifyTrademark(1))
        .to.emit(trademarkNFT, "TrademarkVerified")
        .withArgs(1, owner.address);
      
      const trademark = await trademarkNFT.getTrademarkInfo(1);
      expect(trademark.verified).to.equal(true);
    });
    
    it("Should prevent non-owner from verifying", async function () {
      await expect(
        trademarkNFT.connect(addr1).verifyTrademark(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Should prevent double verification", async function () {
      await trademarkNFT.verifyTrademark(1);
      
      await expect(
        trademarkNFT.verifyTrademark(1)
      ).to.be.revertedWith("Already verified");
    });
  });
  
  describe("Royalty Information", function () {
    beforeEach(async function () {
      await trademarkNFT.connect(addr1).registerTrademark(
        "Test Company",
        "Test Brand",
        "TM123456",
        "QmTestHash123",
        "Technology",
        1000, // 10%
        "https://ipfs.io/ipfs/QmTestMetadata"
      );
    });
    
    it("Should return correct royalty information", async function () {
      const salePrice = ethers.parseEther("1"); // 1 MATIC
      const [receiver, royaltyAmount] = await trademarkNFT.royaltyInfo(1, salePrice);
      
      expect(receiver).to.equal(addr1.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.1")); // 10% of 1 MATIC
    });
  });
  
  describe("Utility Functions", function () {
    beforeEach(async function () {
      await trademarkNFT.connect(addr1).registerTrademark(
        "Test Company",
        "Test Brand",
        "TM123456",
        "QmTestHash123",
        "Technology",
        1000,
        "https://ipfs.io/ipfs/QmTestMetadata"
      );
    });
    
    it("Should find trademark by registration number", async function () {
      const tokenId = await trademarkNFT.getTokenIdByRegistration("TM123456");
      expect(tokenId).to.equal(1);
    });
    
    it("Should return total supply", async function () {
      const total = await trademarkNFT.totalSupply();
      expect(total).to.equal(1);
      
      // Register another trademark
      await trademarkNFT.connect(addr2).registerTrademark(
        "Another Company",
        "Another Brand",
        "TM789012",
        "QmAnotherHash",
        "Fashion",
        1500,
        "https://ipfs.io/ipfs/QmAnotherMetadata"
      );
      
      const newTotal = await trademarkNFT.totalSupply();
      expect(newTotal).to.equal(2);
    });
    
    it("Should check if registration number is used", async function () {
      expect(await trademarkNFT.isRegistrationNumberUsed("TM123456")).to.equal(true);
      expect(await trademarkNFT.isRegistrationNumberUsed("TM999999")).to.equal(false);
    });
  });
});