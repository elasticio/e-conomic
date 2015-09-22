var economic = require('../client');
var commons = require('../commons/commons');
var messages = require('elasticio-node').messages;

/**
 * customer schema is described here
 * http://restdocs.e-conomic.com/
 * https://restapi.e-conomic.com/schema/customers.post.schema.json
 */

exports.process = processAction;

exports.getCustomerGroups = commons.getCustomerGroups;
exports.getPaymentTerms = commons.getPaymentTerms;
exports.getVatZones = commons.getVatZones;

function processAction (msg, cfg, snapshot) {

    var that = this;
    snapshot = snapshot || {};

    var client = new economic.EconomicClient(cfg);
    var externalId = msg.body.externalId;

    client.customers.promiseCreateOrUpdateCustomer(msg.body, cfg, snapshot[externalId])
        .then(onSuccess)
        .fail(onError)
        .done(onDone);

    function onSuccess(localBody) {
        // successful
        var msg =  messages.newMessageWithBody(localBody);
        that.emit('data', msg);
        if (externalId) {
            var modifier = {$set: {}};
            modifier.$set[externalId] = localBody.customerNumber;
            that.emit('updateSnapshot', modifier);
        }
    }

    function onError(err) {
        if (err.statusCode === 400 && err.json.errorCode === 'E06010') {
            that.emit('rebound', err.json.message);
        } else {
            that.emit('error', err);
        }
    }

    function onDone(){
        that.emit('end');
    }
}