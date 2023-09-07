// const {ethers} = require("hardhat")
// const {expect, assert} = require("chai")

// describe("RealEstate", function(){
//     let realestste, RealEstate 
//     beforeEach(async function () {
//         realestste = await ethers.getContractFactory('RealEstate')
//         RealEstate = await realestste.deploy()
//     })
//     it("property should be for sale", async function() {

        
//     const status = await RealEstate.property()
//     const expectedstatus = 'true'
//     assert.equal(status.toString(),expectedstatus)
// })
//     })
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate", function () {
  let RealEstate;
  let realEstate;
  let owner;
  let buyer;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.waitForDeployment();
  });

  it("should list a property for sale", async function () {
    const propertyId = 1;
    const propertyPrice = ethers.utils.parseEther("1.0");
    const propertyName = "Test Property";
    const propertyDescription = "This is a test property";
    const propertyLocation = "Test Location";

    await realEstate.listPropertyForSale(
      propertyId,
      propertyPrice,
      propertyName,
      propertyDescription,
      propertyLocation
    );

    const property = await realEstate.properties(propertyId);
    expect(property.owner).to.equal(owner.address);
    expect(property.forSale).to.equal(true);
    expect(property.name).to.equal(propertyName);
    expect(property.description).to.equal(propertyDescription);
    expect(property.location).to.equal(propertyLocation);
    expect(property.price).to.equal(propertyPrice);
  });

  it("should require a property to be listed for sale before buying", async function () {
    const propertyId = 2;
    const propertyPrice = ethers.utils.parseEther("1.0");

    await expect(
      realEstate.connect(buyer).buyProperty(propertyId, {
        value: propertyPrice,
      })
    ).to.be.revertedWith("Property is not for sale");
  });

  it("should allow buying a property", async function () {
    const propertyId = 3;
    const propertyPrice = ethers.utils.parseEther("1.0");

    await realEstate.listPropertyForSale(
      propertyId,
      propertyPrice,
      "Property to Buy",
      "Description",
      "Location"
    );

    const initialSellerBalance = await owner.getBalance();

    await realEstate.connect(buyer).buyProperty(propertyId, {
      value: propertyPrice,
    });

    const property = await realEstate.properties(propertyId);
    expect(property.owner).to.equal(buyer.address);
    expect(property.forSale).to.equal(false);

    const newSellerBalance = await owner.getBalance();
    expect(newSellerBalance).to.be.gt(initialSellerBalance);
  });

  it("should prevent buying a property with insufficient funds", async function () {
    const propertyId = 4;
    const propertyPrice = ethers.utils.parseEther("2.0");

    await realEstate.listPropertyForSale(
      propertyId,
      propertyPrice,
      "Expensive Property",
      "Description",
      "Location"
    );

    await expect(
      realEstate.connect(buyer).buyProperty(propertyId, {
        value: ethers.utils.parseEther("1.0"),
      })
    ).to.be.revertedWith("insufficient fund");
  });
});
