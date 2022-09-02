const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0
const NEW_PRICE = ethers.utils.parseEther("0.2")

async function updateListing() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Updating NFT price...")
    const updateTx = await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, NEW_PRICE)
    await updateTx.wait(1)
    console.log("--------------- NFT price updated! ---------------")

    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

updateListing()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
