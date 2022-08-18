const { ethers } = require("hardhat")

async function mint() {
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`Minted NFT, token ID: ${tokenId}`)
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
