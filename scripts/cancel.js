const { ethers } = require("hardhat")

const TOKEN_ID = 0

async function cancel() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Cancel NFT...")
    const cancelTx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
    await cancelTx.wait(1)
    console.log("NFT cancelled!")
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
