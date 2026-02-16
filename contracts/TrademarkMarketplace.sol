// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TrademarkMarketplace
 * @dev Marketplace contract for trading trademark NFTs with royalty support
 */
contract TrademarkMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _listingIdCounter;
    
    // Reference to the TrademarkNFT contract
    IERC721 public immutable trademarkNFT;
    IERC2981 public immutable royaltyContract;
    
    // Marketplace fee (in basis points, 100 = 1%)
    uint96 public marketplaceFee = 250; // 2.5%
    
    // Listing structure
    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isLicense; // true = license, false = full sale
        bool active;
        uint256 createdAt;
        uint256 expiresAt; // 0 = no expiration
    }
    
    // License structure for tracking licenses
    struct License {
        uint256 licenseId;
        uint256 tokenId;
        address licensee;
        address licensor;
        uint256 price;
        uint256 duration; // Duration in seconds, 0 = perpetual
        uint256 issuedAt;
        uint256 expiresAt;
        bool active;
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256[]) public tokenListings; // tokenId => listingIds
    mapping(address => uint256[]) public sellerListings; // seller => listingIds
    mapping(uint256 => License[]) public tokenLicenses; // tokenId => licenses
    mapping(address => uint256[]) public userLicenses; // user => licenseIds
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        bool isLicense,
        uint256 expiresAt
    );
    
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    
    event TrademarkSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 royaltyAmount,
        uint256 marketplaceFeeAmount
    );
    
    event TrademarkLicensed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed licensee,
        address licensor,
        uint256 price,
        uint256 duration
    );
    
    event MarketplaceFeeUpdated(uint96 oldFee, uint96 newFee);
    
    constructor(address _trademarkNFT) {
        require(_trademarkNFT != address(0), "Invalid TrademarkNFT address");
        trademarkNFT = IERC721(_trademarkNFT);
        royaltyContract = IERC2981(_trademarkNFT);
    }
    
    /**
     * @dev Create a new listing for a trademark
     * @param tokenId The ID of the trademark to list
     * @param price The price in wei
     * @param isLicense Whether this is a license (true) or sale (false)
     * @param duration Duration in seconds (only for licenses, 0 = perpetual)
     * @param expiresAt When the listing expires (0 = no expiration)
     * @return listingId The ID of the created listing
     */
    function createListing(
        uint256 tokenId,
        uint256 price,
        bool isLicense,
        uint256 duration,
        uint256 expiresAt
    ) external nonReentrant returns (uint256) {
        require(trademarkNFT.ownerOf(tokenId) == msg.sender, "Not the owner of this trademark");
        require(price > 0, "Price must be greater than 0");
        require(expiresAt == 0 || expiresAt > block.timestamp, "Invalid expiration time");
        
        // For licenses, duration can be 0 (perpetual) or > 0
        if (isLicense && duration > 0) {
            require(duration >= 86400, "License duration must be at least 1 day"); // 24 hours minimum
        }
        
        _listingIdCounter.increment();
        uint256 listingId = _listingIdCounter.current();
        
        listings[listingId] = Listing({
            listingId: listingId,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isLicense: isLicense,
            active: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });
        
        // Update mappings
        tokenListings[tokenId].push(listingId);
        sellerListings[msg.sender].push(listingId);
        
        emit ListingCreated(listingId, tokenId, msg.sender, price, isLicense, expiresAt);
        
        return listingId;
    }
    
    /**
     * @dev Buy a trademark (full sale)
     * @param listingId The ID of the listing to purchase
     */
    function buyTrademark(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(!listing.isLicense, "This is a license listing, use licenseTrademark instead");
        require(listing.expiresAt == 0 || listing.expiresAt > block.timestamp, "Listing has expired");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Cannot buy your own listing");
        
        // Get royalty information
        (address royaltyReceiver, uint256 royaltyAmount) = royaltyContract.royaltyInfo(listing.tokenId, listing.price);
        
        // Calculate fees
        uint256 marketplaceFeeAmount = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - royaltyAmount - marketplaceFeeAmount;
        
        // Mark listing as inactive
        listing.active = false;
        
        // Transfer the NFT
        trademarkNFT.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Distribute payments
        if (royaltyAmount > 0 && royaltyReceiver != listing.seller) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        } else {
            sellerAmount += royaltyAmount; // Add royalty back to seller if they're the creator
        }
        
        if (marketplaceFeeAmount > 0) {
            payable(owner()).transfer(marketplaceFeeAmount);
        }
        
        payable(listing.seller).transfer(sellerAmount);
        
        emit TrademarkSold(
            listingId,
            listing.tokenId,
            msg.sender,
            listing.seller,
            listing.price,
            royaltyAmount,
            marketplaceFeeAmount
        );
    }
    
    /**
     * @dev License a trademark
     * @param listingId The ID of the listing to license
     * @param duration Duration of the license in seconds (0 = perpetual)
     */
    function licenseTrademark(uint256 listingId, uint256 duration) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.isLicense, "This is a sale listing, use buyTrademark instead");
        require(listing.expiresAt == 0 || listing.expiresAt > block.timestamp, "Listing has expired");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Cannot license your own trademark");
        
        // Calculate fees (no royalty for licenses, only marketplace fee)
        uint256 marketplaceFeeAmount = (listing.price * marketplaceFee) / 10000;
        uint256 licensorAmount = listing.price - marketplaceFeeAmount;
        
        // Create license record
        uint256 expiresAt = duration > 0 ? block.timestamp + duration : 0;
        
        License memory newLicense = License({
            licenseId: tokenLicenses[listing.tokenId].length,
            tokenId: listing.tokenId,
            licensee: msg.sender,
            licensor: listing.seller,
            price: listing.price,
            duration: duration,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });
        
        tokenLicenses[listing.tokenId].push(newLicense);
        userLicenses[msg.sender].push(newLicense.licenseId);
        
        // Distribute payments
        if (marketplaceFeeAmount > 0) {
            payable(owner()).transfer(marketplaceFeeAmount);
        }
        
        payable(listing.seller).transfer(licensorAmount);
        
        emit TrademarkLicensed(
            listingId,
            listing.tokenId,
            msg.sender,
            listing.seller,
            listing.price,
            duration
        );
    }
    
    /**
     * @dev Cancel a listing
     * @param listingId The ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized to cancel this listing");
        require(listing.active, "Listing is already inactive");
        
        listing.active = false;
        
        emit ListingCancelled(listingId, listing.seller);
    }
    
    /**
     * @dev Get active listings for a token
     * @param tokenId The token ID to query
     * @return Array of active listing IDs
     */
    function getActiveListingsForToken(uint256 tokenId) external view returns (uint256[] memory) {
        uint256[] memory allListings = tokenListings[tokenId];
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active && 
                (listings[allListings[i]].expiresAt == 0 || listings[allListings[i]].expiresAt > block.timestamp)) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allListings.length; i++) {
            if (listings[allListings[i]].active && 
                (listings[allListings[i]].expiresAt == 0 || listings[allListings[i]].expiresAt > block.timestamp)) {
                activeListings[index] = allListings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get licenses for a token
     * @param tokenId The token ID to query
     * @return Array of licenses
     */
    function getLicensesForToken(uint256 tokenId) external view returns (License[] memory) {
        return tokenLicenses[tokenId];
    }
    
    /**
     * @dev Check if a user has an active license for a token
     * @param tokenId The token ID to check
     * @param user The user address to check
     * @return bool indicating if the user has an active license
     */
    function hasActiveLicense(uint256 tokenId, address user) external view returns (bool) {
        License[] memory licenses = tokenLicenses[tokenId];
        
        for (uint256 i = 0; i < licenses.length; i++) {
            if (licenses[i].licensee == user && 
                licenses[i].active && 
                (licenses[i].expiresAt == 0 || licenses[i].expiresAt > block.timestamp)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Update marketplace fee (only owner)
     * @param newFee New fee in basis points
     */
    function updateMarketplaceFee(uint96 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        
        uint96 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        
        emit MarketplaceFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Get current listing counter
     * @return Current listing ID counter
     */
    function getCurrentListingId() external view returns (uint256) {
        return _listingIdCounter.current();
    }
}