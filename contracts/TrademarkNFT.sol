// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TrademarkNFT
 * @dev ERC721 NFT contract for trademark registration with royalty support (ERC2981)
 */
contract TrademarkNFT is ERC721, ERC721URIStorage, ERC2981, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Trademark metadata structure
    struct Trademark {
        uint256 tokenId;
        address creator;
        string companyName;
        string sloganText;
        string registrationNumber;
        string ipfsHash;
        string category;
        uint96 royaltyBps; // Basis points (100 = 1%)
        uint256 createdAt;
        bool verified;
    }
    
    // Mapping from token ID to trademark data
    mapping(uint256 => Trademark) public trademarks;
    
    // Mapping from registration number to token ID (for uniqueness check)
    mapping(string => uint256) public registrationToTokenId;
    
    // Events
    event TrademarkRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        string companyName,
        string sloganText,
        string registrationNumber,
        string ipfsHash,
        string category,
        uint96 royaltyBps
    );
    
    event TrademarkVerified(uint256 indexed tokenId, address indexed verifier);
    
    constructor() ERC721("TrademarkNFT", "TMNFT") {
        // Start token IDs at 1
        _tokenIdCounter.increment();
    }
    
    /**
     * @dev Register a new trademark as an NFT
     * @param companyName Name of the company
     * @param sloganText The trademark slogan text
     * @param registrationNumber Unique registration number
     * @param ipfsHash IPFS hash of trademark assets
     * @param category Trademark category
     * @param royaltyBps Royalty percentage in basis points (100 = 1%)
     * @param metadataURI Metadata URI for the NFT
     * @return tokenId The ID of the newly minted NFT
     */
    function registerTrademark(
        string memory companyName,
        string memory sloganText,
        string memory registrationNumber,
        string memory ipfsHash,
        string memory category,
        uint96 royaltyBps,
        string memory metadataURI
    ) external returns (uint256) {
        // Validate inputs
        require(bytes(companyName).length > 0, "Company name required");
        require(bytes(sloganText).length > 0, "Slogan text required");
        require(bytes(registrationNumber).length > 0, "Registration number required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(category).length > 0, "Category required");
        require(royaltyBps <= 2500, "Royalty cannot exceed 25%"); // Max 25%
        
        // Check registration number uniqueness
        require(
            registrationToTokenId[registrationNumber] == 0,
            "Registration number already exists"
        );
        
        // Get current token ID and increment counter
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint NFT to sender
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Set royalty info (ERC2981)
        _setTokenRoyalty(tokenId, msg.sender, royaltyBps);
        
        // Store trademark data
        trademarks[tokenId] = Trademark({
            tokenId: tokenId,
            creator: msg.sender,
            companyName: companyName,
            sloganText: sloganText,
            registrationNumber: registrationNumber,
            ipfsHash: ipfsHash,
            category: category,
            royaltyBps: royaltyBps,
            createdAt: block.timestamp,
            verified: false
        });
        
        // Map registration number to token ID
        registrationToTokenId[registrationNumber] = tokenId;
        
        emit TrademarkRegistered(
            tokenId,
            msg.sender,
            companyName,
            sloganText,
            registrationNumber,
            ipfsHash,
            category,
            royaltyBps
        );
        
        return tokenId;
    }
    
    /**
     * @dev Verify a trademark (admin only)
     * @param tokenId The token ID to verify
     */
    function verifyTrademark(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!trademarks[tokenId].verified, "Already verified");
        
        trademarks[tokenId].verified = true;
        
        emit TrademarkVerified(tokenId, msg.sender);
    }
    
    /**
     * @dev Get trademark information
     * @param tokenId The token ID
     * @return Trademark struct with all trademark data
     */
    function getTrademarkInfo(uint256 tokenId) external view returns (Trademark memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return trademarks[tokenId];
    }
    
    /**
     * @dev Check if a registration number is already used
     * @param registrationNumber The registration number to check
     * @return bool True if registration number exists
     */
    function isRegistrationNumberUsed(string memory registrationNumber) external view returns (bool) {
        return registrationToTokenId[registrationNumber] != 0;
    }
    
    /**
     * @dev Get token ID by registration number
     * @param registrationNumber The registration number
     * @return tokenId The token ID (0 if not found)
     */
    function getTokenIdByRegistration(string memory registrationNumber) external view returns (uint256) {
        return registrationToTokenId[registrationNumber];
    }
    
    /**
     * @dev Get total number of trademarks registered
     * @return uint256 Total count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
    
    // Override functions required by Solidity
    
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
