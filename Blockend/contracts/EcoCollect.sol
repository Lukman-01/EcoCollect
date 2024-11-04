// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EcoToken.sol";

contract EcoCollect {
    address public owner;
    address public ecoTokenAddress;
    address[] public companyAddresses;
    address[] public pickerAddresses;
    mapping(address => Company) public companies;
    mapping(address => Picker) public pickers;
    uint256 public totalTransactions;
    mapping(uint256 => Transaction) public transactions;
    bool private locked;

    error OnlyRegisteredCompany();
    error OnlyActiveCompany();
    error OnlyRegisteredPicker();
    error TransactionNotExist();
    error TransactionNotApproved();
    error ZeroAddress();
    error AlreadyRegistered();
    error EmptyCompanyName();
    error InvalidPrice();
    error InvalidMinWeight();
    error EmptyPickerName();
    error InvalidEmail();
    error InvalidWeight();
    error CompanyInactive();
    error WeightBelowMinimum();
    error TransactionBelongsToOtherCompany();
    error TransactionAlreadyApproved();
    error InsufficientAllowance();
    error InsufficientBalance();
    error TransferFailed();
    error ReentrantCall();

    constructor(address _ecoTokenAddress, address _owner) {
        if (_ecoTokenAddress == address(0)) revert ZeroAddress();
        _owner = msg.sender;
        totalTransactions = 0;
        ecoTokenAddress = _ecoTokenAddress;
    }

    struct Company {
        address companyAddress;
        string name;
        uint256 minWeightRequirement;
        uint256 maxPricePerKg;
        bool active;
    }

    struct Picker {
        address pickerAddress;
        string name;
        string email;
        uint256 weightDeposited;
        uint256[] transactions;
    }

    struct Transaction {
        uint256 id;
        address companyAddress;
        address pickerAddress;
        uint256 weight;
        uint256 price;
        bool isApproved;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert("Only owner allowed");
        }
        _;
    }

    modifier noReentrancy() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    function _onlyCompany() private view {
        if (companies[msg.sender].maxPricePerKg == 0) revert OnlyRegisteredCompany();
    }

    function _onlyActiveCompany() private view {
        if (!companies[msg.sender].active) revert OnlyActiveCompany();
    }

    function _onlyPicker() private view {
        if (bytes(pickers[msg.sender].name).length == 0) revert OnlyRegisteredPicker();
    }

    function _transactionExists(uint256 _transactionId) private view {
        if (transactions[_transactionId].price == 0) revert TransactionNotExist();
    }

    function _transactionApproved(uint256 _transactionId) private view {
        if (!transactions[_transactionId].isApproved) revert TransactionNotApproved();
    }

    event CompanyRegistered(
        address indexed companyAddress,
        string name,
        uint256 minWeightRequirement,
        uint256 maxPricePerKg,
        bool active
    );
    event CompanyEdited(
        address indexed companyAddress,
        string name,
        uint256 minWeightRequirement,
        uint256 maxPricePerKg,
        bool active
    );
    event CompanyNameUpdated(address indexed companyAddress, string newName);
    event CompanyMinWeightRequirementUpdated(
        address indexed companyAddress,
        uint256 newMinWeightRequirement
    );
    event CompanyMaxPricePerKgUpdated(
        address indexed companyAddress,
        uint256 newMaxPricePerKg
    );
    event CompanyActiveStatusUpdated(
        address indexed companyAddress,
        bool newActiveStatus
    );
    event PickerRegistered(
        address indexed pickerAddress,
        string name,
        string email
    );
    event PickerEdited(
        address indexed pickerAddress,
        string name,
        string email
    );
    event PickerNameUpdated(address indexed pickerAddress, string newName);
    event PickerEmailUpdated(address indexed pickerAddress, string newEmail);
    event PlasticDeposited(
        address indexed pickerAddress,
        address indexed companyAddress,
        uint256 weight
    );
    event PlasticValidated(
        address indexed companyAddress,
        uint256 transactionId
    );
    event PickerPaid(address sender, address recipient, uint256 amount);

    function balanceOf() public view returns (uint256) {
        return EcoToken(ecoTokenAddress).balanceOf(msg.sender);
    }

    function registerCompany(
        string memory _name,
        uint256 _minWeightRequirement,
        uint256 _maxPricePerKg,
        bool _active
    ) public returns (bool success) {
        if (companies[msg.sender].minWeightRequirement != 0) revert AlreadyRegistered();
        if (bytes(_name).length == 0) revert EmptyCompanyName();
        if (_maxPricePerKg == 0) revert InvalidPrice();
        if (_minWeightRequirement == 0) revert InvalidMinWeight();

        Company memory newCompany = Company(
            msg.sender,
            _name,
            _minWeightRequirement,
            _maxPricePerKg,
            _active
        );
        companies[msg.sender] = newCompany;
        companyAddresses.push(msg.sender);
        emit CompanyRegistered(
            msg.sender,
            _name,
            _minWeightRequirement,
            _maxPricePerKg,
            _active
        );
        return true;
    }

    function getRegisteredCompanyCount() public view returns (uint256 count) {
        return companyAddresses.length;
    }

    function editCompany(
        string memory _name,
        uint256 _minWeightRequirement,
        uint256 _maxPricePerKg,
        bool _active
    ) public returns (bool success) {
        _onlyCompany();
        if (bytes(_name).length == 0) revert EmptyCompanyName();
        if (_maxPricePerKg == 0) revert InvalidPrice();
        if (_minWeightRequirement == 0) revert InvalidMinWeight();

        Company storage company = companies[msg.sender];
        company.name = _name;
        company.minWeightRequirement = _minWeightRequirement;
        company.maxPricePerKg = _maxPricePerKg;
        company.active = _active;
        emit CompanyEdited(
            msg.sender,
            _name,
            _minWeightRequirement,
            _maxPricePerKg,
            _active
        );
        return true;
    }

    function updateCompanyName(string memory _name) public {
        _onlyCompany();
        if (bytes(_name).length == 0) revert EmptyCompanyName();
        
        Company storage company = companies[msg.sender];
        company.name = _name;
        emit CompanyNameUpdated(msg.sender, _name);
    }

    function updateCompanyMinWeightRequirement(uint256 _minWeightRequirement) public {
        _onlyCompany();
        if (_minWeightRequirement == 0) revert InvalidMinWeight();
        
        Company storage company = companies[msg.sender];
        company.minWeightRequirement = _minWeightRequirement;
        emit CompanyMinWeightRequirementUpdated(msg.sender, _minWeightRequirement);
    }

    function updateCompanyMaxPricePerKg(uint256 _maxPricePerKg) public {
        _onlyCompany();
        if (_maxPricePerKg == 0) revert InvalidPrice();
        
        Company storage company = companies[msg.sender];
        company.maxPricePerKg = _maxPricePerKg;
        emit CompanyMaxPricePerKgUpdated(msg.sender, _maxPricePerKg);
    }

    function updateCompanyActiveStatus(bool _active) public {
        _onlyCompany();
        Company storage company = companies[msg.sender];
        company.active = _active;
        emit CompanyActiveStatusUpdated(msg.sender, _active);
    }

    function registerPicker(
        string memory _name,
        string memory _email
    ) public returns (bool success) {
        if (bytes(_name).length == 0) revert EmptyPickerName();
        if (bytes(_email).length == 0) revert InvalidEmail();
        if (bytes(pickers[msg.sender].name).length != 0) revert AlreadyRegistered();

        Picker memory newPicker = Picker(
            msg.sender,
            _name,
            _email,
            0,
            new uint256[](0)
        );
        pickers[msg.sender] = newPicker;
        pickerAddresses.push(msg.sender);
        emit PickerRegistered(msg.sender, _name, _email);
        return true;
    }

    function getPicker(address _address) public view returns (Picker memory) {
        return pickers[_address];
    }

    function getCompany(address _address) public view returns (Company memory) {
        return companies[_address];
    }

    function getRegisteredPickerCount() public view returns (uint256 count) {
        return pickerAddresses.length;
    }

    function editPicker(
        string memory _name,
        string memory _email
    ) public returns (bool success) {
        _onlyPicker();
        if (bytes(_name).length == 0) revert EmptyPickerName();
        if (bytes(_email).length == 0) revert InvalidEmail();

        Picker storage existingPicker = pickers[msg.sender];
        existingPicker.name = _name;
        existingPicker.email = _email;
        emit PickerEdited(msg.sender, _name, _email);
        return true;
    }

    function updatePickerName(string memory _name) public {
        _onlyPicker();
        if (bytes(_name).length == 0) revert EmptyPickerName();
        
        Picker storage picker = pickers[msg.sender];
        picker.name = _name;
        emit PickerNameUpdated(msg.sender, _name);
    }

    function updatePickerEmail(string memory _email) public {
        _onlyPicker();
        if (bytes(_email).length == 0) revert InvalidEmail();
        
        Picker storage picker = pickers[msg.sender];
        picker.email = _email;
        emit PickerEmailUpdated(msg.sender, _email);
    }

    function depositPlastic(
        address _companyAddress,
        uint256 _weight
    ) public returns (uint256 transactionId) {
        _onlyPicker();
        if (_weight == 0) revert InvalidWeight();
        if (!companies[_companyAddress].active) revert CompanyInactive();
        if (_weight < companies[_companyAddress].minWeightRequirement) revert WeightBelowMinimum();

        Transaction memory newTransaction = Transaction(
            totalTransactions,
            _companyAddress,
            msg.sender,
            _weight,
            companies[_companyAddress].maxPricePerKg,
            false
        );
        transactions[totalTransactions] = newTransaction;
        
        Picker storage existingPicker = pickers[msg.sender];
        existingPicker.weightDeposited = existingPicker.weightDeposited + _weight;
        existingPicker.transactions.push(totalTransactions);
        
        totalTransactions++;
        emit PlasticDeposited(msg.sender, _companyAddress, _weight);
        return newTransaction.id;
    }

    function validatePlastic(uint256 _transactionId) public returns (bool success) {
        _onlyActiveCompany();
        _transactionExists(_transactionId);
        if (transactions[_transactionId].companyAddress != msg.sender) {
            revert TransactionBelongsToOtherCompany();
        }
        if (transactions[_transactionId].isApproved) revert TransactionAlreadyApproved();
        
        transactions[_transactionId].isApproved = true;
        emit PlasticValidated(msg.sender, _transactionId);
        return true;
    }

    function payPicker(uint256 _transactionId) public noReentrancy returns (bool success) {
        _transactionApproved(_transactionId);
        Transaction storage transaction = transactions[_transactionId];
        if (transaction.companyAddress != msg.sender) {
            revert TransactionBelongsToOtherCompany();
        }

        uint256 amount = transaction.weight * transaction.price;
        EcoToken ecoToken = EcoToken(ecoTokenAddress);
        
        uint256 allowance = ecoToken.allowance(msg.sender, address(this));
        if (allowance < amount) revert InsufficientAllowance();

        uint256 balance = ecoToken.balanceOf(msg.sender);
        if (balance < amount) revert InsufficientBalance();

        // Mark transaction as processed before transfer to prevent reentrancy
        transaction.isApproved = false;

        bool transferSuccess = ecoToken.transferFrom(
            msg.sender,
            transaction.pickerAddress,
            amount
        );

        if (!transferSuccess) revert TransferFailed();

        emit PickerPaid(msg.sender, transaction.pickerAddress, amount);
        return true;
    }

    function getAllCompanyAddresses() public view returns (address[] memory) {
        return companyAddresses;
    }

    function getAllCompanies() public view returns (Company[] memory) {
        uint256 length = companyAddresses.length;
        Company[] memory allCompanies = new Company[](length);

        for (uint256 i = 0; i < length; i++) {
            address companyAddress = companyAddresses[i];
            allCompanies[i] = companies[companyAddress];
        }

        return allCompanies;
    }

    function getAllPickerAddresses() public view returns (address[] memory) {
        return pickerAddresses;
    }

    function getPickerTransactions(address _pickerAddress) public view returns (Transaction[] memory) {
        Picker storage picker = pickers[_pickerAddress];
        uint256 length = picker.transactions.length;
        Transaction[] memory pickerTransactions = new Transaction[](length);

        for (uint256 i = 0; i < length; i++) {
            pickerTransactions[i] = transactions[picker.transactions[i]];
        }

        return pickerTransactions;
    }
}