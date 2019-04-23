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
populateAllcitizens(contractInstance)
watchForNewEvents(contractInstance)
var internalTXCount = 0;

async function populateAllcitizens(_contractInstance) {
  let pastEvents = await helpers.getPastEventsFrom(_contractInstance)
  for(index in pastEvents) {
    let myEvent = pastEvents[index]
    let eventName = myEvent.event
    switch(eventName) {
      case "LogCitizenRegistered":
        let citizenAccount = pastEvents[index].returnValues.newCitizen
        let timeRegistered = await helpers.getTimestampFromBlockHash(myEvent.blockHash)
        if(citizenAccount != undefined) {
          module.exports.allCitizens[citizenAccount] = {"timeRegistered": timeRegistered}
        }
      break
      case "LogUseablePasswordCreated":
      break
      case "LogUBICreated":
        let whenCreated = await helpers.getTimestampFromBlockHash(myEvent.blockHash)
        let adjustedWeiToDollarCent = myEvent.returnValues.adjustedWeiToDollarCent
        let totalamountOfBasicIncomeInWei = myEvent.returnValues.totalamountOfBasicIncomeInWei
        let amountOfCitizens = myEvent.returnValues.amountOfCitizens
        let amountOfBasicIncomeCanBeIncreased = myEvent.returnValues.amountOfBasicIncomeCanBeIncreased
        let paymentsCycle = myEvent.returnValues.paymentsCycle
        module.exports.allUBIs[whenCreated] = {
          "paymentsCycle": paymentsCycle,
          "adjustedWeiToDollarCent": adjustedWeiToDollarCent,
          "totalamountOfBasicIncomeInWei": totalamountOfBasicIncomeInWei,
          "amountOfCitizens": amountOfCitizens,
          "amountOfBasicIncomeCanBeIncreased": amountOfBasicIncomeCanBeIncreased
        }
      break
      case "LogPasswordUsed":
      break;
      case "LogVaultSponsored":
      break;
      case "SetSettleAllowance":
      break;
      case "SetSettleAllowance":
    }
  }
  console.log("Read all past Events:")
  console.log("Citizens: ")
  console.log(module.exports.allCitizens)
  console.log("____________________")
  console.log("UBIs: ")
  console.log(module.exports.allUBIs)
  console.log("____________________")
}

