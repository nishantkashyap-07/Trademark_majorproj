# Requirements Document

## Introduction

A blockchain-powered intellectual property protection and marketplace system that enables creators to register trademarks as NFTs on Polygon testnet, store trademark assets on IPFS, and facilitate buying/licensing through a decentralized marketplace with automated royalty distribution.

## Glossary

- **Trademark_System**: The complete blockchain-based trademark registration and marketplace platform
- **Creator**: A user who registers and owns trademark NFTs
- **Buyer**: A user who purchases or licenses trademark NFTs from the marketplace
- **Trademark_NFT**: An ERC721 token representing ownership of a trademark with associated metadata
- **IPFS_Hash**: A unique content identifier for trademark assets stored on the InterPlanetary File System
- **Royalty_Split**: Automated percentage-based payment distribution to original creators on secondary sales
- **Web3_Wallet**: MetaMask or compatible Ethereum wallet for blockchain interactions
- **Marketplace_Contract**: Smart contract managing NFT listings, sales, and licensing
- **Firestore_DB**: Firebase database storing user profiles and trademark metadata for fast queries

## Requirements

### Requirement 1

**User Story:** As a creator, I want to register my trademark as an NFT with associated digital assets, so that I can establish verifiable ownership on the blockchain.

#### Acceptance Criteria

1. WHEN a creator uploads trademark assets, THE Trademark_System SHALL store the files on IPFS and return a unique IPFS_Hash
2. WHEN a creator submits trademark registration data, THE Trademark_System SHALL mint an ERC721 token with the creator as owner
3. THE Trademark_System SHALL associate each Trademark_NFT with metadata including IPFS_Hash, category, and royalty percentage
4. WHEN trademark registration is complete, THE Trademark_System SHALL store the transaction details in Firestore_DB
5. THE Trademark_System SHALL require Web3_Wallet connection for all registration transactions

### Requirement 2

**User Story:** As a creator, I want to list my trademark NFTs for sale or licensing in a marketplace, so that I can monetize my intellectual property.

#### Acceptance Criteria

1. WHEN a creator owns a Trademark_NFT, THE Trademark_System SHALL allow creation of marketplace listings
2. THE Trademark_System SHALL support both full sale and licensing options for each listing
3. WHEN creating a listing, THE Trademark_System SHALL require price specification and listing type selection
4. THE Trademark_System SHALL store listing information in the Marketplace_Contract
5. WHEN a listing is created, THE Trademark_System SHALL update Firestore_DB with listing metadata for search functionality

### Requirement 3

**User Story:** As a buyer, I want to browse and purchase trademark NFTs from a marketplace, so that I can acquire intellectual property rights.

#### Acceptance Criteria

1. THE Trademark_System SHALL display all active trademark listings in a searchable marketplace interface
2. WHEN a buyer selects a trademark, THE Trademark_System SHALL show detailed information including IPFS assets and ownership history
3. WHEN a buyer initiates a purchase, THE Trademark_System SHALL process payment through the connected Web3_Wallet
4. IF the transaction is a full sale, THEN THE Trademark_System SHALL transfer NFT ownership to the buyer
5. IF the transaction is a license, THEN THE Trademark_System SHALL record the license agreement while maintaining original ownership

### Requirement 4

**User Story:** As a creator, I want to receive royalties on secondary sales of my trademark NFTs, so that I can benefit from ongoing value appreciation.

#### Acceptance Criteria

1. WHEN a Trademark_NFT is sold on the secondary market, THE Trademark_System SHALL automatically calculate royalty payments
2. THE Trademark_System SHALL distribute the specified royalty percentage to the original creator
3. THE Trademark_System SHALL transfer the remaining payment amount to the current seller
4. WHEN royalty distribution occurs, THE Trademark_System SHALL record the transaction details in Firestore_DB
5. THE Trademark_System SHALL support royalty percentages between 1% and 25% as specified during registration

### Requirement 5

**User Story:** As a user, I want to authenticate using my Web3 wallet, so that I can securely interact with the blockchain-based system.

#### Acceptance Criteria

1. THE Trademark_System SHALL support MetaMask wallet connection for user authentication
2. WHEN a user connects their wallet, THE Trademark_System SHALL verify the connection to Polygon testnet
3. THE Trademark_System SHALL create or retrieve user profile data from Firestore_DB based on wallet address
4. WHILE a user session is active, THE Trademark_System SHALL maintain wallet connection state
5. THE Trademark_System SHALL require wallet signatures for all blockchain transactions

### Requirement 6

**User Story:** As a user, I want to view my trademark portfolio and transaction history, so that I can manage my intellectual property assets.

#### Acceptance Criteria

1. WHEN a user accesses their dashboard, THE Trademark_System SHALL display all owned Trademark_NFTs
2. THE Trademark_System SHALL show current marketplace listings created by the user
3. THE Trademark_System SHALL display transaction history including purchases, sales, and royalty payments
4. WHEN viewing trademark details, THE Trademark_System SHALL load asset files from IPFS using the stored IPFS_Hash
5. THE Trademark_System SHALL provide filtering and sorting options for portfolio management