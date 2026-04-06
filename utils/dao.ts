/**
 * DAO (Decentralized Autonomous Organization) utilities
 * For trademark dispute resolution
 */

import { ethers } from 'ethers';

const DAO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS || '';

// DAO Contract ABI (minimal interface)
const DAO_ABI = [
  'function createDispute(uint256 tokenId, address defendant, string reason, string evidence) returns (uint256)',
  'function vote(uint256 disputeId, bool inFavor)',
  'function resolveDispute(uint256 disputeId)',
  'function getDispute(uint256 disputeId) view returns (tuple(uint256 disputeId, uint256 tokenId, address complainant, address defendant, string reason, string evidence, uint8 status, uint256 createdAt, uint256 votingEndsAt, uint256 votesFor, uint256 votesAgainst, bool resolved, bool inFavorOfComplainant))',
  'function isActiveVoter(address voterAddress) view returns (bool)',
  'function getTotalDisputes() view returns (uint256)',
  'function hasVoted(uint256 disputeId, address voter) view returns (bool)',
  'event DisputeCreated(uint256 indexed disputeId, uint256 indexed tokenId, address indexed complainant, address defendant, string reason)',
  'event VoteCast(uint256 indexed disputeId, address indexed voter, bool inFavor, uint256 votingPower)',
  'event DisputeResolved(uint256 indexed disputeId, bool inFavorOfComplainant, uint256 votesFor, uint256 votesAgainst)',
];

export interface Dispute {
  disputeId: number;
  tokenId: number;
  complainant: string;
  defendant: string;
  reason: string;
  evidence: string;
  status: DisputeStatus;
  createdAt: number;
  votingEndsAt: number;
  votesFor: number;
  votesAgainst: number;
  resolved: boolean;
  inFavorOfComplainant: boolean;
}

export enum DisputeStatus {
  Pending = 0,
  Voting = 1,
  Resolved = 2,
  Rejected = 3,
}

/**
 * Get DAO contract instance
 */
export function getDAOContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!DAO_CONTRACT_ADDRESS) {
    throw new Error('DAO contract address not configured');
  }
  return new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signerOrProvider);
}

/**
 * Create a new dispute
 */
export async function createDispute(
  signer: ethers.Signer,
  tokenId: number,
  defendant: string,
  reason: string,
  evidenceIpfsHash: string
): Promise<{ disputeId: number; txHash: string }> {
  try {
    const contract = getDAOContract(signer);
    
    const tx = await contract.createDispute(
      tokenId,
      defendant,
      reason,
      evidenceIpfsHash
    );
    
    const receipt = await tx.wait();
    
    // Extract dispute ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'DisputeCreated';
      } catch {
        return false;
      }
    });
    
    let disputeId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      disputeId = Number(parsed?.args?.disputeId || 0);
    }
    
    return {
      disputeId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Error creating dispute:', error);
    throw new Error(error.message || 'Failed to create dispute');
  }
}

/**
 * Vote on a dispute
 */
export async function voteOnDispute(
  signer: ethers.Signer,
  disputeId: number,
  inFavor: boolean
): Promise<string> {
  try {
    const contract = getDAOContract(signer);
    
    const tx = await contract.vote(disputeId, inFavor);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error voting on dispute:', error);
    throw new Error(error.message || 'Failed to vote on dispute');
  }
}

/**
 * Resolve a dispute after voting period
 */
export async function resolveDispute(
  signer: ethers.Signer,
  disputeId: number
): Promise<string> {
  try {
    const contract = getDAOContract(signer);
    
    const tx = await contract.resolveDispute(disputeId);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    throw new Error(error.message || 'Failed to resolve dispute');
  }
}

/**
 * Get dispute details
 */
export async function getDisputeDetails(
  provider: ethers.Provider,
  disputeId: number
): Promise<Dispute> {
  try {
    const contract = getDAOContract(provider);
    
    const dispute = await contract.getDispute(disputeId);
    
    return {
      disputeId: Number(dispute.disputeId),
      tokenId: Number(dispute.tokenId),
      complainant: dispute.complainant,
      defendant: dispute.defendant,
      reason: dispute.reason,
      evidence: dispute.evidence,
      status: dispute.status,
      createdAt: Number(dispute.createdAt),
      votingEndsAt: Number(dispute.votingEndsAt),
      votesFor: Number(dispute.votesFor),
      votesAgainst: Number(dispute.votesAgainst),
      resolved: dispute.resolved,
      inFavorOfComplainant: dispute.inFavorOfComplainant,
    };
  } catch (error: any) {
    console.error('Error getting dispute details:', error);
    throw new Error(error.message || 'Failed to get dispute details');
  }
}

/**
 * Check if address is an active voter
 */
export async function isVoter(
  provider: ethers.Provider,
  address: string
): Promise<boolean> {
  try {
    const contract = getDAOContract(provider);
    return await contract.isActiveVoter(address);
  } catch (error) {
    console.error('Error checking voter status:', error);
    return false;
  }
}

/**
 * Check if user has voted on a dispute
 */
export async function hasUserVoted(
  provider: ethers.Provider,
  disputeId: number,
  userAddress: string
): Promise<boolean> {
  try {
    const contract = getDAOContract(provider);
    return await contract.hasVoted(disputeId, userAddress);
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

/**
 * Get total number of disputes
 */
export async function getTotalDisputes(provider: ethers.Provider): Promise<number> {
  try {
    const contract = getDAOContract(provider);
    const total = await contract.getTotalDisputes();
    return Number(total);
  } catch (error) {
    console.error('Error getting total disputes:', error);
    return 0;
  }
}

/**
 * Format dispute status for display
 */
export function formatDisputeStatus(status: DisputeStatus): string {
  switch (status) {
    case DisputeStatus.Pending:
      return 'Pending';
    case DisputeStatus.Voting:
      return 'Voting';
    case DisputeStatus.Resolved:
      return 'Resolved';
    case DisputeStatus.Rejected:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate time remaining for voting
 */
export function getVotingTimeRemaining(votingEndsAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = votingEndsAt - now;
  
  if (remaining <= 0) {
    return 'Voting ended';
  }
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

export default {
  createDispute,
  voteOnDispute,
  resolveDispute,
  getDisputeDetails,
  isVoter,
  hasUserVoted,
  getTotalDisputes,
  formatDisputeStatus,
  getVotingTimeRemaining,
};
