let helpers = require("./helpers.js");
require('dotenv').config();
const web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");

//new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/YOUR-PROJECT-ID")
// environment variables
let infurakey = process.env.INFURAKEY
let mnemonic = process.env.MNEMONIC

//Infura HttpProvider Endpoint
var web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/"+infurakey));

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
var internalTXCount = 0;

// we keep track of both an internalTXCount => incremented when this module performs a TX and an externalTXCount (incremented by web3) because the externalTXCount might not always be updated timely and create errors
async function getTXCount() {
  let externalTXCount = await web3js.eth.getTransactionCount(fromAddress)
  let currentInternalTXCount = internalTXCount;
  if(internalTXCount == 0) {
    internalTXCount = externalTXCount
  } else {
    internalTXCount++
  }
  return currentInternalTXCount >= externalTXCount ? currentInternalTXCount : externalTXCount
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

  registerCitizenOwner: async function(citizen, res) {
    try {

      let encoded = contractInstance.methods.registerCitizenOwner(citizen).encodeABI()
      var tx = {
        nonce: web3js.utils.toHex(await web3js.eth.getTransactionCount(fromAddress)),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: web3js.utils.toHex(60000),
        gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
        value: 0,
        chainId: web3js.utils.toHex(deployedToNetwork)
      }

      console.log(tx, privateKey)

      let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
      console.log(signedTransaction)
      let signedRawTransaction = signedTransaction.rawTransaction

      console.log("signedRawTransaction:", signedRawTransaction)

      web3js.eth.sendSignedTransaction(signedRawTransaction)
      .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
      .once('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber == 1) {
          if(receipt.status == false) {
            res.json({"error": receipt})
          } else {
            console.log('Receipt:', receipt)
            res.json({"receipt": receipt})
          }
        }
      })
      .on('error', function(error)  {
        res.json({"error": {"error in sending transaction", err}})
      })
    }
    catch(err) {
      res.json({"error": {"error in sending transaction", err})
    }

  }
};
