import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EcoCollect", function () {
  async function deployContract() {
    const [owner, company1, company2, picker1, picker2] = await hre.ethers.getSigners();

    const totalSupply = hre.ethers.parseEther("1000000");
    const EcoToken = await hre.ethers.getContractFactory("EcoToken");
    const ecoToken = await EcoToken.deploy("EcoToken", "ECO",totalSupply);  

    const EcoCollect = await hre.ethers.getContractFactory("EcoCollect");
    const ecoCollect = await EcoCollect.deploy(ecoToken, owner);

    return { 
      ecoCollect, 
      ecoToken, 
      owner, 
      company1, 
      company2, 
      picker1, 
      picker2,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { ecoCollect, ecoToken, owner } = await loadFixture(deployContract);
      expect(await ecoCollect.connect(owner).ecoTokenAddress()).to.equal(ecoToken);
    });
  });

  describe("Company Registration", function () {
    it("Should register a new company successfully", async function () {
      const { ecoCollect, company1 } = await loadFixture(deployContract);
      
      await expect(ecoCollect.connect(company1).registerCompany(
        "EcoCompany1",
        100, 
        10,  
        true 
      )).to.emit(ecoCollect, "CompanyRegistered")
        .withArgs(company1.address, "EcoCompany1", 100, 10, true);

      const company = await ecoCollect.getCompany(company1.address);
      expect(company.name).to.equal("EcoCompany1");
      expect(company.minWeightRequirement).to.equal(100);
      expect(company.maxPricePerKg).to.equal(10);
      expect(company.active).to.equal(true);
    });

    it("Should revert when registering with invalid parameters", async function () {
      const { ecoCollect, company1 } = await loadFixture(deployContract);
      
      await expect(ecoCollect.connect(company1).registerCompany(
        "",    
        100,
        10,
        true
      )).to.be.revertedWithCustomError(ecoCollect, "EmptyCompanyName");

      await expect(ecoCollect.connect(company1).registerCompany(
        "EcoCompany1",
        0,    
        10,
        true
      )).to.be.revertedWithCustomError(ecoCollect, "InvalidMinWeight");

      await expect(ecoCollect.connect(company1).registerCompany(
        "EcoCompany1",
        100,
        0,    
        true
      )).to.be.revertedWithCustomError(ecoCollect, "InvalidPrice");
    });

    it("Should prevent duplicate registration", async function () {
      const { ecoCollect, company1 } = await loadFixture(deployContract);
      
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      
      await expect(ecoCollect.connect(company1).registerCompany(
        "EcoCompany1",
        100,
        10,
        true
      )).to.be.revertedWithCustomError(ecoCollect, "AlreadyRegistered");
    });
  });

  describe("Picker Registration", function () {
    it("Should register a new picker successfully", async function () {
      const { ecoCollect, picker1 } = await loadFixture(deployContract);
      
      await expect(ecoCollect.connect(picker1).registerPicker(
        "John Doe",
        "john@example.com"
      )).to.emit(ecoCollect, "PickerRegistered")
        .withArgs(picker1.address, "John Doe", "john@example.com");

      const picker = await ecoCollect.getPicker(picker1.address);
      expect(picker.name).to.equal("John Doe");
      expect(picker.email).to.equal("john@example.com");
      expect(picker.weightDeposited).to.equal(0);
    });

    it("Should revert when registering with invalid parameters", async function () {
      const { ecoCollect, picker1 } = await loadFixture(deployContract);
      
      await expect(ecoCollect.connect(picker1).registerPicker(
        "",
        "john@example.com"
      )).to.be.revertedWithCustomError(ecoCollect, "EmptyPickerName");

      await expect(ecoCollect.connect(picker1).registerPicker(
        "John Doe",
        ""
      )).to.be.revertedWithCustomError(ecoCollect, "InvalidEmail");
    });
  });

  describe("Plastic Deposit and Validation", function () {
    it("Should allow picker to deposit plastic", async function () {
      const { ecoCollect, company1, picker1 } = await loadFixture(deployContract);
      
      // Register company and picker
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      await ecoCollect.connect(picker1).registerPicker("John Doe", "john@example.com");

      // Deposit plastic
      await expect(ecoCollect.connect(picker1).depositPlastic(
        company1.address,
        150 // weight
      )).to.emit(ecoCollect, "PlasticDeposited")
        .withArgs(picker1.address, company1.address, 150);

      const picker = await ecoCollect.getPicker(picker1.address);
      expect(picker.weightDeposited).to.equal(150);
    });

    it("Should allow company to validate plastic deposit", async function () {
      const { ecoCollect, company1, picker1 } = await loadFixture(deployContract);
      
      // Register company and picker
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      await ecoCollect.connect(picker1).registerPicker("John Doe", "john@example.com");

      // Deposit plastic
      await ecoCollect.connect(picker1).depositPlastic(company1.address, 150);
      const transactionId = 0; // First transaction

      // Validate plastic
      await expect(ecoCollect.connect(company1).validatePlastic(transactionId))
        .to.emit(ecoCollect, "PlasticValidated")
        .withArgs(company1.address, transactionId);
    });
  });

  describe("Payment Processing", function () {
    it("Should process payment correctly", async function () {
      const { ecoCollect, ecoToken, company1, picker1 } = await loadFixture(deployContract);
      
      // Register company and picker
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      await ecoCollect.connect(picker1).registerPicker("John Doe", "john@example.com");

      // Deposit plastic
      await ecoCollect.connect(picker1).depositPlastic(company1.address, 150);
      const transactionId = 0;

      // Validate plastic
      await ecoCollect.connect(company1).validatePlastic(transactionId);

      // Approve token transfer
      const paymentAmount = 150 * 10; // weight * price
      await ecoToken.connect(company1).approve(ecoCollect.address, paymentAmount);

      // Process payment
      await expect(ecoCollect.connect(company1).payPicker(transactionId))
        .to.emit(ecoCollect, "PickerPaid")
        .withArgs(company1.address, picker1.address, paymentAmount);

      // Check balances
      const pickerBalance = await ecoToken.balanceOf(picker1.address);
      expect(pickerBalance).to.equal(paymentAmount);
    });

    it("Should revert payment with insufficient allowance", async function () {
      const { ecoCollect, company1, picker1 } = await loadFixture(deployContract);
      
      // Register company and picker
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      await ecoCollect.connect(picker1).registerPicker("John Doe", "john@example.com");

      // Deposit plastic
      await ecoCollect.connect(picker1).depositPlastic(company1.address, 150);
      const transactionId = 0;

      // Validate plastic
      await ecoCollect.connect(company1).validatePlastic(transactionId);

      // Try to pay without approval
      await expect(ecoCollect.connect(company1).payPicker(transactionId))
        .to.be.revertedWithCustomError(ecoCollect, "InsufficientAllowance");
    });
  });

  describe("Getters and Utility Functions", function () {
    it("Should return correct company count", async function () {
      const { ecoCollect, company1, company2 } = await loadFixture(deployContract);
      
      expect(await ecoCollect.getRegisteredCompanyCount()).to.equal(0);

      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      expect(await ecoCollect.getRegisteredCompanyCount()).to.equal(1);

      await ecoCollect.connect(company2).registerCompany("EcoCompany2", 100, 10, true);
      expect(await ecoCollect.getRegisteredCompanyCount()).to.equal(2);
    });

    it("Should return all company addresses", async function () {
      const { ecoCollect, company1, company2 } = await loadFixture(deployContract);
      
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      await ecoCollect.connect(company2).registerCompany("EcoCompany2", 100, 10, true);

      const addresses = await ecoCollect.getAllCompanyAddresses();
      expect(addresses).to.have.lengthOf(2);
      expect(addresses).to.include(company1.address);
      expect(addresses).to.include(company2.address);
    });

    it("Should return picker transactions", async function () {
      const { ecoCollect, company1, picker1 } = await loadFixture(deployContract);
      
      await ecoCollect.connect(company1).registerCompany("EcoCompany1", 100, 10, true);
      await ecoCollect.connect(picker1).registerPicker("John Doe", "john@example.com");

      await ecoCollect.connect(picker1).depositPlastic(company1.address, 150);
      
      const transactions = await ecoCollect.getPickerTransactions(picker1.address);
      expect(transactions).to.have.lengthOf(1);
      expect(transactions[0].weight).to.equal(150);
      expect(transactions[0].companyAddress).to.equal(company1.address);
    });
  });
});