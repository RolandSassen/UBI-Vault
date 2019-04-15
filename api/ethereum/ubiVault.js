let helpers = require("./helpers.js");
require('dotenv').config();
const web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");

// environment variables
let infurakey = process.env.INFURAKEY
let mnemonic = process.env.MNEMONIC

//Infura HttpProvider Endpoint
var web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/" + infurakey));

// wallet provider
var provider = new HDWalletProvider(mnemonic, "http://localhost:8545");


// ubi-vault instantiation
let ubiVault_artifacts = require( './../../build/contracts/UBIVault.json');
let scAddress = Object.values(ubiVault_artifacts.networks)[0].address
// only works if the UBIVault.json is deployed to just one network.
let deployedToNetwork = Object.keys(ubiVault_artifacts.networks)[0]
let fromAddress = provider.addresses[0];
var privateKey = '0x' + provider.wallets[fromAddress]._privKey.toString('hex')
var contractInstance = new web3js.eth.Contract(ubiVault_artifacts.abi,scAddress);
var internalTXCount;

// we keep track of both an internalTXCount => incremented when this module performs a TX and an externalTXCount (incremented by web3) because the externalTXCount might not always be updated timely and create errors
async function getTXCount() {
  let externalTXCount = await web3js.eth.getTransactionCount(fromAddress)
  let currentInternalTXCount = internalTXCount;
  internalTXCount++;
  return internalTXCount >= externalTXCount ? currentInternalTXCount : externalTXCount
}

module.exports = {

  createUBI: async function (adjustedWeiToDollarCent) {
    try {
      let dollarCentInWei = await helpers.getDollarCentInWei();
      let encoded = contractInstance.methods.createUBI(dollarCentInWei).encodeABI()

      var tx = {
        nonce: web3js.utils.toHex(await getTXCount()),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: contractInstance.methods.createUBI(dollarCentInWei).estimateGas(),
        gasPrice: web3js.utils.tooHex(await web3js.eth.getGasPrice()),
        value: 0,
        chainId: web3js.utils.toHex(deployedToNetwork)
      }

      let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey);
      let signedRawTransaction = signedTransaction.rawTransaction

      // we return a web3 promiEvent, Expected to be able to do .once('receipt') on this.
      return web3js.eth.sendSignedTransaction(signed.rawTransaction)
    }
    catch (err) {
      throw("Error in createUBI: ", err);
    }
  },

  registerCitizenOwner: async function(citizen) {
    console.log('im here')
    try {
      console.log('1')
      let dollarCentInWei = await helpers.getDollarCentInWei();
      console.log(dollarCentInWei)
      let encoded = contractInstance.methods.registerCitizenOwner(citizen).encodeABI()
      //console.log('4', await contractInstance.methods.createUBI(dollarCentInWei).estimateGas({from: fromAddress}))
      var tx = {
        nonce: web3js.utils.toHex(getTXCount()),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: 100000,
        gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
        value: 0,
        chainId: web3js.utils.toHex(deployedToNetwork)
      }


      console.log('HERE', tx, privateKey)
      let signedTransaction = await web3js.eth.signTransaction(tx, privateKey)
      console.log('signed')
      let signedRawTransaction = signedTransaction.rawTransaction
      console.log(signedTransaction)
      // we return a web3 promiEvent, Expected to be able to do .once('receipt') on this.
      return web3js.eth.sendSignedTransaction(signedRawTransaction)
    }
    catch(err) {
      throw("Error in registerCitizenOwner: ", err)
    }

  }
};
