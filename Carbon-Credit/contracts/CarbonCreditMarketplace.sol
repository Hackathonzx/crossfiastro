// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IChainlinkCCIP {
    function sendCrossChainMessage(address to, bytes calldata message) external;
}

// Main Carbon Credit Marketplace Contract
contract CarbonCreditMarketplace is VRFConsumerBase, Ownable {
    // Structs
    struct CarbonCredit {
        uint256 id;
        address owner;
        uint256 amount;
        uint256 price; // Price in USD
        bool isTransferred; // Flag to check if credit has been transferred
    }

    // State Variables
    mapping(uint256 => CarbonCredit) public carbonCredits;
    mapping(address => uint256[]) private ownedCredits; // Track owned credits for each wallet
    uint256 public totalCredits;
    AggregatorV3Interface internal priceFeed; // Chainlink price feed for USD
    bytes32 internal keyHash; // Chainlink VRF key hash
    uint256 internal fee; // Chainlink VRF fee
    IChainlinkCCIP internal ccip; // Chainlink CCIP interface

    // Events
    event CreditIssued(uint256 indexed id, address indexed owner, uint256 amount, uint256 price);
    event CreditTransferred(uint256 indexed id, address indexed from, address indexed to, uint256 amount);
    event RandomNumberRequested(bytes32 requestId);
    event CreditTransferredCrossChain(uint256 indexed id, address indexed from, address indexed to, uint256 amount);
    event RandomNumberGenerated(bytes32 requestId, uint256 randomness, uint256 randomDelay);
    event TransactionDelayed(uint256 delay); // New event for transaction delay

    constructor(
        address _priceFeedAddress,
        address _vrfCoordinator,
        address _link,
        bytes32 _keyHash,
        uint256 _fee,
        address _ccipAddress, // Address of the CCIP contract
        address initialOwner // Address of the initial owner
    ) VRFConsumerBase(_vrfCoordinator, _link) Ownable(initialOwner) {
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        keyHash = _keyHash;
        fee = _fee;
        ccip = IChainlinkCCIP(_ccipAddress); // Initialize CCIP interface
    }

    // Internal function to send a cross-chain message
    function sendCrossChainMessage(address to, bytes memory message) internal {
        ccip.sendCrossChainMessage(to, message);
    }

    // Function to issue a new carbon credit
    function issueCredit(uint256 amount, uint256 price) external onlyOwner {
        totalCredits++;
        carbonCredits[totalCredits] = CarbonCredit(totalCredits, msg.sender, amount, price, false);
        ownedCredits[msg.sender].push(totalCredits); // Track the issued credit
        emit CreditIssued(totalCredits, msg.sender, amount, price);
    }

    // Function to transfer carbon credits
    function transferCredit(uint256 id, address to) external {
        require(carbonCredits[id].owner == msg.sender, "You do not own this credit");
        require(to != address(0), "Invalid address");
        require(!carbonCredits[id].isTransferred, "Credit already transferred");

        // Transfer ownership
        carbonCredits[id].owner = to;
        carbonCredits[id].isTransferred = true; // Mark as transferred

        // Update owned credits
        _removeCreditFromOwner(msg.sender, id);
        ownedCredits[to].push(id); // Add credit to the new owner

        emit CreditTransferred(id, msg.sender, to, carbonCredits[id].amount);
    }

    // Function to get the latest carbon price from Chainlink Oracle
    function getLatestCarbonPrice() public view returns (int256) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        return price; // Return price in USD
    }

    // Function to request a random number for MEV protection
    function requestRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        requestId = requestRandomness(keyHash, fee);
        emit RandomNumberRequested(requestId);
    }

    // Callback function for Chainlink VRF
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 randomDelay = randomness % 10; // Generate a delay between 0 and 9 seconds
        emit RandomNumberGenerated(requestId, randomness, randomDelay);
        
        // Logic to delay execution of certain operations
        if (randomDelay > 0) {
            emit TransactionDelayed(randomDelay);
            // Here you can implement any additional delayed transaction logic if needed
        } else {
            // Immediate transaction logic can be executed here if no delay is indicated
        }
    }

    // Cross-Chain Transfer Function
    function transferCreditCrossChain(uint256 id, address to) external {
        require(carbonCredits[id].owner == msg.sender, "You do not own this credit");
        require(to != address(0), "Invalid address");
        require(!carbonCredits[id].isTransferred, "Credit already transferred");

        // Transfer ownership in this contract
        carbonCredits[id].owner = to;
        carbonCredits[id].isTransferred = true; // Mark as transferred
        emit CreditTransferredCrossChain(id, msg.sender, to, carbonCredits[id].amount);

        // Construct a message for cross-chain transfer
        bytes memory message = abi.encode(id, to, carbonCredits[id].amount);
        sendCrossChainMessage(address(ccip), message); // Send message via CCIP
    }

    // Function to retrieve credits owned by a user
    function getOwnedCredits(address user) external view returns (uint256[] memory) {
        return ownedCredits[user];
    }

    // Internal function to remove credit from owner's list
    function _removeCreditFromOwner(address owner, uint256 id) internal {
        uint256[] storage credits = ownedCredits[owner];
        for (uint256 i = 0; i < credits.length; i++) {
            if (credits[i] == id) {
                credits[i] = credits[credits.length - 1]; // Replace with the last element
                credits.pop(); // Remove the last element
                break;
            }
        }
    }
}
