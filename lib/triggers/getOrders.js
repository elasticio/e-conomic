var soap = require('soap');
var Cookie = require('soap-cookie');
var messages = require('elasticio-node').messages;
var Promise = require('bluebird')

const URL = 'https://soap.reviso.com/api1/?WSDL';

exports.process = processTrigger;

function processTrigger(msg, cfg, snapshot) {
  var token = cfg.accessId;
  snapshot = snapshot || {ids: []}
  var appToken = process.env.ECONOMIC_PRIVATE_APP_ID;
  var self = this
  self.emit = console.log
  soap.createClient(URL, function(err, client) {
    if (err) {
      self.emit('error', err);
      return self.emit('end');
    }
    client = Promise.promisifyAll(client)
    client.ConnectWithTokenAsync({token, appToken})
    // set authorization
    .then(result => client.setSecurity(new Cookie(client.lastResponseHeaders)))
    // get all open orders ids
    .then(x => client.Order_GetAllCurrentAsync({}))
    // filter open orders ids through the snapshot
    .then(openOrders => {
      var ids = openOrders.Order_GetAllCurrentResult.OrderHandle
      var OrderHandle = ids.filter(handle => snapshot.ids.indexOf(handle.Id) === -1)
      return {OrderHandle}
    })
    // load new orders data
    .then(entityHandles => client.Order_GetDataArrayAsync({entityHandles}))
    // get orders data array property so we can use map
    .then(orders => orders.Order_GetDataArrayResult.OrderData)
    // load order lines for each order
    .map(order => {
        // get lines ids for orders
        return client.Order_GetLinesAsync({orderHandle: order.Handle})
        // get lines data
        .then(linesResult => client.OrderLine_GetDataArrayAsync({entityHandles: linesResult.Order_GetLinesResult}))
        // set lines data to order object
        .then(lines => {
          if (lines.OrderLine_GetDataArrayResult.OrderLineData) {
            order.lines = lines.OrderLine_GetDataArrayResult.OrderLineData;
          } else {
            order.lines = []
          }
          return order;
        })
    })
    // when all order lines has been loaded we create a new snapshot
    .then(orders => {
      self.emit('snapshot', {ids: snapshot.ids.concat(orders.map(order => order.Id))});
      return orders;
    })
    // send 'data' message
    .then(orders => self.emit('data', messages.newMessageWithBody({orders})))
    .catch(e => self.emit('error', e))
    .done(x => self.emit('end'))
  });
}
