require('dotenv').config();
const web3 = require('web3')
// environment variables
let infurakey = process.env.INFURAKEY

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

module.exports = {
  getEuroCentInWei: async function() {
//    console.log('getting dollar cent in Wei')
    const rp = require('request-promise')
    var options = {
        uri: 'https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=EUR',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    //var dollarCentInWei = 0;
    // body[0].price_usd is the price of 1 ether in USD
    try {
      let body = await rp(options)
      let eurCentPrice = body[0].price_eur * 100
      return Math.floor(web3js.utils.toWei('1', 'ether') / eurCentPrice)
    }
    catch(err) {
      throw(err)
    }
  },

  getTimestampFromBlockHash: async function(blockHash) {
    let block = await web3js.eth.getBlock(blockHash)
    return block.timestamp
  },

  getPastEventsFrom: async function(contractInstance) {
    return await contractInstance.getPastEvents("allEvents", {fromBlock:0})
  },

  getBalance: async function(account) {
    return await web3js.eth.getBalance(account)
  },

  getChecksummedAddress: function(account) {
    return web3js.utils.toChecksumAddress(account)
  },

  reconnectProvider:  function() {
    web3js = new web3(new web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/v3/"+infurakey));
  }


}
