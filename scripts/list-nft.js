const { ethers } = require("hardhat")

const TOKEN_ID = 0
const PRICE = ethers.utils.parseEther("0.1")

async function listNft() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Listing NFT...")
    const listTx = await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
    await listTx.wait(1)
    console.log("NFT listed on marketplace!")
}

listNft()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
