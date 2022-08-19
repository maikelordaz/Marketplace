const { ethers } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.1")

async function mint() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`Minted NFT, token ID: ${tokenId}`)
    console.log("Approving NFT marketplace")
    const approvalTx = await basicNft.appove(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("NFT marketplace approved")
    console.log("Listing NFT...")
    const listTx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await listTx.wait(1)
    console.log("NFT listed on marketplace!")
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
