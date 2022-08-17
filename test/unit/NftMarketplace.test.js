const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace unit tests", function () {
          let nftMarketplaceContract, nftMarketplace, basicNftContract, basicNft
          const TOKEN_ID = 0
          const ALICE_TOKEN = 1
          const PRICE = ethers.utils.parseEther("0.1")

          beforeEach(async () => {
              // Get the accounts
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              Alice = accounts[1]
              // Deploy contracts
              await deployments.fixture(["all"])
              nftMarketplaceContract = await ethers.getContract("NftMarketplace")
              basicNftContract = await ethers.getContract("BasicNft")
              // Connect the deployer to each contract
              nftMarketplace = nftMarketplaceContract.connect(deployer)
              basicNft = basicNftContract.connect(deployer)
              // Connect Alice to each contract
              nftMarketplaceAlice = nftMarketplaceContract.connect(Alice)
              basicNftAlice = basicNftContract.connect(Alice)
              // Mint one NFT for each
              await basicNft.mintNft()
              await basicNftAlice.mintNft()
              // Only the deployer give the approval
              await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
          })

          describe("Basic Nft", function () {
              it("checks the token URI", async function () {
                  const tokenURIexpected =
                      "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
                  const tokenCounter = await basicNft.getTokenCounter()
                  const tokenURI = await basicNft.tokenURI(0)
                  assert.equal(tokenURI, tokenURIexpected)
                  assert.equal(tokenCounter, "2")
              })
          })

          describe("List item", function () {
              it("Revert if there is no price included", async function () {
                  await expect(
                      nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, 0)
                  ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero")
              })

              it("Revert if the marketplace is not approved", async function () {
                  await expect(
                      nftMarketplaceAlice.listItem(basicNftContract.address, ALICE_TOKEN, PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotApprovedForMarketplace")
              })

              it("Emit an event when the item is listed", async function () {
                  expect(
                      nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  ).to.emit("ItemListed")
              })

              it("Update the listing", async function () {
                  await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  const listing = await nftMarketplace.getListing(
                      basicNftContract.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), PRICE.toString())
                  assert.equal(listing.seller.toString(), deployer.address)
              })

              it("only allow owners to list", async function () {
                  await expect(
                      nftMarketplaceAlice.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotOwner")
              })

              it("only allow to list items that are not listed", async function () {
                  await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  const error = `NftMarketplace__AlreadyListed("${basicNftContract.address}", ${TOKEN_ID})`
                  await expect(
                      nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(error)
              })
          })

          describe("Buy item", function () {
              it("only allow to buy items if the payment is correct", async function () {
                  await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketplace.buyItem(basicNftContract.address, TOKEN_ID)
                  ).to.be.revertedWith("PriceNotMet")
              })

              it("only allow to buy items if the payment is correct", async function () {
                  await expect(
                      nftMarketplace.buyItem(basicNftContract.address, TOKEN_ID)
                  ).to.be.revertedWith("NftMarketplace__NotListed")
              })

              it("emits an event when an item is bought", async function () {
                  await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                  expect(
                      await nftMarketplaceAlice.buyItem(basicNftContract.address, TOKEN_ID, {
                          value: PRICE,
                      })
                  ).to.emit("ItemBought")
                  const newOwner = await basicNftContract.ownerOf(TOKEN_ID)
                  const deployerBalance = await nftMarketplace.getProceeds(deployer.address)
                  assert(newOwner.toString() == Alice.address)
                  assert(deployerBalance.toString() == PRICE.toString())
              })
          })
      })
