require("dotenv").config()
const { network, ethers } = require("hardhat")
const fs = require("fs")
const { frontEndContractsFile } = require("../helper-hardhat-config")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("--------------- Updating Front End ---------------")
        await updateContractAddresses()
        console.log("--------------- Front End Updated ---------------")
    }
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"], push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
