// const Web3 = require("web3");
// const web3 = new Web3();
let BN = web3.utils.BN

var UBIVault = artifacts.require("UBIVault");

let initialAB = 700 // 700 euro cent = €7
let initialMinimumPeriod = 120 //  2 minutes, should be 604800 (60*60*24*7) in production
let initialWeiToEuroCent = new BN(46294153048469) // ether to euro exchange rate in cents to wei
module.exports = function(deployer, network, accounts) {
  deployer.deploy(UBIVault, initialAB, initialMinimumPeriod, initialWeiToEuroCent, accounts[0])
}
