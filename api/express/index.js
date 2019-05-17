// index.js

  // getData
  const ubiVault = require("./../ethereum/ubiVault.js");
  const helpers = require("./../ethereum/helpers.js");

  // packages
  const cron = require("node-cron");
  const express = require("express");
  const fs = require("fs");
  const path = require('path');
  const rp = require('request-promise');
  require('dotenv').config();

  const dataDir = "./api/data/";

  // create an express app
  app = express();
  app.use(express.json());

  app.post('/registerCitizen', async function(req,res) {
    try {
      let body = req.body
      let account = body.account
      let phoneNumber = body.phoneNumber
      let secretKey = process.env.SECRETKEY

      //check if phoneNumber is verified via Firebase Phone Auth
      var options = {
          method: 'POST',
          uri: 'https://us-central1-axveco-421de.cloudfunctions.net/ubivault/checkPhonenumberVerification',
          body: {
              key: secretKey.toString(),
              phoneNumber: phoneNumber.toString()
          },
          json: true // Automatically parses the JSON string in the response
      };

      let resBody = await rp(options)
      if(resBody == 'verified') {

        //if verified, register citizen in smart contract
        if(ubiVault.allCitizens[account] == null) {
          ubiVault.registerCitizenOwner(account, res)
        }
        else {
          res.status(403).send('account already registered as citizen');

        }
      }
      else {
        console.log('phonenumber not verified')
        res.status(403).send('phonenumber not verified');

      }

    }
    catch(err) {
      res.status(500).send(err);
    }

  });

  app.post('/createUBI', async function(req, res) {
    try {
        await ubiVault.createUBI()
        res.status(200).send();
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }


  });

  app.get('/checkCitizen', async function(req, res) {
    try {
      let account = req.query.account
      let registered = false;
      console.log("Citizen %s registered: %s", account, (ubiVault.allCitizens[account] != null).toString());
      res.json({
        "registered": (ubiVault.allCitizens[account] != null)
      })
    }
    catch(err) {
      res.status(500).send(err);

    }
  })


  app.get('/getCitizen', async function(req, res) {
    try {
      let account = req.query.account
      let dollarCentInWei = await helpers.getDollarCentInWei()
      let date = new Date()
      console.log("getCitizen started", new Date(Date.now()))

      if(ubiVault.allCitizens[account] != null)
      {
        let basicIncome = parseInt(await ubiVault.getAmountOfBasicIncome())
        let balance = Math.round((await helpers.getBalance(account)) / dollarCentInWei)
        let whenRegistered = parseInt(ubiVault.allCitizens[account].timeRegistered)
        let lastUBI = ubiVault.getLastUBI()
        let rightFromPaymentCycle = parseInt(await ubiVault.getRightFromPaymentsCycle(account))
        let minimumPeriod = parseInt(await ubiVault.getMinimumPeriod())
        let UBIAtPaymentsCyle = ubiVault.getUBIAtCycle(rightFromPaymentCycle-1)
        let lastClaimed = parseInt(lastUBI.whenPaid) > whenRegistered ? parseInt(UBIAtPaymentsCyle.whenPaid) : null
        let expectedPayment = parseInt(lastUBI.whenPaid) + minimumPeriod

        if(expectedPayment < date.getTime()/1000) { // UBI can already be claimed, but first remove milliseconds
          expectedPayment = parseInt(date.getTime()/1000)
        }
        res.json({
          "balance": balance,
          "basicIncome": basicIncome,
          "lastClaimed": lastClaimed,
          "expectedPaymentAtTime": expectedPayment
        })
      }
      else {
        console.log('Account not registered as citizen')
        res.status(403).send('Account not registered as citizen');
      }
    }
    catch(err) {
      console.log(err);


      res.status(500).send(err);

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
      res.status(500).send(err);
    }

  })


  // schedule tasks to be run on the server
//  cron.schedule("*/3 * * * *", function() {   //use this for testing, createUBI will run every 3 minutes
  // cron.schedule("0 1 * * 1", function() {  //every monday at 01:00
  //   console.log("---------------------");
  //   console.log("Running Cron Job createUBI");
  //   ubiVault.createUBI();
  // });

  cron.schedule("*/30 * * * * *", function() {  //every 30 seconds
    console.log("---------------------");
    console.log("Keep Alive");
    ubiVault.getDollarCentInWei();
    helpers.getBalance("0x0000000000000000000000000000000000000000");
  });

  app.listen(3000, () => console.log('App listening on port 3000!'))
