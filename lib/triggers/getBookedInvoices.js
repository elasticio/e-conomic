'use strict';

let soap = require('soap');
let Cookie = require('soap-cookie');
let messages = require('elasticio-node').messages;
let Promise = require('bluebird');

const URL = 'https://soap.reviso.com/api1/?WSDL';

exports.process = processTrigger;

function processTrigger(msg, cfg) {
  let token = cfg.accessId;
  let appToken = process.env.ECONOMIC_PRIVATE_APP_ID;
  let self = this;
  soap.createClient(URL, function(err, client) {
    if (err) {
      self.emit('error', err);
      return self.emit('end');
    }
    client = Promise.promisifyAll(client)
    client.ConnectWithTokenAsync({token, appToken})
    .then(() => client.setSecurity(new Cookie(client.lastResponseHeaders)))
    .then(() => client.Invoice_GetAllAsync({}))
    .then(result => result.Invoice_GetAllResult)
    .then(entityHandles => client.Invoice_GetDataArrayAsync({entityHandles}))   
    .then(invoices => self.emit('data', messages.newMessageWithBody({invoices: invoices.Invoice_GetDataArrayResult.InvoiceData})))
    .catch(e => self.emit('error', e))
    .done(x => self.emit('end'))
  });
}
