const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditMarketplace", function () {
    let marketplace, owner, user1, user2, linkToken, vrfCoordinator, priceFeed, ccip;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Mock LINK token, VRF Coordinator, Price Feed, and CCIP for testing
        const LinkToken = await ethers.getContractFactory("MockLinkToken");
        linkToken = await LinkToken.deploy();
        await linkToken.deployed();

        const VRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
        vrfCoordinator = await VRFCoordinator.deploy();
        await vrfCoordinator.deployed();

        const PriceFeed = await ethers.getContractFactory("MockPriceFeed");
        priceFeed = await PriceFeed.deploy();
        await priceFeed.deployed();

        const CCIP = await ethers.getContractFactory("MockCCIP");
        ccip = await CCIP.deploy();
        await ccip.deployed();

        // Deploy the CarbonCreditMarketplace contract
        const CarbonCreditMarketplace = await ethers.getContractFactory("CarbonCreditMarketplace");
        marketplace = await CarbonCreditMarketplace.deploy(
            priceFeed.address,
            vrfCoordinator.address,
            linkToken.address,
            ethers.utils.formatBytes32String("keyHash"),
            ethers.utils.parseUnits("0.1", "ether"),
            ccip.address,
            owner.address
        );
        await marketplace.deployed();
    });

    it("Should deploy with correct initial values", async function () {
        expect(await marketplace.totalCredits()).to.equal(0);
        expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("Should allow the owner to issue carbon credits", async function () {
        await marketplace.issueCredit(100, ethers.utils.parseUnits("50", "ether")); // 100 credits at $50 each

        const credit = await marketplace.carbonCredits(1);
        expect(credit.amount).to.equal(100);
        expect(credit.price).to.equal(ethers.utils.parseUnits("50", "ether"));
        expect(credit.owner).to.equal(owner.address);
    });

    it("Should allow credit transfers between users", async function () {
        // Issue a credit first
        await marketplace.issueCredit(100, ethers.utils.parseUnits("50", "ether"));

        // Transfer credit from owner to user1
        await marketplace.transferCredit(1, user1.address);
        const credit = await marketplace.carbonCredits(1);
        expect(credit.owner).to.equal(user1.address);
        expect(credit.isTransferred).to.equal(true);
    });

    it("Should request and fulfill randomness", async function () {
        // Simulate sending LINK to the contract
        await linkToken.transfer(marketplace.address, ethers.utils.parseUnits("1", "ether"));

        // Request randomness
        const tx = await marketplace.requestRandomNumber();
        const receipt = await tx.wait();

        // Get requestId from the emitted event
        const requestId = receipt.events.find(event => event.event === "RandomNumberRequested").args.requestId;

        // Simulate the fulfillment of randomness by the VRF Coordinator
        await vrfCoordinator.fulfillRandomness(requestId, 777);

        // Check for emitted RandomNumberGenerated event
        await expect(tx).to.emit(marketplace, "RandomNumberGenerated").withArgs(requestId, 777);
    });

    it("Should return the latest carbon price", async function () {
        const price = await marketplace.getLatestCarbonPrice();
        expect(price).to.equal(ethers.utils.parseUnits("100", "ether")); // Assuming 100 USD mock price
    });

    it("Should allow cross-chain credit transfers", async function () {
        // Issue a credit first
        await marketplace.issueCredit(100, ethers.utils.parseUnits("50", "ether"));

        // Transfer the credit cross-chain
        await marketplace.transferCreditCrossChain(1, user1.address);

        const credit = await marketplace.carbonCredits(1);
        expect(credit.owner).to.equal(user1.address);
        expect(credit.isTransferred).to.equal(true);
    });

    it("Should retrieve owned credits for a user", async function () {
        // Issue two credits
        await marketplace.issueCredit(100, ethers.utils.parseUnits("50", "ether"));
        await marketplace.issueCredit(200, ethers.utils.parseUnits("75", "ether"));

        const owned = await marketplace.getOwnedCredits(owner.address);
        expect(owned.length).to.equal(2);
        expect(owned[0]).to.equal(1);
        expect(owned[1]).to.equal(2);
    });
});
