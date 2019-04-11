const Web3 = require("web3");
const web3 = new Web3();
let BN = web3.utils.BN

var Ubivault = artifacts.require("./ubivault.sol");

let initialAB = 700 // 700 dollar cent = 7$
let initialMinimumPeriod = 120 //  2 minutes
let initialWeiToDollarCent = new BN(web3.utils.toWei('16948'))
console.log(initialWeiToDollarCent)
module.exports = function(deployer, network, accounts) {
  deployer.deploy(Ubivault, initialAB, initialMinimumPeriod, initialWeiToDollarCent)
}
