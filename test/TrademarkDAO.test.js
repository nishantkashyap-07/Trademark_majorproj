const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TrademarkDAO", function () {
  let dao;
  let owner, voter1, voter2, complainant, defendant;

  beforeEach(async function () {
    [owner, voter1, voter2, complainant, defendant] = await ethers.getSigners();

    const TrademarkDAO = await ethers.getContractFactory("TrademarkDAO");
    dao = await TrademarkDAO.deploy();
    await dao.waitForDeployment();

    // Register voters
    await dao.registerVoter(voter1.address, 5);
    await dao.registerVoter(voter2.address, 3);
  });

  describe("Voter Management", function () {
    it("Should register voters correctly", async function () {
      const voter = await dao.getVoter(voter1.address);
      expect(voter.isActive).to.be.true;
      expect(voter.votingPower).to.equal(5);
    });

    it("Should check if address is active voter", async function () {
      expect(await dao.isActiveVoter(voter1.address)).to.be.true;
      expect(await dao.isActiveVoter(defendant.address)).to.be.false;
    });

    it("Should remove voter", async function () {
      await dao.removeVoter(voter1.address);
      expect(await dao.isActiveVoter(voter1.address)).to.be.false;
    });
  });

  describe("Dispute Creation", function () {
    it("Should create dispute successfully", async function () {
      const tx = await dao.connect(complainant).createDispute(
        1, // tokenId
        defendant.address,
        "Trademark infringement",
        "ipfs://evidence-hash"
      );

      await expect(tx)
        .to.emit(dao, "DisputeCreated")
        .withArgs(1, 1, complainant.address, defendant.address, "Trademark infringement");

      const dispute = await dao.getDispute(1);
      expect(dispute.tokenId).to.equal(1);
      expect(dispute.complainant).to.equal(complainant.address);
      expect(dispute.defendant).to.equal(defendant.address);
    });

    it("Should reject dispute against self", async function () {
      await expect(
        dao.connect(complainant).createDispute(
          1,
          complainant.address,
          "Test",
          ""
        )
      ).to.be.revertedWith("Cannot dispute against yourself");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await dao.connect(complainant).createDispute(
        1,
        defendant.address,
        "Trademark infringement",
        "ipfs://evidence"
      );
    });

    it("Should allow voters to vote", async function () {
      await expect(dao.connect(voter1).vote(1, true))
        .to.emit(dao, "VoteCast")
        .withArgs(1, voter1.address, true, 5);

      const dispute = await dao.getDispute(1);
      expect(dispute.votesFor).to.equal(5);
    });

    it("Should prevent double voting", async function () {
      await dao.connect(voter1).vote(1, true);
      await expect(dao.connect(voter1).vote(1, false))
        .to.be.revertedWith("Already voted");
    });

    it("Should prevent parties from voting", async function () {
      await expect(dao.connect(complainant).vote(1, true))
        .to.be.revertedWith("Parties cannot vote");
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      await dao.connect(complainant).createDispute(
        1,
        defendant.address,
        "Trademark infringement",
        "ipfs://evidence"
      );
      await dao.connect(voter1).vote(1, true);
      await dao.connect(voter2).vote(1, false);
    });

    it("Should resolve dispute after voting period", async function () {
      await time.increase(7 * 24 * 60 * 60 + 1); // 7 days + 1 second

      await expect(dao.resolveDispute(1))
        .to.emit(dao, "DisputeResolved")
        .withArgs(1, true, 5, 3);

      const dispute = await dao.getDispute(1);
      expect(dispute.resolved).to.be.true;
      expect(dispute.inFavorOfComplainant).to.be.true;
    });

    it("Should reject resolution before voting ends", async function () {
      await expect(dao.resolveDispute(1))
        .to.be.revertedWith("Voting period not ended");
    });
  });
});
