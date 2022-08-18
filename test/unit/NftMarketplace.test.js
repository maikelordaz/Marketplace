const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
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

          describe("Basic Nft contract functions", function () {
              it("checks the token URI", async function () {
                  const tokenURIexpected =
                      "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
                  const tokenCounter = await basicNft.getTokenCounter()
                  const tokenURI = await basicNft.tokenURI(0)
                  assert.equal(tokenURI, tokenURIexpected)
                  assert.equal(tokenCounter, "2")
              })
          })

          describe("NFT Marketplace contract functions", function () {
              describe("List item function", function () {
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

              describe("Update listing function", function () {
                  it("Revert if there is no price included", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      await expect(
                          nftMarketplace.updateListing(basicNftContract.address, TOKEN_ID, 0)
                      ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero")
                  })

                  it("Emit an event when the listed item is updated", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      const NEW_PRICE = ethers.utils.parseEther("0.2")
                      expect(
                          nftMarketplace.updateListing(
                              basicNftContract.address,
                              TOKEN_ID,
                              NEW_PRICE
                          )
                      ).to.emit("ItemListed")
                  })

                  it("only allow owners to update the list", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      const NEW_PRICE = ethers.utils.parseEther("0.2")
                      await expect(
                          nftMarketplaceAlice.updateListing(
                              basicNftContract.address,
                              TOKEN_ID,
                              NEW_PRICE
                          )
                      ).to.be.revertedWith("NftMarketplace__NotOwner")
                  })

                  it("only allow to update items that are already listed", async function () {
                      await expect(
                          nftMarketplace.updateListing(basicNftContract.address, TOKEN_ID, PRICE)
                      ).to.be.revertedWith("NftMarketplace__NotListed")
                  })

                  it("Update the price", async function () {
                      const NEW_PRICE = ethers.utils.parseEther("0.2")
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      await nftMarketplace.updateListing(
                          basicNftContract.address,
                          TOKEN_ID,
                          NEW_PRICE
                      )
                      const listing = await nftMarketplace.getListing(
                          basicNftContract.address,
                          TOKEN_ID
                      )
                      assert(listing.price.toString() == NEW_PRICE.toString())
                  })
              })

              describe("Cancel item function", function () {
                  it("Revert if it is not listed", async function () {
                      await expect(
                          nftMarketplace.cancelListing(basicNftContract.address, TOKEN_ID)
                      ).to.be.revertedWith("NftMarketplace__NotListed")
                  })

                  it("Only allow the owner to cancel", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      await expect(
                          nftMarketplaceAlice.cancelListing(basicNftContract.address, TOKEN_ID)
                      ).to.be.revertedWith("NftMarketplace__NotOwner")
                  })

                  it("Cancel the listing and emits an event", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      expect(
                          await nftMarketplace.cancelListing(basicNftContract.address, TOKEN_ID)
                      ).to.emit("ItemCanceled")
                      const listing = await nftMarketplace.getListing(
                          basicNftContract.address,
                          TOKEN_ID
                      )
                      assert(listing.price.toString() == "0")
                  })
              })

              describe("Buy item function", function () {
                  it("only allow to buy items if the payment is correct", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      await expect(
                          nftMarketplace.buyItem(basicNftContract.address, TOKEN_ID)
                      ).to.be.revertedWith("PriceNotMet")
                  })

                  it("revert if it is not listed", async function () {
                      await expect(
                          nftMarketplace.buyItem(basicNftContract.address, TOKEN_ID)
                      ).to.be.revertedWith("NftMarketplace__NotListed")
                  })

                  it("emits an event when an item is bought and transfer the token", async function () {
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

              describe("Withdraw proceeds function", function () {
                  it("Revert if there is no proceeds", async function () {
                      await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
                          "NftMarketplace__NoProceeds"
                      )
                  })

                  it("Withdraw the proceeds", async function () {
                      await nftMarketplace.listItem(basicNftContract.address, TOKEN_ID, PRICE)
                      await nftMarketplaceAlice.buyItem(basicNftContract.address, TOKEN_ID, {
                          value: PRICE,
                      })
                      const proceedsBefore = await nftMarketplace.getProceeds(deployer.address)
                      const balanceBefore = await deployer.getBalance()
                      const tx = await nftMarketplace.withdrawProceeds()
                      const txReceipt = await tx.wait(1)
                      const { gasUsed, effectiveGasPrice } = txReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)
                      const proceedsAfter = await nftMarketplace.getProceeds(deployer.address)
                      const balanceAfter = await deployer.getBalance()
                      assert(proceedsAfter.toString() == "0")
                      assert(
                          balanceAfter.add(gasCost).toString() ==
                              proceedsBefore.add(balanceBefore).toString()
                      )
                  })
              })
          })
      })
