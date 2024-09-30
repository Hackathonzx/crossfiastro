const { ethers } = require("hardhat");
require('dotenv').config();

const { PRIVATE_KEY, CROSSFI_RPC_URL, XFI_TOKEN_ADDRESS } = process.env

async function main() {
    const [deployer] = await ethers.getSigners();    
    console.log("Deploying contracts with the account:", deployer.address);  
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  
    // Addresses and other variables
    const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
    const vrfCoordinator = "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b";
    const linkTokenAddress = "0x779877a7b0d9e8603169ddbd7836e478b4624789";
    const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
    const fee = ethers.parseUnits("0.1"); 
    const ccipAddress = "0xF694E193200268f9a4868e4Aa017A0118C9a8177";
    const initialOwner = "0xF78391F0992E80959fe3Fe55340270D26C56E3Ae";

    // Get the ContractFactory
    const CarbonCreditMarketplace = await hre.ethers.getContractFactory("CarbonCreditMarketplace");

    // Deploy the contract
    const carbonCreditMarketplace = await CarbonCreditMarketplace.deploy(
        priceFeedAddress,
        vrfCoordinator,
        linkTokenAddress,
        keyHash,
        fee,
        ccipAddress,
        initialOwner
    );

    await carbonCreditMarketplace.waitForDeployment(); // Updated for ethers v6
    console.log("CarbonCreditMarketplace deployed to:", await astroPet.getAddress());
}

// Run the deploy function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });