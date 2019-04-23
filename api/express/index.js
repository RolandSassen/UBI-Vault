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
    let dollarCentInWei = await helpers.getDollarCentInWei()
    let date = new Date()
    try {
      let balance = Math.round((await helpers.getBalance(account)) / dollarCentInWei * 100) / 100

      let basicIncome = parseInt(await ubiVault.getAmountOfBasicIncome())
      if(ubiVault.allCitizens[account] != null)
      {
        let whenRegistered = parseInt(ubiVault.allCitizens[account].timeRegistered)
        let lastUBI = ubiVault.getLastUBI()
        let rightFromPaymentCycle = parseInt(await ubiVault.getRightFromPaymentsCycle(account))
        let minimumPeriod = parseInt(await ubiVault.getMinimumPeriod())
        let UBIAtPaymentsCyle = ubiVault.getUBIAtCycle(rightFromPaymentCycle)
        let lastClaimed = parseInt(lastUBI.whenPaid) > whenRegistered ? parseInt(UBIAtPaymentsCyle.whenPaid) : null
        let expectedPayment = parseInt(lastUBI.whenPaid) + minimumPeriod
        if(expectedPayment < 31557600 * 10) { // there has been no UBI payment before
          expectedPayment = date.getTime()
        }
        res.json({
          "balance": balance,
          "basicIncome": basicIncome,
          "lastClaimed": lastClaimed,
          "expectedPaymentAtTime": expectedPayment
        })
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
    try {
      let date = new Date()
      let basicIncome = parseInt(await ubiVault.getAmountOfBasicIncome())
      let lastUBI = ubiVault.getLastUBI()
      let minimumPeriod = parseInt(await ubiVault.getMinimumPeriod())
      let lastPayment = parseInt(lastUBI.whenPaid)
      let expectedPayment = parseInt(lastPayment + parseInt(minimumPeriod))
      if(expectedPayment < 31557600 * 10) { // there has been no UBI payment before
        expectedPayment = date.getTime()
      }
      if(lastPayment == 0) {
        lastPayment = null
      }
      let availableWei = await ubiVault.getAvailableEther()
      availableWei = parseInt(availableWei)
      let totalDistributed = parseInt(ubiVault.getTotalDistributed())
      let numberOfCitizens = parseInt(Object.keys(ubiVault.allCitizens).length)
      res.json({
        "basicIncome": basicIncome,
        "lastPayment": lastPayment,
        "expectedPaymentAtTime": expectedPayment,
        "availableWei": availableWei,
        "totalDistributed": totalDistributed,
        "numberOfCitizens": numberOfCitizens
      })
    } catch(err) {
      res.json({"error": "Could not get the requested data"})
    }

  })


  // schedule tasks to be run on the server
  cron.schedule("*/3 * * * *", function() {
    console.log("---------------------");
    console.log("Running Cron Job createUBI");
    ubiVault.createUBI(false);
  });


  app.listen(3000, () => console.log('App listening on port 3000!'))
