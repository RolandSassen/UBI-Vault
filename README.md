# UBI-vault
A Universal Basic Income distribution system!


## Installation instructions for UBI-Vault backend services

### Introduction
The UBI-Vault mobile apps (at the time of writing only Android exists) communicate through a NodeJS backend webservice with the smart contract deployed on Ethereum. This way the Android app isn’t aware of Ethereum, wallets and web3js (Ethereum connection framework).

### Prerequisites
A (virtual) server with a Linux distribution installed, like Ubuntu 16.04 or CentOS is required. This server needs internet access through port 3000 to expose the webservice endpoints.

A deployed UBI-vault smart contract on an Ethereum platform (testnet or mainnet)

A (secret!) mnemonic (list of words) is needed to generate the Ethereum wallet (account 2) paying for all transaction fees.
Transfer a small amount of ether (eg. 0.5 ETH) to this account for the transaction fees. This account should never have  insufficient balance for paying fees, so transfer a small amount of ether once in a while.

### Installation
Follow this setup instruction to install NodeJS, the UBI-Vault back end service and all required packages.

#### Install NodeJS
The UBI-Vault backend is written in NodeJS. So first we have to install NodeJS:
```bash
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install build-essential  
# enter Yes when requested
```

#### Install git
Next we need to install git to be able to access the github repository (will skip if already installed):
```bash
sudo apt-get install git
```


#### Install UBI-Vault backend service
Now we create a folder for the service and install all dependencies using NPM. 
```bash
git clone https://github.com/Axveco/UBI-vault.git
# enter your credentials for github
cd UBI-vault
npm install
```

#### Create .env file
Open a text editor to create a .env file:
```bash
# cd UBI-vault (open folder if not already there)
nano .env
```

The content of your .env file should be (secretkey can be changed):

```bash
MNEMONIC=<<enter your mnemonic>>
INFURAKEY=<<enter your key from infura>>
SECRETKEY=3955f06f-6708-492d-a4a5-97f70ed9e960
FIREBASEURL=https://us-central1-ubi-vault.cloudfunctions.net/ubivault/checkPhonenumberVerification
```
Save file with: CTRL-X then Y and Enter


#### Install PM2
Now we will install PM2, which is a process manager for Node.js applications. PM2 provides an easy way to manage and daemonize applications (run them in the background as a service).

```bash
sudo npm install -g pm2
```

Applications that are running under PM2 will be restarted automatically if the application crashes or is killed, but an additional step needs to be taken to get the application to launch on system startup (boot or reboot). Luckily, PM2 provides an easy way to do this, the startup subcommand.

The first thing you will want to do is use the pm2 start command to run the UBI-vault service in the background:
```bash
pm2 start api/express/index.js --log-date-format="YYYY-MM-DD HH:mm Z"
#install log rotate to prevent endless growing log files
pm2 install pm2-logrotate

```

The startup subcommand generates and configures a startup script to launch PM2 and its managed processes on server boots:

```bash
pm2 startup systemd
```

The last line of the resulting output will include a command that you must run with superuser privileges:

```bash
Output
[PM2] Init System found: systemd
[PM2] You have to run this command as root. Execute the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u sammy --hp /home/sammy
```

Run the command that was generated (similar to the output above, but with your username instead of sammy) to set PM2 up to start on boot (**use the command from your own output**):

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u sammy --hp /home/sammy
```

We can check if the service is running by:
```bash
pm2 list
```

## Installation instructions for UBI-vault Firebase Function

### Introduction
UBI-Vault uses Firebase Phone Authentication for identifying users when they wants to get registered as citizen. Phone Authentication is a standard package and it's easy to implement it in an Android app.
A Cloud Function is used by the UBI-vault backend to verify if a user's phone number is verified by Firebase.

### Prerequisites
A Firebase account

### Deploy Cloud Function
First, go to the folder containing the files
```bash
cd UBI-vault
cd firebase
```

Then install all dependencies
```bash
npm install
```

Install Cloud Function on Firebase
```bash
firebase deploy --only functions
```

Deploy Cloud Function
```bash
#use exactly the same key as defined in the .env file of the UBI-vault backend service
firebase functions:config:set api.key="THE API KEY" 
```

Redeploy Cloud Function on Firebase
```bash
firebase deploy --only functions
```

Save the URL of the Cloud Function in the .env file of the UBI-vault backend service

For more information about Firebase, see https://firebase.google.com/docs/functions/get-started 


## Installation instructions for UBI-vault Ethereum smart contract

### Introduction
The UBI-Vault smart contract receives ether from sponsors and distributes it every week to all registered citizens. From all received funds, 5% is transferred to account 1 as maintenance fee. 

**Be careful with deploying the smart contract (again). It will influence the backend services immediately!**

### Prerequisites
An Ethereum wallet (account 1) to receive the maintenance funds. **Keep the private key in a safe place!**

The .env file should container a mnemonic and Infurakey (see Installation instructions for UBI-Vault backend services). The first account generated from this mnemonic should have sufficient balance (in ether) to pay for the deployment transaction fee.

### Install Truffle
```bash
# replace <username> with your username
sudo chown -R <username> /usr/lib/node_modules
sudo npm install -g truffle
# somtimes you have to execute these commands twice
```

### Deploy smart contracts
First, go to the folder containing the files
```bash
cd UBI-vault
```
Run one of the deployment instructions depending on the platform you want to deploy to.

```bash
--testnet:
truffle migrate --reset --network ropsten

--mainnet:
truffle migrate --reset --network main

```

You need enough memory / swap space available, otherwise this error will occur:
Error: spawn ENOMEM
Check https://stackoverflow.com/questions/26193654/node-js-catch-enomem-error-thrown-after-spawn


