// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TrademarkDAO
 * @dev Decentralized Autonomous Organization for trademark dispute resolution
 */
contract TrademarkDAO is Ownable, ReentrancyGuard {
    
    // Dispute status enum
    enum DisputeStatus {
        Pending,
        Voting,
        Resolved,
        Rejected
    }
    
    // Dispute structure
    struct Dispute {
        uint256 disputeId;
        uint256 tokenId;
        address complainant;
        address defendant;
        string reason;
        string evidence; // IPFS hash
        DisputeStatus status;
        uint256 createdAt;
        uint256 votingEndsAt;
        uint256 votesFor;
        uint256 votesAgainst;
        bool resolved;
        bool inFavorOfComplainant;
    }
    
    // Voter structure
    struct Voter {
        address voterAddress;
        uint256 votingPower;
        bool isActive;
        uint256 registeredAt;
    }
    
    // Mappings
    mapping(uint256 => Dispute) public disputes;
    mapping(address => Voter) public voters;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteChoice; // true = for, false = against
    
    uint256 public disputeCounter;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_VOTING_POWER = 1;
    uint256 public quorumPercentage = 30; // 30% of total voting power needed
    
    address[] public voterAddresses;
    
    // Events
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed tokenId,
        address indexed complainant,
        address defendant,
        string reason
    );
    
    event VoteCast(
        uint256 indexed disputeId,
        address indexed voter,
        bool inFavor,
        uint256 votingPower
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        bool inFavorOfComplainant,
        uint256 votesFor,
        uint256 votesAgainst
    );
    
    event VoterRegistered(address indexed voter, uint256 votingPower);
    event VoterRemoved(address indexed voter);
    event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);
    
    constructor() {
        // Register contract owner as first voter with high voting power
        voters[msg.sender] = Voter({
            voterAddress: msg.sender,
            votingPower: 10,
            isActive: true,
            registeredAt: block.timestamp
        });
        voterAddresses.push(msg.sender);
    }
    
    /**
     * @dev Create a new dispute
     * @param tokenId The trademark token ID in dispute
     * @param defendant The address being disputed against
     * @param reason Reason for the dispute
     * @param evidence IPFS hash of evidence
     * @return disputeId The ID of the created dispute
     */
    function createDispute(
        uint256 tokenId,
        address defendant,
        string memory reason,
        string memory evidence
    ) external returns (uint256) {
        require(defendant != address(0), "Invalid defendant address");
        require(defendant != msg.sender, "Cannot dispute against yourself");
        require(bytes(reason).length > 0, "Reason required");
        
        disputeCounter++;
        uint256 disputeId = disputeCounter;
        
        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            tokenId: tokenId,
            complainant: msg.sender,
            defendant: defendant,
            reason: reason,
            evidence: evidence,
            status: DisputeStatus.Voting,
            createdAt: block.timestamp,
            votingEndsAt: block.timestamp + VOTING_PERIOD,
            votesFor: 0,
            votesAgainst: 0,
            resolved: false,
            inFavorOfComplainant: false
        });
        
        emit DisputeCreated(disputeId, tokenId, msg.sender, defendant, reason);
        
        return disputeId;
    }
    
    /**
     * @dev Cast a vote on a dispute
     * @param disputeId The dispute ID
     * @param inFavor True to vote in favor of complainant, false for defendant
     */
    function vote(uint256 disputeId, bool inFavor) external nonReentrant {
        Dispute storage dispute = disputes[disputeId];
        Voter storage voter = voters[msg.sender];
        
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(dispute.status == DisputeStatus.Voting, "Dispute not in voting phase");
        require(block.timestamp < dispute.votingEndsAt, "Voting period ended");
        require(voter.isActive, "Not a registered voter");
        require(voter.votingPower >= MIN_VOTING_POWER, "Insufficient voting power");
        require(!hasVoted[disputeId][msg.sender], "Already voted");
        require(msg.sender != dispute.complainant && msg.sender != dispute.defendant, "Parties cannot vote");
        
        hasVoted[disputeId][msg.sender] = true;
        voteChoice[disputeId][msg.sender] = inFavor;
        
        if (inFavor) {
            dispute.votesFor += voter.votingPower;
        } else {
            dispute.votesAgainst += voter.votingPower;
        }
        
        emit VoteCast(disputeId, msg.sender, inFavor, voter.votingPower);
    }
    
    /**
     * @dev Resolve a dispute after voting period
     * @param disputeId The dispute ID to resolve
     */
    function resolveDispute(uint256 disputeId) external nonReentrant {
        Dispute storage dispute = disputes[disputeId];
        
        require(dispute.disputeId != 0, "Dispute does not exist");
        require(dispute.status == DisputeStatus.Voting, "Dispute not in voting phase");
        require(block.timestamp >= dispute.votingEndsAt, "Voting period not ended");
        require(!dispute.resolved, "Dispute already resolved");
        
        uint256 totalVotes = dispute.votesFor + dispute.votesAgainst;
        uint256 totalVotingPower = getTotalVotingPower();
        uint256 quorumRequired = (totalVotingPower * quorumPercentage) / 100;
        
        // Check if quorum is met
        if (totalVotes < quorumRequired) {
            dispute.status = DisputeStatus.Rejected;
            dispute.resolved = true;
            emit DisputeResolved(disputeId, false, dispute.votesFor, dispute.votesAgainst);
            return;
        }
        
        // Determine outcome
        dispute.inFavorOfComplainant = dispute.votesFor > dispute.votesAgainst;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolved = true;
        
        emit DisputeResolved(disputeId, dispute.inFavorOfComplainant, dispute.votesFor, dispute.votesAgainst);
    }
    
    /**
     * @dev Register a new voter (only owner)
     * @param voterAddress Address of the voter
     * @param votingPower Voting power to assign
     */
    function registerVoter(address voterAddress, uint256 votingPower) external onlyOwner {
        require(voterAddress != address(0), "Invalid address");
        require(votingPower >= MIN_VOTING_POWER, "Voting power too low");
        require(!voters[voterAddress].isActive, "Voter already registered");
        
        voters[voterAddress] = Voter({
            voterAddress: voterAddress,
            votingPower: votingPower,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        voterAddresses.push(voterAddress);
        
        emit VoterRegistered(voterAddress, votingPower);
    }
    
    /**
     * @dev Remove a voter (only owner)
     * @param voterAddress Address of the voter to remove
     */
    function removeVoter(address voterAddress) external onlyOwner {
        require(voters[voterAddress].isActive, "Voter not active");
        
        voters[voterAddress].isActive = false;
        
        emit VoterRemoved(voterAddress);
    }
    
    /**
     * @dev Update quorum percentage (only owner)
     * @param newQuorum New quorum percentage (0-100)
     */
    function updateQuorum(uint256 newQuorum) external onlyOwner {
        require(newQuorum > 0 && newQuorum <= 100, "Invalid quorum percentage");
        
        uint256 oldQuorum = quorumPercentage;
        quorumPercentage = newQuorum;
        
        emit QuorumUpdated(oldQuorum, newQuorum);
    }
    
    /**
     * @dev Get total voting power of all active voters
     * @return Total voting power
     */
    function getTotalVotingPower() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < voterAddresses.length; i++) {
            address voterAddr = voterAddresses[i];
            if (voters[voterAddr].isActive) {
                total += voters[voterAddr].votingPower;
            }
        }
        return total;
    }
    
    /**
     * @dev Get dispute details
     * @param disputeId The dispute ID
     * @return Dispute struct
     */
    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        require(disputes[disputeId].disputeId != 0, "Dispute does not exist");
        return disputes[disputeId];
    }
    
    /**
     * @dev Check if address is an active voter
     * @param voterAddress Address to check
     * @return bool indicating if address is active voter
     */
    function isActiveVoter(address voterAddress) external view returns (bool) {
        return voters[voterAddress].isActive;
    }
    
    /**
     * @dev Get voter information
     * @param voterAddress Address of the voter
     * @return Voter struct
     */
    function getVoter(address voterAddress) external view returns (Voter memory) {
        return voters[voterAddress];
    }
    
    /**
     * @dev Get total number of disputes
     * @return Total dispute count
     */
    function getTotalDisputes() external view returns (uint256) {
        return disputeCounter;
    }
    
    /**
     * @dev Get number of active voters
     * @return Count of active voters
     */
    function getActiveVoterCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < voterAddresses.length; i++) {
            if (voters[voterAddresses[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}
