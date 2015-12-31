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
    .then(result => client.setSecurity(new Cookie(client.lastResponseHeaders)))
    .then(() => client.Invoice_GetAllAsync({}))
    .then(result => result.Invoice_GetAllResult)
    .then(entityHandles => client.Invoice_GetDataArrayAsync({entityHandles}))   
    .then(invoices => self.emit('data', messages.newMessageWithBody({invoices: invoices.Invoice_GetDataArrayResult})))
    .catch(e => self.emit('error', e))
    .done(x => self.emit('end'))
  });
}
