var soap = require('soap')
var Cookie = require('soap-cookie')
var messages = require('elasticio-node').messages
var Promise = require('bluebird')
var crypto = require('crypto')

const URL = 'https://soap.reviso.com/api1/?WSDL'

exports.process = processTrigger;

function processTrigger(msg, cfg, snapshot) {
  var token = cfg.accessId;
  snapshot = snapshot || {}
  var appToken = process.env.ECONOMIC_PRIVATE_APP_ID
  var self = this
  soap.createClient(URL, function(err, client) {
    if (err) {
      self.emit('error', err);
      return self.emit('end');
    }
    client = Promise.promisifyAll(client)
    client.ConnectWithTokenAsync({token, appToken})
    // set authorization
    .then(result => client.setSecurity(new Cookie(client.lastResponseHeaders)))
    .then(x => client.OrderLine_GetAllAsync({}))
    .then(ordersLines => ordersLines.OrderLine_GetAllResult)
    .then(entityHandles => client.OrderLine_GetDataArrayAsync({entityHandles}))
    .then(orders => orders.OrderLine_GetDataArrayResult.OrderLineData)
    .then(ordersLines => {
      var newSnapshot = {}
      var filteredOrdersLines = []
      ordersLines.forEach(line => {
        var hash = crypto.createHash('md5').update(JSON.stringify(line)).digest("hex")
        var idHash = crypto.createHash('md5').update(JSON.stringify(line.Handle)).digest("hex")
        newSnapshot[idHash] = hash
        if (snapshot[idHash] !== hash) {
          filteredOrdersLines.push(line)
        }
      })
      self.emit('snapshot', newSnapshot)
      return filteredOrdersLines
    })
    .map(orderLine => self.emit('data', messages.newMessageWithBody(orderLine)))
    .catch(e => self.emit('error', e))
    .done(x => self.emit('end'))
  });
}
