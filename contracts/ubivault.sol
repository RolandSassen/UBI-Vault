pragma solidity ^0.5.7;
import "./../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PausableDestroyable.sol";
import "./../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
///@title UBIVault, version 0.2
///@author AXVECO B.V., commisioned by THINSIA
/**@notice
 * The UBIVault smart contract allows parties to fund the fault with money (Ether) and citizens to register and claim an UBI.
 * The vault makes a payout maximally once per weeks when AE/AC >= AB, where
 *  AE is 95% of the total deposited money (5% is for the vault's maintenanceFunds)
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
    uint256 public weiToDollarCent;
    uint256 public availableEther;
    uint256 public lastPayout;
    uint256 public minimumPeriod;
    uint256 public promisedEther;
    uint256[] public paymentsCycle;

    event LogMaintenanceFundsClaimed(address indexed caller, uint256 amount);
    event LogUseablePasswordCreated(bytes32 passwordHash);
    event LogUBICreated(uint256 adjustedWeiToDollarCent, uint256 totalamountOfBasicIncomeInWei, uint256 amountOfCitizens, uint8 amountOfBasicIncomeCanBeIncreased);
    event LogCitizenRegistered(address newCitizen);
    event LogPasswordUsed(bytes32 password, bytes32 passwordHash);
    event LogVaultSponsored(address payee, bytes32 message, uint256 amount);

    event LogUBIClaimed(address indexed caller, uint256 income, address indexed citizen);

    ///@dev we set the first value in the paymentsCycle array, because 0 is the default value for the rightFromPaymentCycle for all addresses.
    constructor(uint256 initialAB, uint256 initialMinimumPeriod, uint256 initialWeiToDollarCent) public {
        minimumPeriod = initialMinimumPeriod;
        weiToDollarCent = initialWeiToDollarCent;
        amountOfBasicIncome = initialAB;
        paymentsCycle.push(0);
    }

    ///@notice Allows citizens to claim their UBI which was made available since the last time they claimed it (or have registered, whichever is bigger)
    /**
     * @dev
     * increases the rightFromPaymentCycle for the caller (also increased in the function registerCitizen)
     * decreases the promisedEther (which is increased in the function createUBI)
    */
    function claimMaintenanceFunds(uint256 amount) public onlyOwner {
        require(amount <= getMaintenanceFunds());
        msg.sender.transfer(amount);
        emit LogMaintenanceFundsClaimed(msg.sender, amount);
    }

    function claimUBIOwner(address payable[] memory citizens) public onlyOwner {
        for(uint256 i = 0; i < citizens.length; i++) {
            claimUBI(citizens[i]);
        }
    }

    function claimUBIPublic() public {
        claimUBI(msg.sender);
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
    function createUBI(uint256 adjustedWeiToDollarCent) public onlyOwner {
        uint256 adjustedWeiToDollar = adjustedWeiToDollarCent.mul(100);
        // We only allow a fluctuation of 5% per UBI creation
        require(adjustedWeiToDollar >= weiToDollarCent.mul(95) && adjustedWeiToDollar <= weiToDollarCent.mul(105));
        require(lastPayout <= now - minimumPeriod);
        require(availableEther.div(weiToDollarCent).div(amountOfCitizens) >= amountOfBasicIncome);
        weiToDollarCent = adjustedWeiToDollarCent;
        uint256 totalamountOfBasicIncomeInWei = adjustedWeiToDollarCent.mul(amountOfBasicIncome).mul(amountOfCitizens);
        availableEther = availableEther.sub(totalamountOfBasicIncomeInWei);
        // if there is enough income available (7$)
        if(availableEther >= adjustedWeiToDollarCent.mul(700).mul(amountOfCitizens)) {
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
        promisedEther = promisedEther.add(totalamountOfBasicIncomeInWei);
        paymentsCycle.push(totalamountOfBasicIncomeInWei.div(amountOfCitizens));
        lastPayout = now;
        emit LogUBICreated(adjustedWeiToDollarCent, totalamountOfBasicIncomeInWei, amountOfCitizens, amountOfBasicIncomeCanBeIncreased);
    }

    function getMaintenanceFunds() public view returns(uint256) {
        return address(this).balance.sub(promisedEther).sub(availableEther);
    }

    function registerCitizenOwner(address newCitizen) public onlyOwner {
        require(newCitizen != address(0));
        registerCitizen(newCitizen);
    }

    function registerCitizenPublic(bytes32 password) public {
        bytes32 passwordHash = keccak256(abi.encodePacked(password));
        require(useablePasswordHashes[passwordHash] && !usedPasswordHashes[passwordHash]);
        usedPasswordHashes[passwordHash] = true;
        registerCitizen(msg.sender);
        emit LogPasswordUsed(password, passwordHash);
    }

    /**@notice
     * Increases the availableEther with 95% of the transfered value, the remainder is available for maintenanceFunds.
     * AE becomes available for the citizens in the next paymentsCycle
    */
    ///@dev availableEther is truncated (rounded down), the remainder becomes available for maintenanceFunds
    function sponsorVault(bytes32 message) public payable whenNotPaused {
        availableEther = availableEther.add(msg.value.mul(95) / 100);
        emit LogVaultSponsored(msg.sender, message, msg.value);
    }

    ///@notice Allows citizens to claim their UBI which was made available since the last time they claimed it (or have registered, whichever is bigger)
    /**
     * @dev
     * increases the rightFromPaymentCycle for the caller (also increased in the function registerCitizen)
     * decreases the promisedEther (which is increased in the function createUBI)
    */
    function claimUBI(address payable citizen) internal {
        require(rightFromPaymentCycle[citizen] != 0);
        uint256 incomeClaims = paymentsCycle.length - rightFromPaymentCycle[citizen];
        uint256 income;
        if(incomeClaims == 1) {
            income = paymentsCycle[paymentsCycle.length - 1];
        } else if(incomeClaims > 1) {
            for(uint256 index; index < incomeClaims; index++) {
                income = income.add(paymentsCycle[paymentsCycle.length - incomeClaims + index]);
            }
        } else {
            revert();
        }
        rightFromPaymentCycle[citizen] = paymentsCycle.length;
        promisedEther = promisedEther.sub(income);
        citizen.transfer(income);
        emit LogUBIClaimed(msg.sender, income, citizen);

    }

     /**@notice
     * Allows a person to register as a citizen in the UBIVault.
     * The citizen will have a claim on the AE from the next paymentsCycle onwards.
    */
    ///@dev Increases the variable rightFromPaymentCycle for a citizen (also increased in the function claimUBI)
    function registerCitizen(address newCitizen) internal {
        require(rightFromPaymentCycle[newCitizen] == 0);
        rightFromPaymentCycle[newCitizen] = paymentsCycle.length;
        amountOfCitizens++;
        emit LogCitizenRegistered(newCitizen);
    }

    function () external payable whenNotPaused {
        availableEther = availableEther.add(msg.value.mul(95) / 100);
        emit LogVaultSponsored(msg.sender, bytes32(0), msg.value);
    }
}


    // /**@notice
    //  * Gets the rightFromPaymentCycle for a citizen, which mentions from which cycle onwards a citizen can claim funds.
    //  * If a new UBI is available and the citizen has claimed this UBI, the rightFromPaymentCycle variable is updated for this specific citizen
    // */
    // ///@dev rightFromPaymentCycle increases for a citizen in the functions registerCitizen and claimUBI
    // function getRightFromPaymentsCycle(address citizen) public view returns(uint256) {
    //     return rightFromPaymentCycle[citizen];
    // }
    //  /**@notice
    //  * Gets the amountOfBasicIncome, which is the basic income available for every citizen during a paymentsCycle
    //  * The amountOfBasicIncome is now changeable in this version, but will be dynamically adjusted in future versions.
    // */
    // ///@dev the amountOfBasicIncome is set in the constructor
    // function getAmountOfBasicIncome() public view returns(uint256) {
    //     return amountOfBasicIncome;
    // }
    // ///@notice Gets the amount of citizens, which are all the citizens in the UBIVault among which the available income must be divided every paymentsCycle
    // ///@dev the amountOfCitizens increases in the function registerCitizen
    // function getAmountOfCitizens() public view returns(uint256) {
    //     return amountOfCitizens;
    // }
    // /** @notice
    //  * Gets the Available Ether (AE), which is 95% of the total amount of money deposited in the UBI Vault - all the UBI promised to citizens.
    //  * AE is the amount of Ether available to be distributed as UBI for the citizens in the next paymentsCycle
    // */
    // ///@dev AE increases in the function sponsorVault and decreases in the function createUBI
    // function getAvailableEther() public view returns(uint256) {
    //     return availableEther;
    // }
    // /** @notice
    //  * Gets the lastPayout, which is the time (in UNIX) when the function createUBI was last called.
    //  * lastPayout is needed because an UBI can be maximally distributed once a week.
    // */
    // ///@dev AE increases in the function sponsorVault and decreases in the function createUBI
    // function getLastPayout() public view returns(uint256) {
    //     return lastPayout;
    // }

 // ///@notice Gets the minimumPeriod, which is the minimum amount of time which must pass between every paymentsCycle
    // ///@dev the minimumPeriod is set in the constructor
    // function getMinimumPeriod() public view returns(uint256) {
    //     return minimumPeriod;
    // }
    // ///@notice Gets the total amount of promisedEther, which constitutes all Ether promised to the citizens, but not payed out yet.
    // ///@dev promisedEther is increased in the function createUBI and decreased in the function claimUBI
    // function getPromisedEther() public view returns(uint256) {
    //     return promisedEther;
    // }
    // ///@notice Gets the total amount of payments made by the UBIVault contract
    // ///@dev the length of the paymentsCycle array is increased in the function createUBI and in the constructor
    // function getTotalPaymentCycles() public view returns(uint256) {
    //     return paymentsCycle.length;
    // }
    // ///@notice Gets the AB which was available per citizen at a cycle
    // ///@dev the AB is set in the paymentsCycle array in the function createUBI and in the constructor
    // function getUBIAtCycle(uint256 position) public view returns(uint256) {
    //     return paymentsCycle[position];
    // }
