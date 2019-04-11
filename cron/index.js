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

    // create an express app
    app = express();
    //rivateKey = '0x'+ privateKey.toString('hex')
    console.log(privateKey, web3js.eth.accounts.privateKeyToAccount(privateKey));
    // replace line 20 with 22 when we need a websocket (event watching)
    //web3js = new web3(new web3.providers.WebsocketProvider('wss://mainnet.infura.io/_ws'));

    app.get('/register',function(req,res){

            web3js.eth.getTransactionCount(fromAddress).then(txCount => {

                encoded = contractInstance.methods.registerCitizenOwner('0x855af95f5553e44798480C1cBDBA66859b14cFb8').encodeABI()

                console.log('nonce');
                console.log(txCount);

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

                console.log(tx)

                web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
                    console.log('signed');
                    console.log(tx)
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
            })

        });
    app.listen(3001, () => console.log('Example app listening on port 3000!'))
