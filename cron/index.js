// index.js
    // packages
    const cron = require("node-cron");
    const express = require("express");
    const fs = require("fs");
    const path = require('path');
    require('dotenv').config();
    const web3 = require('web3')
    const HDWalletProvider = require("truffle-hdwallet-provider");
    const dataDir = "./data/";

    // environment variables
    // let infurakey = process.env.INFURAKEY
    // let mnemonic = process.env.MNEMONIC

    let infurakey = "92b504546c114dc79df96fb00e94073f";
    let mnemonic = "flee pelican renew brain crush obvious science family chase table magnet blush";

    //Infura HttpProvider Endpoint
    var web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/" + infurakey));

    // wallet provider
    var provider = new HDWalletProvider(mnemonic, "http://localhost:8545");

    // truffle instantiation
    let ubiVault_artifacts = require( './../build/contracts/UBIVault.json');
    // only works if the UBIVault.json knowns one network.
    let UBIVaultNetwork = Object.keys(ubiVault_artifacts.networks)[0]
    let scAddress = Object.values(ubiVault_artifacts.networks)[0].address
    fromAddress = provider.addresses[0];
    var privateKey = '0x' + provider.wallets[fromAddress]._privKey.toString('hex')
    var fromAddress = web3js.eth.accounts.privateKeyToAccount(privateKey).address
    //privateKey = '0x' + privateKey.toString('hex')
    var contractInstance = new web3js.eth.Contract(ubiVault_artifacts.abi,scAddress);
    // replace new web3js.eth.Contract(ubiVault_artifacts.abi,scAddress) below when we need a websocket (event watching)
    //web3js = new web3(new web3.providers.WebsocketProvider('wss://mainnet.infura.io/_ws'));



    //delete all data files (COMMENT FOR PRODUCTION)
    // fs.readdir(dataDir, (err, files) => {
    //   if (err) throw err;
    //
    //   for (const file of files) {
    //     fs.unlink(path.join(dataDir, file), err => {
    //       if (err) throw err;
    //     });
    //   }
    // });

    const getCurrentGasPrices = () => {

      web3js.eth.getGasPrice().
         then((averageGasPrice) => {
             console.log("Average gas price: " + averageGasPrice);
             return averageGasPrice;
         }).
         catch(console.error);
    };


    const createUBI = (req,res) => {

      web3js.eth.getTransactionCount(fromAddress).then(txCount => {
        encoded = contractInstance.methods.createUBI(new web3js.utils.BN(60332188286475)).encodeABI()

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

    };


    const getDollarCentInWei = () => {
      const rp = require('request-promise');
      var options = {
          uri: 'https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD',
          headers: {
              'User-Agent': 'Request-Promise'
          },
          json: true // Automatically parses the JSON string in the response
      };
      var dollarCentInWei = 0;
      rp(options).then(body => {
//          console.log(body);
          var usdPrice = body[0].price_usd;
//          console.log(usdPrice);
          dollarCentInWei = web3js.utils.toWei('1', 'ether') / (usdPrice * 100);

          //averageGasPrice = web3js.utils.toWei(averageGasPrice.toString(), 'gwei');
//          console.log(dollarCentInWei);
          return dollarCentInWei;
      }).catch(err => {
          console.log(err);
      });

    };

    // create an express app
    app = express();
    app.use(express.json());

    app.get('/registerCitizenOwner', function(req,res) {

      web3js.eth.getTransactionCount(fromAddress).then(txCount => {

      encoded = contractInstance.methods.registerCitizenOwner('0x47D4e47F44249eB540A93667eFD0f65e5a1E11f8').encodeABI()

      console.log('nonce');
      console.log(txCount);

      var tx = {
        nonce: web3js.utils.toHex(txCount),
        to : scAddress,
        from: fromAddress,
        data : encoded,
        gasLimit: 100000,
        gasPrice: web3js.utils.toHex(getCurrentGasPrices()),
        value: 0,
        chainId: web3js.utils.toHex('3')
      }

      console.log('TX is: ',tx, "Account from private key is: ", web3js.eth.accounts.privateKeyToAccount(privateKey).address, "fromAddress is: ", fromAddress)

      web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
        console.log('signed');
        console.log(tx)
        console.log(privateKey);
        console.log(signed.rawTransaction);
        web3js.eth.sendSignedTransaction(signed.rawTransaction)
          .once('transactionHash', function(hash) {
            console.log(hash)
          })
          .once('receipt', function(receipt) {
            console.log(receipt)
          })
          .on('confirmation', function(confNumber, receipt) {

          })
          .on('error', function(error) {
            console.error(error)
          })
        });
      });

    });

  app.post('/activateCitizen', async function(req,res) {
    let body = req.body
    let account = body.account
    let phoneNumber = body.phoneNumber
    let secret = Math.floor(Math.random() * 100001);
    let path = dataDir+account

    // return values
    let retError = null
    let retSecret = null

    if(!fs.existsSync(path)) {
      fs.writeFile(path, secret, function(err) {
        console.log(err)
        if(err) {
          res.json({"error":"Could not activate your account " + err})
        } else {
          console.log(secret)
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
            gasLimit: 100000,
            gasPrice: web3js.utils.toHex(getCurrentGasPrices()),
            value: 0,
            chainId: web3js.utils.toHex('3')
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

  app.get('/createUBI', async function(req,res) {

      //var dollarCentInWei = getDollarCentInWei();
      //console.log("dollarCentInWei: ", dollarCentInWei);
      createUBI(req,res);


  });

  app.get('/claimUBI', async function(req,res) {

    var citizens = [];

    // Loop through all the files in the temp directory
    fs.readdir(dataDir, function (err, files) {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }

      files.forEach(function (file, index) {
        // Make one pass and make the file complete
//        console.log("file: ", file);
          citizens.push(file.toString()); // add at the end

      });

    });

    //GAAT MIS DOOR ASYNC LOOP
    console.log("citizens:", citizens);

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


  // schedule tasks to be run on the server
   cron.schedule("*/3 * * * *", function(req,res) {
     console.log("---------------------");
     console.log("Running Cron Job createUBI");
     createUBI(req,res);


   });


  app.listen(3000, () => console.log('Example app listening on port 3000!'))