function watchForNewEvents(_contractInstance) {
  //console.log(_contractInstance.events.all)
  let allEvents = _contractInstance.events.allEvents({fromBlock: 'latest'})
  allEvents.on('error', console.error)
  allEvents.on('data', async function(myEvent) {
    let eventName = myEvent.event
    switch (eventName) {
      case "LogCitizenRegistered":
      let citizenAccount = myEvent.returnValues.newCitizen
      let whenRegistered = await helpers.getTimestampFromBlockHash(myEvent.blockHash)
      module.exports.allCitizens[citizenAccount] = {"whenRegistered": whenRegistered}
      console.log("New citizen Registered!")
      console.log(module.exports.allCitizens)
      console.log("____________________")

      break;
      case "LogUseablePasswordCreated":

      break
      case "LogUBICreated":
        let whenCreated = await helpers.getTimestampFromBlockHash(myEvent.blockHash)
        let adjustedWeiToDollarCent = myEvent.returnValues.adjustedWeiToDollarCent
        let totalamountOfBasicIncomeInWei = myEvent.returnValues.totalamountOfBasicIncomeInWei
        let amountOfCitizens = myEvent.returnValues.amountOfCitizens
        let amountOfBasicIncomeCanBeIncreased = myEvent.returnValues.amountOfBasicIncomeCanBeIncreased
        let paymentsCycle = myEvent.returnValues.paymentsCycle
        module.exports.allUBIs[whenCreated] = {
          "paymentsCycle": paymentsCycle,
          "adjustedWeiToDollarCent": adjustedWeiToDollarCent,
          "totalamountOfBasicIncomeInWei": totalamountOfBasicIncomeInWei,
          "amountOfCitizens": amountOfCitizens,
          "amountOfBasicIncomeCanBeIncreased": amountOfBasicIncomeCanBeIncreased
        }
        console.log("UBI Created!")
        console.log("UBIs: ")
        console.log(module.exports.allUBIs)
        console.log("____________________")
      break;
      case "LogPasswordUsed":
      break;
      case "LogVaultSponsored":
      break;
      case "SetSettleAllowance":
      break;
      case "SetSettleAllowance":
    }
  })
}

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

  // key: citizenAccount, value: {"whenRegistered": val}
  allCitizens: {},

  // key: when, value: {"adjustedWeiToDollarCent": val, "totalamountOfBasicIncomeInWei": val, "amountOfCitizens": val, "amountOfBasicIncomeCanBeIncreased": val}
  allUBIs: {},

  createUBI: async function (onlyOne) {
    let newDollarCentInWei = await helpers.getDollarCentToWei();
    let currentSmartContractDollarCentInWei = await module.exports.getWeiToDollarCent()
    let upperBoundary = 1.05 * currentSmartContractDollarCentInWei
    let lowerBoundary = 0.95 * currentSmartContractDollarCentInWei
    if(newDollarCentInWei > upperBoundary) {
      newDollarCentInWei = upperBoundary
    } else if(newDollarCentInWei < lowerBoundary) {
      newDollarCentInWei = lowerBoundary
    }
    let canCreateUBI = await contractInstance.methods.createUBI(newDollarCentInWei).call({from: fromAddress})
    if(canCreateUBI) {
      console.log("Calling Smart Contract: createUBI")
      try {
        //TODO: when the dollar rate has changed by more than 5%, take the 5% boundary
        //dollarCentInWei = 60332188286475 // for testing purposes
        let encoded = contractInstance.methods.createUBI(dollarCentInWei).encodeABI()

        var tx = {
          nonce: web3js.utils.toHex(await getTXCount()),
          to : scAddress,
          from: fromAddress,
          data : encoded,
  //        gasLimit: contractInstance.methods.createUBI(dollarCentInWei).estimateGas(),
          gasLimit: web3js.utils.toHex(1200000),
          gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
          value: 0,
          chainId: web3js.utils.toHex(deployedToNetwork)
        }

        let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
        let signedRawTransaction = signedTransaction.rawTransaction

        web3js.eth.sendSignedTransaction(signedRawTransaction)
        .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
        .once('confirmation', function(confirmationNumber, receipt) {
          if(confirmationNumber == 0) {
            if(receipt.status == false) {
              console.error("Could not create UBI ", receipt)
            } else {
              console.log("Succeeded CreateUBI in block", receipt.blockNumber)
              module.exports.claimUBI(onlyOne)
            }
          }
        })
        .on('error', function(error)  {
          console.error("Could not create UBI ", error)

        })
      }
      catch (err) {
        console.error("Could not create UBI ", err)
      }
    } else {
      console.error("Could not create UBI")
    }
  },

  claimUBI: async function(onlyOne) {
    console.log("Calling Smart Contract: claimUBIOwner")
    let citizens =  Object.keys(module.exports.allCitizens)
    let validatedCitizens = []
    for(let index in citizens) {
      if(await contractInstance.methods.claimUBIOwner([citizens[index], onlyOne]).call({from: fromAddress})) {
        validatedCitizens.push(citizens[index])
      }
    }

    try {
      let encoded = contractInstance.methods.claimUBIOwner(validatedCitizens, onlyOne).encodeABI()
      var tx = {
        nonce: web3js.utils.toHex(await web3js.eth.getTransactionCount(fromAddress)),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: web3js.utils.toHex(1200000),
        gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
        value: 0,
        chainId: web3js.utils.toHex(deployedToNetwork)
      }

      let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
      let signedRawTransaction = signedTransaction.rawTransaction

      web3js.eth.sendSignedTransaction(signedRawTransaction)
      .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
      .once('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber == 0) {
          if(receipt.status == false) {
            console.error("Could not claim UBI ", receipt)
          } else {
            console.log("Succeeded claimUBIOwner in block", receipt.blockNumber)
//            res.json({"receipt": receipt})
          }
        }
      })
      .on('error', function(error)  {
        console.error("Could not claim UBI ", error)
      })

    }
    catch(err) {
      console.error("Could not claim UBI ", err)
    }
  },

  registerCitizenOwner: async function(citizen, res) {
    console.log("Calling Smart Contract: registerCitizenOwner")
    try {

      let encoded = contractInstance.methods.registerCitizenOwner(citizen).encodeABI()
      var tx = {
        nonce: web3js.utils.toHex(await web3js.eth.getTransactionCount(fromAddress)),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: web3js.utils.toHex(1200000),
        gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
        value: 0,
        chainId: web3js.utils.toHex(deployedToNetwork)
      }

      let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
      let signedRawTransaction = signedTransaction.rawTransaction

      web3js.eth.sendSignedTransaction(signedRawTransaction)
      .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
      .once('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber == 0) {
          if(receipt.status == false) {
            res.json({"error": receipt})
          } else {
            console.log("Succeeded registerCitizenOwner in block", receipt.blockNumber)
            res.json({"receipt": receipt})
          }
        }
      })
      .on('error', function(error)  {
        res.json({"error": "error in sending transaction" + error})
      })
    }
    catch(err) {
      res.json({"error": "error in sending transaction" + err})
    }
  },

  getAmountOfBasicIncome: async function() {
    return contractInstance.methods.amountOfBasicIncome().call()
  },

  getAvailableEther: async function() {
    return contractInstance.methods.availableEther().call()
  },

  getMinimumPeriod: async function() {
    return contractInstance.methods.minimumPeriod().call()
  },

  getRightFromPaymentsCycle: async function(account) {
    return contractInstance.methods.rightFromPaymentCycle(account).call()
  },

  getUBIAtCycle: function(paymentsCycle) {
    let UBIs = Object.values(module.exports.allUBIs)
    for(let index in UBIs) {
      if(UBIs[index].paymentsCycle.toString(10) == paymentsCycle.toString(10)) {
        return{"whenPaid": Object.keys(module.exports.allUBIs)[index], "UBI": UBIs[index]}
      }
    }
  },

  getLastUBI: function() {
    let highestKey = 0;
    let UBICreationTimes = Object.keys(module.exports.allUBIs)
    for(let index in UBICreationTimes) {
      if(UBICreationTimes[index] > highestKey) {
        highestKey = UBICreationTimes[index];
      }
    }
    return {"whenPaid": highestKey, "UBI": module.exports.allUBIs[highestKey]}
  },

  getTotalDistributed: function() {
    // totalDistributed in $
    let totalDistributed = 0;
    let UBIs = Object.values(module.exports.allUBIs)
    for(let index in UBIs) {
      let UBI = UBIs[index]
      totalDistributed = UBI.totalamountOfBasicIncomeInWei / UBI.adjustedWeiToDollarCent
    }
    return totalDistributed

  },

  getDollarCentInWei: async function() {
    return contractInstance.dollarCentInWei().call();
  }


};
