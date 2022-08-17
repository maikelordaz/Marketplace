// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// IMPORTS CONTRACTS
// IMPORTS INTERFACES
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// IMPORTS LIBRARIES
// ERRORS
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);

// CONTRACT
contract NftMarketplace {
    // STATE VARIABLES
    struct Listing {
        uint256 price;
        address seller;
    }

    // EVENTS
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    // MAPPINGS
    /*
     * Podria hacer dos mappings para este, uno
     * Nft Address -> tokenId -> price
     * y otro
     * Nft Address -> tokenId -> seller
     * Pero es mejor crear un struct nuevo y hacer un solo mapping
     * Nft Address -> tokenId -> Estructura
     */
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    /*
     * Address del vendedor -> ganancias acumiuladas
     * Es mejor decirle al vendedor cuanto tiene acumulado y que el decida cuando retirar
     * mediante una funcion especifica. Así toda la responsabilidad del tramite queda en el
     * y no en mi
     */
    mapping(address => uint256) private s_proceeds;

    // MODIFIERS
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    // FUNCTIONS
    /**
     * @notice method to list a new item on the marketplace
     * @dev It needs the approval from the owner to the contract
     * @param nftAddress the contract address of the item to list
     * @param tokenId the Id of the NFT
     * @param price the sell price
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /**
     * @notice A method to buy listed items
     * @param nftAddress the contract address of the item to buy
     * @param tokenId the Id of the NFT
     */
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
    {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (msg.value < listing.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listing.price);
        }
        s_proceeds[listing.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listing.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listing.price);
    }

    // PURE / VIEW FUNCTIONS
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
