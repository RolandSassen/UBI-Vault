pragma solidity ^0.5.7;
import "./../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PausableDestroyable.sol";
import "./../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
///@title UBIVault, version 0.2
///@author AXVECO B.V., commisioned by THINSIA
/**@notice
 * The UBIVault smart contract allows parties to fund the fault with money (Ether) and citizens to register and claim an UBI.
 * The vault makes a payout maximally once per weeks when AE/AC >= AB, where
 *  AE is 95% of the total deposited money (5% is for the maintenancePool)
 *  AC is the amountOfCitizens
 *  AB is Amount of AmountOfBasicIncome
*/
contract UBIVault is Ownable, PausableDestroyable {

    using SafeMath for uint256;

    mapping(address => uint256) public rightFromPaymentCycle;
    mapping(bytes32 => bool) public useablePasswordHashes;
    mapping(bytes32 => bool) public usedPasswordHashes;
    uint8 public amountOfBasicIncomeCanBeIncreased;
    uint256 public amountOfBasicIncome;
    uint256 public amountOfCitizens;
    uint256 public euroCentInWei;
    uint256 public availableEther;
    address payable public maintenancePool;
    uint256 public minimumPeriod;
    uint256 public promisedEther;
    uint256 lastPayout;
    uint256[] public paymentsCycle;

    event LogUseablePasswordCreated(bytes32 passwordHash);
    event LogUBICreated(uint256 adjustedEuroCentInWei, uint256 totalamountOfBasicIncomeInWei, uint256 amountOfCitizens, uint8 amountOfBasicIncomeCanBeIncreased, uint256 paymentsCycle);
    event LogCitizenRegistered(address newCitizen);
    event LogPasswordUsed(bytes32 password, bytes32 passwordHash);
    event LogVaultSponsored(address payee, bytes32 message, uint256 amount);
    event LogUBIClaimed(address indexed caller, uint256 income, address indexed citizen);

    ///@dev we set the first value in the paymentsCycle array, because 0 is the default value for the rightFromPaymentCycle for all addresses.
    constructor(
        uint256 initialAB,
        uint256 initialMinimumPeriod,
        uint256 initialEuroCentInWei,
        address payable _maintenancePool
    ) public {
        minimumPeriod = initialMinimumPeriod;
        euroCentInWei = initialEuroCentInWei;
        amountOfBasicIncome = initialAB;
        maintenancePool = _maintenancePool;
        paymentsCycle.push(0);
    }

    function claimUBIOwner(address payable[] memory citizens, bool onlyOne) public onlyOwner returns(bool) {
        bool allRequestedCitizensGotPayout = true;
        for(uint256 i = 0; i < citizens.length; i++) {
            if(!claimUBI(citizens[i], onlyOne)) {
              allRequestedCitizensGotPayout = false;
            }
        }
        return allRequestedCitizensGotPayout;
    }

    function claimUBIPublic(bool onlyOne) public {
        require(claimUBI(msg.sender, onlyOne), "There is no claimable UBI available for your account");
    }

    //TODO: add description
    function createUseablePasswords(bytes32[] memory _useablePasswordHashes) public onlyOwner {
        for(uint256 i = 0; i < _useablePasswordHashes.length; i++) {
            bytes32 usablePasswordHash = _useablePasswordHashes[i];
            require(!useablePasswordHashes[usablePasswordHash], "One of your useablePasswords was already registered");
            useablePasswordHashes[usablePasswordHash] = true;
            emit LogUseablePasswordCreated(usablePasswordHash);
        }
    }

    /**@notice
     * Allows anybody to request making an UBI available for the citizens when the lastPayout is more than one week ago and
     * AE / AC >= AB
    */
    /**dev
     * decreases the variable availableEther (which is increased in the function sponsorVault)
     * increases the variable promisedEther (which is decreased in the function claimUBI)
     * increases the lastPayout variable to the current time
     * sets the ether promised during this cycle as a new value in the paymentsCycle array (which is also set in the constructor)
    */
    function createUBI(uint256 adjustedEuroCentInWei) public onlyOwner {
//        uint256 adjustedDollarInWei = adjustedEuroCentInWei.mul(100);
        uint256 totalamountOfBasicIncomeInWei = adjustedEuroCentInWei.mul(amountOfBasicIncome).mul(amountOfCitizens);
        // We only allow a fluctuation of 5% per UBI creation
//        require(adjustedDollarInWei >= euroCentInWei.mul(95) && adjustedDollarInWei <= euroCentInWei.mul(105), "The exchange rate can only fluctuate +- 5% per createUBI call");
        require(lastPayout <= now - minimumPeriod, "You should wait the required time in between createUBI calls");
        require(availableEther.div(adjustedEuroCentInWei).div(amountOfCitizens) >= amountOfBasicIncome, "There are not enough funds in the UBI contract to sustain another UBI");
        euroCentInWei = adjustedEuroCentInWei;
        availableEther = availableEther.sub(totalamountOfBasicIncomeInWei);
        promisedEther = promisedEther.add(totalamountOfBasicIncomeInWei);

        paymentsCycle.push(adjustedEuroCentInWei.mul(amountOfBasicIncome));
        lastPayout = now;

        // if there is enough income available (7$)
        if(availableEther >= adjustedEuroCentInWei.mul(700).mul(amountOfCitizens)) {
            // and we increased it twice before,
            if(amountOfBasicIncomeCanBeIncreased == 2) {
                amountOfBasicIncomeCanBeIncreased = 0;
                amountOfBasicIncome = amountOfBasicIncome.add(700);
            // and we did not increase it twice before
            } else {
                amountOfBasicIncomeCanBeIncreased++;
            }
        // if there is not enough income available and we increased the counter prior to this function call
        } else if(amountOfBasicIncomeCanBeIncreased != 0) {
            amountOfBasicIncomeCanBeIncreased == 0;
        }
        emit LogUBICreated(adjustedEuroCentInWei, totalamountOfBasicIncomeInWei, amountOfCitizens, amountOfBasicIncomeCanBeIncreased, paymentsCycle.length - 1);
    }

    function registerCitizenOwner(address newCitizen) public onlyOwner {
        require(newCitizen != address(0) , "NewCitizen cannot be the 0 address");
        registerCitizen(newCitizen);
    }

    function registerCitizenPublic(bytes32 password) public {
        bytes32 passwordHash = keccak256(abi.encodePacked(password));
        require(useablePasswordHashes[passwordHash] && !usedPasswordHashes[passwordHash], "Password is not known or already used");
        usedPasswordHashes[passwordHash] = true;
        registerCitizen(msg.sender);
        emit LogPasswordUsed(password, passwordHash);
    }

    /**@notice
     * Increases the availableEther with 95% of the transfered value, the remainder is available for maintenancePool.
     * AE becomes available for the citizens in the next paymentsCycle
    */
    ///@dev availableEther is truncated (rounded down), the remainder becomes available for maintenancePool
    function sponsorVault(bytes32 message) public payable whenNotPaused {
        moneyReceived(message);
    }

    ///@notice Allows citizens to claim their UBI which was made available since the last time they claimed it (or have registered, whichever is bigger)
    /**
     * @dev
     * increases the rightFromPaymentCycle for the caller (also increased in the function registerCitizen)
     * decreases the promisedEther (which is increased in the function createUBI)
    */
    function claimUBI(address payable citizen, bool onlyOne) internal returns(bool) {
        require(rightFromPaymentCycle[citizen] != 0, "Citizen not registered");
        uint256 incomeClaims = paymentsCycle.length - rightFromPaymentCycle[citizen];
        uint256 income;
        uint256 paymentsCycleLength = paymentsCycle.length;
        if(onlyOne && incomeClaims > 0) {
          income = paymentsCycle[paymentsCycleLength - incomeClaims];
        } else if(incomeClaims == 1) {
            income = paymentsCycle[paymentsCycleLength - 1];
        } else if(incomeClaims > 1) {
            for(uint256 index; index < incomeClaims; index++) {
                income = income.add(paymentsCycle[paymentsCycleLength - incomeClaims + index]);
            }
        } else {
            return false;
        }
        rightFromPaymentCycle[citizen] = paymentsCycleLength;
        promisedEther = promisedEther.sub(income);
        citizen.transfer(income);
        emit LogUBIClaimed(msg.sender, income, citizen);
        return true;

    }

    function moneyReceived(bytes32 message) internal {
      uint256 increaseInAvailableEther = msg.value.mul(95) / 100;
      availableEther = availableEther.add(increaseInAvailableEther);
      maintenancePool.transfer(msg.value - increaseInAvailableEther);
      emit LogVaultSponsored(msg.sender, message, msg.value);
    }

     /**@notice
     * Allows a person to register as a citizen in the UBIVault.
     * The citizen will have a claim on the AE from the next paymentsCycle onwards.
    */
    ///@dev Increases the variable rightFromPaymentCycle for a citizen (also increased in the function claimUBI)
    function registerCitizen(address newCitizen) internal {
        require(rightFromPaymentCycle[newCitizen] == 0, "Citizen already registered");
        rightFromPaymentCycle[newCitizen] = paymentsCycle.length;
        amountOfCitizens++;
        emit LogCitizenRegistered(newCitizen);
    }

    function () external payable whenNotPaused {
        moneyReceived(bytes32(0));
    }
}
