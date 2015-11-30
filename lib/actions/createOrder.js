var soap = require('soap');
var Cookie = require('soap-cookie');
var messages = require('elasticio-node').messages;
var Promise = require('bluebird');
var _ = require('lodash')

const URL = 'https://api.e-conomic.com/secure/api1/EconomicWebService.asmx?WSDL';

exports.process = processTrigger;


process.env.ECONOMIC_PRIVATE_APP_ID = 'U-QSQCySNl4LPlXdEpjCJPWcN52i6MPNMG7B6yMuCsU1'
var cfg = {
  accessId: 'uGIJH8z_SLw18BYktAZk3Ex-xtT-brG4PiijO0y3RUI1'
}
processTrigger({
  body: {
    Number: 124,
    DebtorName: 'TestDebtor',
    DebtorAddress: 'Some address',
    DebtorPostalCode: '000000',
    DebtorCity: 'Kiyv',
    DebtorCountry: 'Ukraine',
    DebtorEan: 'ean',
    PublicEntryNumber: 124,
    Date: new Date().toISOString(),
    DueDate: new Date().toISOString(),
    ExchangeRate: 1,
    IsVatIncluded: true,
    DeliveryAddress: 'some avenue',
    DeliveryPostalCode: '111111',
    DeliveryCity: 'Paris',
    DeliveryCountry: 'France',
    TermsOfDelivery: 'terms of delivery',
    DeliveryDate: new Date().toISOString(),
    Heading: 'test heading',
    TextLine1: 'text line 1',
    TextLine2: 'text line 2',
    IsArchived: false,
    IsSent: true,
    NetAmount: 1000,
    VatAmount: 10,
    GrossAmount: 1010,
    Margin: 20,
    MarginAsPercent: 0.1,
    RoundingAmount: 10
  }
}, cfg)

function processTrigger(msg, cfg, snapshot) {
  var token = cfg.accessId;
  var appToken = process.env.ECONOMIC_PRIVATE_APP_ID;
  var self = this
  var orderData = _.omit(msg.body, 'lines');
  self.emit = console.log
  soap.createClient(URL, function(err, client) {
    client = Promise.promisifyAll(client)
    client.ConnectWithTokenAsync({token, appToken})
    // set authorization
    .then(result => client.setSecurity(new Cookie(client.lastResponseHeaders)))
    .then(x => client.Order_CreateFromDataAsync({data: orderData}))
    .then(x => console.log(x))
    .catch(x => console.log(x))

  });
}
