// index.js
    const cron = require("node-cron");
    const express = require("express");
    const fs = require("fs");

    const web3 = require('web3')


    var abi = [
	{
		"constant": true,
		"inputs": [],
		"name": "availableEther",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_useablePasswordHashes",
				"type": "bytes32[]"
			}
		],
		"name": "createUseablePasswords",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "usedPasswordHashes",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "message",
				"type": "bytes32"
			}
		],
		"name": "sponsorVault",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "minimumPeriod",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfCitizens",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfBasicIncomeCanBeIncreased",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "adjustedWeiToDollarCent",
				"type": "uint256"
			}
		],
		"name": "createUBI",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "weiToDollarCent",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "amountOfBasicIncome",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "paymentsCycle",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "password",
				"type": "bytes32"
			}
		],
		"name": "registerCitizenPublic",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "citizens",
				"type": "address[]"
			}
		],
		"name": "claimUBIOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "isOwner",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "useablePasswordHashes",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "promisedEther",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "lastPayout",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newCitizen",
				"type": "address"
			}
		],
		"name": "registerCitizenOwner",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "rightFromPaymentCycle",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "claimUBIPublic",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getMaintenanceFunds",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "claimMaintenanceFunds",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "initialAB",
				"type": "uint256"
			},
			{
				"name": "initialMinimumPeriod",
				"type": "uint256"
			},
			{
				"name": "initialWeiToDollarCent",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "caller",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "LogMaintenanceFundsClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "passwordHash",
				"type": "bytes32"
			}
		],
		"name": "LogUseablePasswordCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "adjustedWeiToDollarCent",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "totalamountOfBasicIncomeInWei",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "amountOfCitizens",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "amountOfBasicIncomeCanBeIncreased",
				"type": "uint8"
			}
		],
		"name": "LogUBICreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "newCitizen",
				"type": "address"
			}
		],
		"name": "LogCitizenRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "password",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "passwordHash",
				"type": "bytes32"
			}
		],
		"name": "LogPasswordUsed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "payee",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "message",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "LogVaultSponsored",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "caller",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "income",
				"type": "uint256"
			},
			{
				"indexed": true,
				"name": "citizen",
				"type": "address"
			}
		],
		"name": "LogUBIClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	}
]

    app = express();


    // // schedule tasks to be run on the server
    //    cron.schedule("* * * * *", function() {
    //      console.log("running a task every minute");
    //    });
    //
    //    app.listen(3128);




    app.get('/register',function(req,res){
            console.log('start');
            var scAddress = '0x260eb7dbdd9a37a9d182ad1fbf1755d03c5cb194';

            //test account and smart contract owner
            var fromAddress = '0xCE2ac0A3c599812D8068E6b3D40A84B7AffE7E49';
            var privateKey = '0x4A14D4A10D6232D7353A6795FE54283493009EE61EFFAD935A20A6519D826BA6';

            //Infura HttpProvider Endpoint
            var web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/87b0d4dd4f204f72b7a1e6391ff15ec1"));

            var contractInstance = new web3js.eth.Contract(abi,scAddress);

            web3js.eth.getTransactionCount(fromAddress).then(txCount => {

                encoded = contractInstance.methods.registerCitizenOwner('0x855af95f5553e44798480C1cBDBA66859b14cFb8').encodeABI()

                console.log('nonce');
                console.log(txCount);

                var tx = {
                    nonce: web3js.utils.toHex(txCount),
                    to : scAddress,
                    from: fromAddress,
                    data : encoded,
                    gasLimit: 1000000,
                    gasPrice: web3js.utils.toHex(10e9),
                    value: 0,
                    chainId: "3"
                }

                web3js.eth.accounts.signTransaction(tx, privateKey).then(signed => {
                    console.log('signed');
                    console.log(signed.rawTransaction);
                    web3js.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', console.log)
                    console.log('receipt');

                });

            })

        });
    app.listen(3000, () => console.log('Example app listening on port 3000!'))
