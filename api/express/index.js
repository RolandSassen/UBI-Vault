// index.js

// /getData

    const ubiVault = require("./../ethereum/ubiVault.js");
    const helpers = require("./../ethereum/helpers.js");

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
    // check if there is a secret handed out at path dataDir+account
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

  app.post('/createUBI', async function(req,res) {

      //var dollarCentInWei = getDollarCentInWei();
      //console.log("dollarCentInWei: ", dollarCentInWei);
      ubiVault.createUBI(res);

  });

  app.get('/getCitizen', async function(req, res) {
    let account = req.body.account
    try {
      let balance = await helpers.getBalance(account)
      let basicIncome = await ubiVault.getAmountOfBasicIncome()
      if(ubiVault.allCitizens[account] != null)
      {
        let whenRegistered = ubiVault.allCitizens[account].timeRegistered
        let lastUBI = ubiVault.getLastUBI()
        let rightFromPaymentCycle = await ubiVault.getRightFromPaymentsCycle(account)
        let minimumPeriod = await ubiVault.getMinimumPeriod()
        let UBIAtPaymentsCyle = ubiVault.getUBIAtCycle(rightFromPaymentCycle - 1)

        let lastClaimed = lastUBI.whenPaid > whenRegistered ? UBIAtPaymentsCyle.whenPaid : null
        let expectedPayment = lastUBI.whenPaid + minimumPeriod
        res.json({"balance": balance, "basicIncome": basicIncome, "lastClaimed": lastClaimed, "expectedPayment": expectedPayment})
      }
      else {
        res.json({"error": "Account not registered"})

      }
    }
    catch(err) {
      res.json({"error": "error in checking account" + err})
    }
  })

  app.get('/getData', async function(req, res) {
    let basicIncome = await ubiVault.getAmountOfBasicIncome()
    basicIncome = basicIncome.toString(10)
    let lastUBI = ubiVault.getLastUBI()
    let lastPayment = lastUBI.whenPaid
    let minimumPeriod = await ubiVault.getMinimumPeriod()
    let expectedPayment = lastPayment + parseInt(minimumPeriod.toString(10))
    let availableEther = await ubiVault.getAvailableEther()
    availableEther = parseInt(availableEther.toString(10))
    available = availableEther.toString(10)
    let totalDistributed = ubiVault.getTotalDistributed()
    let numberOfCitizens = Object.keys(ubiVault.allCitizens).length
    res.json({
      "basicIncome": basicIncome,
      "lastPayment": lastPayment,
      "expectedPayment": expectedPayment,
      "availableEther": availableEther,
      "totalDistributed": totalDistributed,
      "numberOfCitizens": numberOfCitizens
    })
  })


  // schedule tasks to be run on the server
  cron.schedule("*/3 * * * *", function() {
    console.log("---------------------");
    console.log("Running Cron Job createUBI");
    ubiVault.createUBI();
  });


  app.listen(3000, () => console.log('App listening on port 3000!'))
