// index.js

    const ubiVault = require("./../ethereum/ubiVault.js");
    // packages
    const cron = require("node-cron");
    const express = require("express");
    const fs = require("fs");
    const path = require('path');
    const dataDir = "./api/data/";

    // create an express app
    app = express();
    app.use(express.json());


    app.post('/activateCitizen', async function(req,res) {
    let body = req.body
    let account = body.account
    let phoneNumber = body.phoneNumber
    let secret = Math.floor(Math.random() * 100001);
    let path = dataDir+account

    if(!fs.existsSync(path)) {
      fs.writeFile(path, secret, function(err) {
        if(err) {
          res.json({"error":"Could not activate your account " + err})
        } else {
          res.json({"secret":secret})
          //SEND SECRET TO phoneNumber
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

    fs.readFile(dataDir+account, async function (err, data) {
      if (err) {
        res.json({"error": "Account not registered"})
      } else {
        if(secret == data) {
          // we pass res to the ubiVault, and the ubiVault will populate the response
          ubiVault.registerCitizenOwner(account, res)
        }
        else {
          res.json({"error": "secret is not correct"})
        }
      }
    });
  });

  app.get('/createUBI', async function(req,res) {

      //var dollarCentInWei = getDollarCentInWei();
      //console.log("dollarCentInWei: ", dollarCentInWei);
      createUBI(req,res);


  });

  app.get('/claimUBI', async function(req,res) {

    var citizens = [];

    //loop through all files
    fs.readdirSync(dataDir).forEach(function(file) {
      citizens.push(file.toString()); // add at the end

    });

    web3js.eth.getTransactionCount(fromAddress).then(txCount => {
      encoded = contractInstance.methods.claimUBIOwner(citizens).encodeABI()

      var tx = {
        nonce: web3js.utils.toHex(txCount),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: 150000,
        gasPrice: web3js.utils.toHex(getCurrentGasPrices()),
        value: 0,
        chainId: web3js.utils.toHex('3')
      }

      web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
        console.log(fromAddress, tx, signed, privateKey)

        web3js.eth.sendSignedTransaction(signed.rawTransaction)
        .once('transactionHash', function(hash) {
          console.log('hash: ', hash)
          //res.json({"hash": hash})
        })
        .on('error', function(error) {
          console.log('error: ', error)
          //res.json({"error": "There has been an error with sending the transaction to the blockchain"})
        })
      });
    })




  });

  //
  // // schedule tasks to be run on the server
  //  cron.schedule("*/3 * * * *", function(req,res) {
  //    console.log("---------------------");
  //    console.log("Running Cron Job createUBI");
  //    createUBI(req,res);
  //
  //
  //  });


  app.listen(3000, () => console.log('Example app listening on port 3000!'))
