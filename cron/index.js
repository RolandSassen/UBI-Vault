// index.js
    // packages
    const cron = require("node-cron");
    const express = require("express");
    const fs = require("fs");
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

    // truffle instantiation
    let ubiVault_artifacts = require( './../build/contracts/UBIVault.json');
    // only works if the UBIVault.json knowns one network.
    let UBIVaultNetwork = Object.keys(ubiVault_artifacts.networks)[0]
    let scAddress = Object.values(ubiVault_artifacts.networks)[0].address
    var fromAddress = provider.addresses[0];
    var privateKey = '0x' + provider.wallets[fromAddress]._privKey.toString('hex')
    //privateKey = '0x' + privateKey.toString('hex')
    var contractInstance = new web3js.eth.Contract(ubiVault_artifacts.abi,scAddress);
    // replace new web3js.eth.Contract(ubiVault_artifacts.abi,scAddress) below when we need a websocket (event watching)
    //web3js = new web3(new web3.providers.WebsocketProvider('wss://mainnet.infura.io/_ws'));

    // create an express app
    app = express();
    app.use(express.json());


    app.post('/registerCitizenOwner',function(req,res) {
      let body = req.body
      web3js.eth.getTransactionCount(fromAddress).then(txCount => {

      encoded = contractInstance.methods.registerCitizenOwner(body.account).encodeABI()

      var tx = {
        nonce: web3js.utils.toHex(txCount),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: 60000,
        gasPrice: web3js.utils.toHex(12),
        value: 0,
        chainId: UBIVaultNetwork.toString(10)
      }

      web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
      web3js.eth.sendSignedTransaction(signed.rawTransaction)
        .once('transactionHash', function(hash) {
          console.log('The transaction hash is: ',hash)
        })
        .once('receipt', function(receipt) {
          console.log("The receipt is: ", receipt)
        })
        .on('confirmation', function(confNumber, receipt) {

        })
        .on('error', function(error) {
<<<<<<< HEAD
          res.json({"Error in sending the transaction": error})
=======
          res.send("Error in sending the transaction", error)
>>>>>>> f7d6efd6868ecff16a3f6f3d679d740094d1d2c1
        })
      });
    })
  });

  app.post('/activateCitizen', async function(req,res) {
    let body = req.body
    let account = body.account
    let secret = Math.floor(Math.random() * 100001);
    let path = "./data/"+account

    // return values
    let retError = null
    let retSecret = null
<<<<<<< HEAD

    if(!fs.existsSync(path)) {
      fs.writeFile(path, secret, function(err) {
        console.log(err)
        if(err) {
          res.json({"error":"Could not activate your account " + err})
        } else {
          console.log(secret)
          res.json({"secret":secret})
        }
      })
    } else {
      res.json({"error": "Account already activated"})
    }
  });

  app.post('/registerCitizen', async function(req,res) {
    let body = req.body

    let account = body.account
    let secret = body.secret

    let path = "./data/"+account

    let retError = null
    let retHash = null

    let ret;
    fs.readFile('./data/'+account, function (err, data) {
      if (err) {
        res.json({"error": "Account not registered"})
      } else {
        if(secret == data) {
          web3js.eth.getTransactionCount(fromAddress).then(txCount => {
          encoded = contractInstance.methods.registerCitizenOwner(body.account).encodeABI()

          var tx = {
            nonce: web3js.utils.toHex(txCount),
            to : scAddress,
            from: fromAddress,
            data : encoded,
            gasLimit: 60000,
            gasPrice: web3js.utils.toHex(12),
            value: 0,
            chainId: UBIVaultNetwork.toString(10)
          }

          web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            console.log(fromAddress, tx, signed, privateKey)

          web3js.eth.sendSignedTransaction(signed.rawTransaction)
          .once('transactionHash', function(hash) {
            console.log('got hash!')
            res.json({"hash": hash})
          })
          .on('error', function(error) {
            res.json({"error": "There has been an error with sending the transaction to the blockchain"})
          })
          });
        })
      } else {
        res.json({"error": "secret is not correct"})
      }
    }
  });
});


=======

    if(!fs.existsSync(path)) {
      fs.writeFile(path, secret, function(err) {
        if(err) {
          retError = "Could not activate your account"
        } else {
          retSecret = secret
        }
      })
    } else {
      retError = "Account already activated"
    }

    res.json({"secret": retSecret, "error": retError})
  });

  app.post('/registerCitizen', async function(req,res) {
    let body = req.body

    let account = body.account
    let secret = body.secret

    let path = "./data/"+account

    let retError = null
    let retHash = null

    let ret;
    fs.readFile('./data/'+account, function (err, data) {
      if (err) {
        retError = "account not activated"
      } else {
        web3js.eth.getTransactionCount(fromAddress).then(txCount => {
        encoded = contractInstance.methods.registerCitizenOwner(body.account).encodeABI()

        var tx = {
          nonce: web3js.utils.toHex(txCount),
          to : scAddress,
          from: fromAddress,
          data : encoded,
          gasLimit: 60000,
          gasPrice: web3js.utils.toHex(12),
          value: 0,
          chainId: UBIVaultNetwork.toString(10)
        }

        web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
        web3js.eth.sendSignedTransaction(signed.rawTransaction)
        .once('transactionHash', function(hash) {
          retHash = hash
        })
        .on('error', function(error) {
          retError = error
        })
        });
      })
      res.json({"data": retHash, "error": retError})
    }
        //content = data;
  });
});


>>>>>>> f7d6efd6868ecff16a3f6f3d679d740094d1d2c1
  app.listen(3000, () => console.log('Example app listening on port 3000!'))
