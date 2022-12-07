require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY
const FORKING = process.env.FORKING
// Live Networks
const ETHEREUM_MAINNET_RPC_URL = process.env.ETHEREUM_MAINNET_RPC_URL
const POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL
// Test Networks
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.7",
    defaultNetwork: "hardhat",
    networks: {
        // Dev networks
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
            forking: {
                //chainId: 137,
                accounts: [PRIVATE_KEY],
                url: POLYGON_MAINNET_RPC_URL,
                blockNumber: 35700600,
                enabled: FORKING === "true",
            },
        },
        localhost: {
            chainId: 31337,
        },
        // Live Networks
        mainnet: {
            chainId: 1,
            accounts: [PRIVATE_KEY],
            url: ETHEREUM_MAINNET_RPC_URL,
            blockConfirmations: 6,
        },
        polygon: {
            chainId: 137,
            accounts: [PRIVATE_KEY],
            url: POLYGON_MAINNET_RPC_URL,
            blockConfirmations: 6,
        },
        // Test Networks
        goerli: {
            chainId: 5,
            accounts: [PRIVATE_KEY],
            url: GOERLI_RPC_URL,
            blockConfirmations: 6,
        },
        mumbai: {
            chainId: 80001,
            accounts: [PRIVATE_KEY],
            url: POLYGON_MUMBAI_RPC_URL,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: {
            polygonMumbai: POLYGONSCAN_API_KEY,
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        Alice: {
            default: 1,
        },
    },
    mocha: {
        timeout: 300000,
    },
}
