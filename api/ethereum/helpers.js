require('dotenv').config();
const web3 = require('web3')
// environment variables
let infurakey = process.env.INFURAKEY

//Infura HttpProvider Endpoint
var web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/v3/" + infurakey));

module.exports = {

  getDollarCentInWei: async function() {
    console.log('getting dollar cent in Wei')
    const rp = require('request-promise')
    var options = {
        uri: 'https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    //var dollarCentInWei = 0;
    // body[0].price_usd is the price of 1 ether in USD
    try {
      let body = await rp(options)
      let usdCentPrice = body[0].price_usd * 100
      return Math.floor(web3js.utils.toWei('1', 'ether') / usdCentPrice)
    }
    catch(err) {
      throw(err)
    }
  }
}
