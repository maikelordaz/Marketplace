const { ethers } = require("hardhat")

const TOKEN_ID = 0
const NEW_PRICE = ethers.utils.parseEther("0.2")

async function updateListing() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Updating NFT price...")
    const updateTx = await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, NEW_PRICE)
    await updateTx.wait(1)
    console.log("NFT price updated!")
}

updateListing()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
