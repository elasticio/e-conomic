var Q = require('q');
var request = require('request');
var _ = require('lodash');

var economic = require('../economic');
var messages = require('elasticio-node').messages;

exports.process = processAction;

function processAction(msg, cfg) {
    var that = this;
    var customerNumber = msg.body.customerNumber;

    if (!customerNumber) {
        that.emit('error', new Error('Customer number is required'));
        that.emit('end');
        return;
    }

    var requestOptions = economic.createRequestOptions(cfg, 'customers/'+customerNumber+'/contacts');

    Q.nfcall(request.get, requestOptions)
        .spread(handleContacts)
        .catch(messages.emitError.bind(that))
        .done(messages.emitEnd.bind(that));

    function handleContacts(httpResponse, responseBody) {
        if (!_.contains([200, 201], httpResponse.statusCode)) {
            throw new Error(JSON.stringify(responseBody));
        }

        var contacts = responseBody.collection;

        function attachCustomerNumber(contact) {
            contact.customerNumber = customerNumber;
            return contact;
        }

        if (_.isArray(contacts) && !_.isEmpty(contacts)) {
            contacts = contacts.map(attachCustomerNumber);
            messages.emitData.call(that, {contacts: contacts});
        }
    }
}