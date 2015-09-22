'use strict';
var economic = require('./../economic.js');
var HttpComponent = require('elasticio-node').HttpComponent;
var messages = require('./../../../messages');
var _ = require('underscore');

exports.process = processAction;
exports.digestRawInvoiceData = digestRawInvoiceData;

function processAction(msg, cfg) {
    var self = this;

    var requestOptions = economic.createRequestOptions(cfg, 'invoices/booked/' + msg.body.id);

    new HttpComponent(this)
        .success(onSuccess)
        .get(requestOptions);

    function onSuccess(response, body) {

        if (response.statusCode !== 200) {
            throw new Error(JSON.stringify(body));
        }

        if (body.id){
            var invoice = digestRawInvoiceData(body);
            var newMsg = messages.newMessageWithBody(invoice);

            newMsg.attachments = _.extend(newMsg.attachments, msg.attachments);
            self.emit('data', newMsg );
        }
    }
}

/**
 * digest api raw data to output format
 *
 * @rawInvoice - raw invoice from success body
 */
function digestRawInvoiceData(rawInvoice){
    var invoice;
    var date;

    invoice = _.omit(rawInvoice,'customer','customerName','customerAddress',
        'customerPostalCode','customerCity','customerCountry','customerCounty',
        'paymentTerms');

    invoice.customer = {
        customerNumber      : rawInvoice.customer.customerNumber,
        name                : rawInvoice.customer.name,
        currency            : rawInvoice.customer.currency,
        address             : rawInvoice.customer.address,
        country             : rawInvoice.customer.country,
        city                : rawInvoice.customer.city,
        county              : rawInvoice.customerCounty,
        paymentTermsNumber  : rawInvoice.customer.paymentTerms.paymentTermsNumber,
        customerGroupNumber : rawInvoice.customer.customerGroup.customerGroupNumber,
        balance             : rawInvoice.customer.balance,
        email               : rawInvoice.customer.email,
        zip                 : rawInvoice.customer.zip,
        vatZoneNumber       : rawInvoice.customer.vatZone.vatZoneNumber,
        lastUpdated         : rawInvoice.customer.lastUpdated
    };

    date = invoice.date.split('-');
    invoice.year = date[0];
    invoice.month = date[1];
    invoice.dueDateTimestamp = Date.parse(invoice.dueDate);
    invoice.paymentTermsNumber = rawInvoice.paymentTerms.paymentTermsNumber;

    if (_.isArray(invoice.lines)) {
        invoice.lines = invoice.lines.map(function(line){
            line.totalGrossAmount = line.totalNetAmount + (line.vatAmount || 0);
            line.totalGrossAmount = +line.totalGrossAmount.toFixed(2);
            return line;
        });
    }

    return invoice;
}
