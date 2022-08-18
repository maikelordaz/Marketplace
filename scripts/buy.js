const { ethers } = require("hardhat")

const TOKEN_ID = 0

async function buy() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
    const price = listing.price.toString()
    console.log("Buying NFT...")
    const buyTx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price })
    await buyTx.wait(1)
    console.log("NFT buyed!")
}

buy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
