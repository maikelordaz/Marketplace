const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0
const PRICE = ethers.utils.parseEther("0.1")

async function listNft() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Approving NFT marketplace")
    const approvalTx = await basicNft.appove(nftMarketplace.address, TOKEN_ID)
    await approvalTx.wait(1)
    console.log("NFT marketplace approved")
    console.log("Listing NFT...")
    const listTx = await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
    await listTx.wait(1)
    console.log("--------------- NFT listed on marketplace! ---------------")

    if ((network.config.chainId = "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

listNft()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
