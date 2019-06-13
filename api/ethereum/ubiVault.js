let helpers = require("./helpers.js");
require('dotenv').config();
const web3 = require('web3')
const HDWalletProvider = require("truffle-hdwallet-provider");

//new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/YOUR-PROJECT-ID")
// environment variables
let infurakey = process.env.INFURAKEY
let mnemonic = process.env.MNEMONIC

//Infura HttpProvider Endpoint
const getProvider = () => {
  const provider = new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/"+infurakey)
  provider.on('connect', () => console.log('WS Connected'))
  provider.on('socket_error', () => console.log('WS socket_error'))
  provider.on('ready', e => { console.log('WS ready') })
  provider.on('socket_ready', e => { console.log('WS socket_ready') })
  provider.on('socket_error', e => { console.error('WS socket_error', e) })
  provider.on('error', e => { console.error('WS Error', e) })
  provider.on('close', e => { console.error('WS Close', e) })
  provider.on('end', e => { console.error('WS End', e)  })

  return provider
}
var web3js = new web3(getProvider())

//var web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/"+infurakey));

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
        let adjustedEuroCentInWei = myEvent.returnValues.adjustedEuroCentInWei.toString(10)
        let totalamountOfBasicIncomeInWei = myEvent.returnValues.totalamountOfBasicIncomeInWei.toString(10)
        let amountOfCitizens = myEvent.returnValues.amountOfCitizens.toString(10)
        let amountOfBasicIncomeCanBeIncreased = myEvent.returnValues.amountOfBasicIncomeCanBeIncreased.toString(10)
        let paymentsCycle = myEvent.returnValues.paymentsCycle.toString(10)
        module.exports.allUBIs[whenCreated] = {
          "paymentsCycle": paymentsCycle,
          "adjustedEuroCentInWei": adjustedEuroCentInWei,
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
        let adjustedEuroCentInWei = myEvent.returnValues.adjustedEuroCentInWei.toString(10)
        let totalamountOfBasicIncomeInWei = myEvent.returnValues.totalamountOfBasicIncomeInWei.toString(10)
        let amountOfCitizens = myEvent.returnValues.amountOfCitizens.toString(10)
        let amountOfBasicIncomeCanBeIncreased = myEvent.returnValues.amountOfBasicIncomeCanBeIncreased.toString(10)
        let paymentsCycle = myEvent.returnValues.paymentsCycle.toString(10)
        module.exports.allUBIs[whenCreated] = {
          "paymentsCycle": paymentsCycle,
          "adjustedEuroCentInWei": adjustedEuroCentInWei,
          "totalamountOfBasicIncomeInWei": totalamountOfBasicIncomeInWei,
          "amountOfCitizens": amountOfCitizens,
          "amountOfBasicIncomeCanBeIncreased": amountOfBasicIncomeCanBeIncreased
        }
        console.log("UBI Created!")
        console.log("UBIs: ")
        console.log(module.exports.allUBIs)
        console.log("____________________")
        module.exports.claimUBI(false)
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

  // key: when, value: {"adjustedDollarCentInWei": val, "totalamountOfBasicIncomeInWei": val, "amountOfCitizens": val, "amountOfBasicIncomeCanBeIncreased": val}
  allUBIs: {},

  createUBI: async function () {
    let newEuroCentInWei = await helpers.getEuroCentInWei();
    // let currentSmartContractDollarCentInWei = await module.exports.getEuroCentInWei()
    // let upperBoundary = 1.05 * currentSmartContractDollarCentInWei
    // let lowerBoundary = 0.95 * currentSmartContractDollarCentInWei
    // if(newDollarCentInWei > upperBoundary) {
    //   newDollarCentInWei = Math.floor(upperBoundary)
    // } else if(newDollarCentInWei < lowerBoundary) {
    //   newDollarCentInWei = Math.ceil(lowerBoundary)
    // }

    contractInstance.methods.createUBI(newEuroCentInWei).estimateGas({from: fromAddress})
    .then(async function(gasAmount){

      console.log("Calling Smart Contract: createUBI")
      try {
        let encoded = contractInstance.methods.createUBI(newEuroCentInWei).encodeABI()

        var tx = {
          nonce: web3js.utils.toHex(await getTXCount()),
          to : scAddress,
          from: fromAddress,
          data : encoded,
          gasLimit: web3js.utils.toHex(gasAmount+10000),
          gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
          value: 0,
          chainId: web3js.utils.toHex(deployedToNetwork)
        }

        let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
        let signedRawTransaction = signedTransaction.rawTransaction

        web3js.eth.sendSignedTransaction(signedRawTransaction)
        .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
        .on('error', function(error)  {
          console.error("Could not create UBI ", error)
        })
      }
      catch (err) {
        console.error("Could not create UBI ", err)
      }

    })
    .catch(function(error){
        console.error("Could not create UBI: Not enough funds available (probably)");
    });
  },

  claimUBI: async function(onlyOne) {
    let citizens =  Object.keys(module.exports.allCitizens)

    let validatedCitizens = citizens

    contractInstance.methods.claimUBIOwner(validatedCitizens, onlyOne).estimateGas({from: fromAddress})
    .then(async function(gasAmount){
      console.log("Calling Smart Contract: claimUBIOwner")

        try {
          let encoded = contractInstance.methods.claimUBIOwner(validatedCitizens, onlyOne).encodeABI()
          var tx = {
            nonce: web3js.utils.toHex(await web3js.eth.getTransactionCount(fromAddress)),
            to : scAddress,
            from: fromAddress,
            data : encoded,
            gasLimit: web3js.utils.toHex(gasAmount+10000),
            gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
            value: 0,
            chainId: web3js.utils.toHex(deployedToNetwork)
          }

          let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
          let signedRawTransaction = signedTransaction.rawTransaction

          web3js.eth.sendSignedTransaction(signedRawTransaction)
          .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
          .once('confirmation', function(confirmationNumber, receipt){
            if(confirmationNumber == 1) {
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

      })
      .catch(function(error){
          console.error("Could not create UBI: Not enough funds available (probably)");
      });

  },

  registerCitizenOwner: async function(citizen, res) {
    console.log("Calling Smart Contract: registerCitizenOwner")

    contractInstance.methods.registerCitizenOwner(citizen).estimateGas({from: fromAddress})
    .then(async function(gasAmount){
        try {

          let encoded = contractInstance.methods.registerCitizenOwner(citizen).encodeABI()
          var tx = {
            nonce: web3js.utils.toHex(await web3js.eth.getTransactionCount(fromAddress)),
            to : scAddress,
            from: fromAddress,
            data : encoded,
            gasLimit: web3js.utils.toHex(gasAmount+10000),
            gasPrice: web3js.utils.toHex(await web3js.eth.getGasPrice()),
            value: 0,
            chainId: web3js.utils.toHex(deployedToNetwork)
          }

          let signedTransaction = await web3js.eth.accounts.signTransaction(tx, privateKey)
          let signedRawTransaction = signedTransaction.rawTransaction

          web3js.eth.sendSignedTransaction(signedRawTransaction)
          .once('transactionHash', function(hash) {console.log("Hash: ", hash)})
          .once('confirmation', function(confirmationNumber, receipt){
            if(confirmationNumber == 1) {
              if(receipt.status == false) {
                res.json({"error": receipt})
                res.status(200).send()
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

    })
    .catch(function(error){
      console.log("Cannot register citizen: ", error)
      res.json({"error": "error in sending transaction" + error})
    });

  },

  getAmountOfBasicIncome: async function() {
    return contractInstance.methods.amountOfBasicIncome().call();
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
      console.log(UBI)
      totalDistributed = totalDistributed + (UBI.totalamountOfBasicIncomeInWei / UBI.adjustedEuroInWei)
      console.log(totalDistributed)
    }
    return totalDistributed

  },

  getEuroCentInWei: async function() {
    return contractInstance.methods.euroCentInWei().call();
  },

  reconnectProvider:  function() {
    web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/"+infurakey));
  }


};
