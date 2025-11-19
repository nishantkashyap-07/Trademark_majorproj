// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TrademarkNFT
 * @dev ERC721 contract for registering trademarks as NFTs with immutable on-chain records
 */
contract TrademarkNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Trademark data structure
    struct Trademark {
        uint256 tokenId;
        address creator;
        string companyName;
        string trademarkName;
        string registrationNumber;
        string ipfsHash;
        string category;
        uint96 royaltyBps; // Basis points (100 = 1%)
        uint256 createdAt;
        bool verified;
    }
    
    // Mappings
    mapping(uint256 => Trademark) public trademarks;
    mapping(string => bool) public registrationNumbers; // Prevent duplicate registration numbers
    mapping(address => uint256[]) public ownerTrademarks; // Track trademarks by owner
    mapping(string => uint256) public trademarkByRegistration; // Find trademark by registration number
    
    // Events
    event TrademarkRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        string companyName,
        string trademarkName,
        string registrationNumber,
        string category,
        string ipfsHash
    );
    
    event TrademarkVerified(uint256 indexed tokenId, address indexed verifier);
    event TrademarkTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    
    // Constants
    uint96 public constant MAX_ROYALTY_BPS = 2500; // 25%
    uint96 public constant MIN_ROYALTY_BPS = 100;  // 1%
    
    constructor() ERC721("TrademarkNFT", "TMNFT") {}
    
    /**
     * @dev Register a new trademark as an NFT
     * @param companyName Name of the company registering the trademark
     * @param trademarkName Name of the trademark
     * @param registrationNumber Official registration number (must be unique)
     * @param ipfsHash IPFS hash containing trademark assets and metadata
     * @param category Category of the trademark
     * @param royaltyBps Royalty percentage in basis points
     * @param tokenURI URI for the token metadata
     * @return tokenId The ID of the newly minted trademark NFT
     */
    function registerTrademark(
        string memory companyName,
        string memory trademarkName,
        string memory registrationNumber,
        string memory ipfsHash,
        string memory category,
        uint96 royaltyBps,
        string memory tokenURI
    ) external nonReentrant returns (uint256) {
        require(bytes(companyName).length > 0, "Company name cannot be empty");
        require(bytes(trademarkName).length > 0, "Trademark name cannot be empty");
        require(bytes(registrationNumber).length > 0, "Registration number cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");
        require(royaltyBps >= MIN_ROYALTY_BPS && royaltyBps <= MAX_ROYALTY_BPS, "Invalid royalty percentage");
        require(!registrationNumbers[registrationNumber], "Registration number already exists");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Mint NFT to the caller
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store trademark data
        trademarks[tokenId] = Trademark({
            tokenId: tokenId,
            creator: msg.sender,
            companyName: companyName,
            trademarkName: trademarkName,
            registrationNumber: registrationNumber,
            ipfsHash: ipfsHash,
            category: category,
            royaltyBps: royaltyBps,
            createdAt: block.timestamp,
            verified: false
        });
        
        // Update mappings
        registrationNumbers[registrationNumber] = true;
        ownerTrademarks[msg.sender].push(tokenId);
        trademarkByRegistration[registrationNumber] = tokenId;
        
        emit TrademarkRegistered(
            tokenId,
            msg.sender,
            companyName,
            trademarkName,
            registrationNumber,
            category,
            ipfsHash
        );
        
        return tokenId;
    }
    
    /**
     * @dev Verify a trademark (only owner can call this)
     * @param tokenId The ID of the trademark to verify
     */
    function verifyTrademark(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Trademark does not exist");
        require(!trademarks[tokenId].verified, "Trademark already verified");
        
        trademarks[tokenId].verified = true;
        emit TrademarkVerified(tokenId, msg.sender);
    }
    
    /**
     * @dev Get trademark information by token ID
     * @param tokenId The ID of the trademark
     * @return Trademark struct containing all trademark data
     */
    function getTrademarkInfo(uint256 tokenId) external view returns (Trademark memory) {
        require(_exists(tokenId), "Trademark does not exist");
        return trademarks[tokenId];
    }
    
    /**
     * @dev Get trademark ID by registration number
     * @param registrationNumber The registration number to look up
     * @return tokenId The ID of the trademark with the given registration number
     */
    function getTrademarkByRegistration(string memory registrationNumber) external view returns (uint256) {
        uint256 tokenId = trademarkByRegistration[registrationNumber];
        require(tokenId != 0, "Trademark not found");
        return tokenId;
    }
    
    /**
     * @dev Get all trademarks owned by an address
     * @param owner The address to query
     * @return Array of token IDs owned by the address
     */
    function getOwnerTrademarks(address owner) external view returns (uint256[] memory) {
        return ownerTrademarks[owner];
    }
    
    /**
     * @dev Check if a registration number is already used
     * @param registrationNumber The registration number to check
     * @return bool indicating if the registration number exists
     */
    function isRegistrationNumberUsed(string memory registrationNumber) external view returns (bool) {
        return registrationNumbers[registrationNumber];
    }
    
    /**
     * @dev Get royalty information for a token (EIP-2981 compatible)
     * @param tokenId The ID of the trademark
     * @param salePrice The sale price of the trademark
     * @return receiver The address that should receive the royalty
     * @return royaltyAmount The royalty amount in wei
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        returns (address receiver, uint256 royaltyAmount) 
    {
        require(_exists(tokenId), "Trademark does not exist");
        
        Trademark memory trademark = trademarks[tokenId];
        receiver = trademark.creator;
        royaltyAmount = (salePrice * trademark.royaltyBps) / 10000;
    }
    
    /**
     * @dev Get the current token ID counter
     * @return The current token ID counter value
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Override transfer functions to update owner mappings
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            // Remove from previous owner's list
            uint256[] storage fromTokens = ownerTrademarks[from];
            for (uint256 i = 0; i < fromTokens.length; i++) {
                if (fromTokens[i] == tokenId) {
                    fromTokens[i] = fromTokens[fromTokens.length - 1];
                    fromTokens.pop();
                    break;
                }
            }
            
            // Add to new owner's list
            ownerTrademarks[to].push(tokenId);
            
            emit TrademarkTransferred(tokenId, from, to);
        }
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}