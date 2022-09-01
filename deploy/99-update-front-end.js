require("dotenv").config()
const { network, ethers } = require("hardhat")
const fs = require("fs")
const {
    frontEndContractsFile,
    frontEndAbiLocation,
    frontEndContractsFile2,
    frontEndAbiLocation2,
} = require("../helper-hardhat-config")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("--------------- Updating Front End ---------------")
        await updateContractAddresses()
        await updateAbi()
        console.log("--------------- Front End Updated ---------------")
    }
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")

    // For the Moralis Repo
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )

    // For the The Graph repo

    fs.writeFileSync(
        `${frontEndAbiLocation2}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    fs.writeFileSync(
        `${frontEndAbiLocation2}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplace = await ethers.getContract("NftMarketplace")

    // For the Moralis Repo
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"], push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))

    // For the The Graph Repo
    const contractAddresses2 = JSON.parse(fs.readFileSync(frontEndContractsFile2, "utf8"))

    if (chainId in contractAddresses2) {
        if (!contractAddresses2[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses2[chainId]["NftMarketplace"], push(nftMarketplace.address)
        }
    } else {
        contractAddresses2[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
