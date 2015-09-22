var Q = require('q');
var economic = require('../client');
var commons = require('../commons/commons');
var _ = require('lodash');
var messages = require('elasticio-node').messages;
var objectUtilities = require('../ObjectUtilities');

exports.process = processAction;

exports.getCustomerGroups = commons.getCustomerGroups;
exports.getPaymentTerms = commons.getPaymentTerms;
exports.getVatZones = commons.getVatZones;

function processAction (msg, cfg, snapshot) {

    var emitter = this;

    snapshot = snapshot || {};

    var client = new economic.EconomicClient(cfg);

    var invoice = _.clone(objectUtilities.removeEmptyValues(msg.body));
    var externalId = msg.body.externalId;

    createCustomer()
        .then(createLineProducts)
        .then(createOrUpdateInvoice)
        .then(onSuccess)
        .fail(onError)
        .done(onDone);

    function createCustomer() {

        return client.customers.promiseCreateOrUpdateCustomer(msg.body.customer, cfg).then(setCustomerData);

        function setCustomerData(customerData){

            invoice.customer = {
                self: customerData.self
            };

            invoice.customerName = customerData.name;
            invoice.customerAddress = customerData.address;
            invoice.customerPostalCode = customerData.zip;
            invoice.customerCity = customerData.city;
            invoice.customerCountry = customerData.country;
            invoice.customerCounty = customerData.county;
        }
    }

    function createLineProducts() {

        var promises = _.map(invoice.lines, promiseCreateLineProduct);
        return Q.all(promises);

        function promiseCreateLineProduct(line){

            return client.products.promiseCreateOrUpdateProduct(line.product, cfg).then(setProductData);

            function setProductData(productData){
                line.product = {
                    self: productData.self
                };
            }
        }
    }

    function createOrUpdateInvoice() {
        return client.invoices.promiseCreateOrUpdateInvoice(invoice, cfg, snapshot[externalId]);
    }

    function onSuccess(body) {
        emitter.emit('data', messages.newMessageWithBody(body));
        if (externalId) {
            var modifier = {$set: {}};
            modifier.$set[externalId] = body.id;
            emitter.emit('updateSnapshot', modifier);
        }
    }

    function onError(err) {
        emitter.emit('error', err);
    }

    function onDone(){
        emitter.emit('end');
    }
}