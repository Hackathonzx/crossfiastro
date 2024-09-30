# Carbon Credit Marketplace
This project is a decentralized marketplace for carbon credits built on crossfi testnet, using Chainlink services such as VRF (Verifiable Random Function) and Chainlink Price Feeds. The marketplace allows the issuance, transfer, and cross-chain transfer of carbon credits, providing transparency and accountability for carbon offset projects.

Features
- Issuing Carbon Credits: The contract owner can issue new carbon credits with a specified amount and price in USD.
Carbon Credit Transfer: Users can transfer ownership of carbon credits to other users.
Cross-Chain Transfer: The contract supports transferring carbon credits across blockchains using Chainlink CCIP (Cross-Chain Interoperability Protocol).
Chainlink VRF Integration: The marketplace uses Chainlink VRF for generating randomness, which introduces a delay mechanism for transactions as an anti-MEV (Miner Extractable Value) measure.
Chainlink Price Feeds: Provides real-time USD price for carbon credits.
Technologies
Solidity: Smart contract programming language.
Chainlink: Used for random number generation (VRF), price feeds, and cross-chain messaging.
OpenZeppelin: Provides secure smart contract templates (Ownable contract).
Ethereum: Blockchain platform used to deploy the contract.
Installation and Deployment
Prerequisites
Node.js and npm
Hardhat: Development environment for Ethereum smart contracts.
Chainlink Testnet Faucet: To acquire LINK tokens for testing VRF.
Infura/Alchemy: For interacting with Ethereum network.
Metamask: Ethereum wallet for interacting with the DApp.
Steps for Deployment
Clone the repository:

git clone https://github.com/your-repo/carbon-credit-marketplace.git
cd carbon-credit-marketplace
Install dependencies:
npm install
Update environment variables: Create a .env file in the root folder with the following:

INFURA_PROJECT_ID=<YOUR_INFURA_PROJECT_ID>
PRIVATE_KEY=<YOUR_WALLET_PRIVATE_KEY>
LINK_TOKEN_ADDRESS=<LINK_TOKEN_ADDRESS>
VRF_COORDINATOR_ADDRESS=<VRF_COORDINATOR_ADDRESS>
CCIP_ADDRESS=<CCIP_CONTRACT_ADDRESS>
PRICE_FEED_ADDRESS=<CHAINLINK_PRICE_FEED_ADDRESS>
KEY_HASH=<VRF_KEY_HASH>
FEE=<LINK_FEE>
Compile the contract:

npx hardhat compile
Deploy the contract:


Contract Breakdown
Structs:
CarbonCredit: Holds information such as credit ID, owner, amount, price, and transfer status.
Functions:
issueCredit(uint256 amount, uint256 price): Issues a new carbon credit, assigning ownership to the contract owner.
transferCredit(uint256 id, address to): Transfers a carbon credit from the current owner to a new owner.
transferCreditCrossChain(uint256 id, address to): Transfers a carbon credit across different chains using Chainlink CCIP.
getLatestCarbonPrice(): Fetches the latest carbon price in USD using Chainlink Price Feeds.
requestRandomNumber(): Requests a random number from Chainlink VRF to introduce a delay in transactions.
fulfillRandomness(bytes32 requestId, uint256 randomness): Handles the randomness returned by Chainlink VRF and determines a random delay for certain operations.
Testing
Run Tests:

npx hardhat test
Sample Test Suite: The test scripts verify the issuance, transfer, and cross-chain transfer of carbon credits, as well as Chainlink VRF randomness generation.

Future Improvements
Cross-chain Credit Redemption: Allow users to redeem their carbon credits across different blockchain ecosystems.
Carbon Credit Valuation: Integrate AI models to forecast and adjust the carbon credit price dynamically.
Advanced Anti-MEV Protection: Enhance the delay mechanism for transaction protection.
License
MIT License.

