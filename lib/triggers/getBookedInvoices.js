var economic = require('../economic');
var messages = require('elasticio-node').messages;
var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var Q = require('q');
var util = require('util');
var fs = require('fs');
var path = require('path');

exports.process = processTrigger;
exports._getDateNow = _getDateNow;

/**
 * Action - just wraps Date.now() to be able faked in spec
 */
function _getDateNow(){
    return Date.now();
};

function processTrigger(msg, cfg, snapshot) {
    var self = this;

    // init snapshot first time
    if (!snapshot.lastChecked) {
        var epoch = new Date(Date.parse('1970-01-01T00:00:00'));
        snapshot = { lastChecked : epoch.toISOString() };
    }

    // Build an API request
    var requestOptions = economic.createRequestOptions(cfg, 'invoices/booked', snapshot);

    Q.nfcall(request.get, requestOptions)
        .spread(onSuccess)
        .fail(handleError)
        .done();

    function handleError(err) {
        self.emit('error', err);
        self.emit('end');
    }

    /**
     * digest api raw data to output format
     *
     * @invoices - array of invoices from success body.collection
     */
    function digestRawInvoices(rawInvoices){
        var invoices;

        invoices = _.chain(rawInvoices)
            .reject(compareWithSnapshot)
            .sortBy(sortByDate)
            .map(digestInvoice)
            .value();

        function compareWithSnapshot(invoice){
            return moment(invoice.date).unix() < moment(snapshot.lastChecked).unix()
        }

        function digestInvoice(rawInvoice){
            var invoice = _.omit(rawInvoice,'customer','customerName','customerAddress',
                'customerPostalCode','customerCity','customerCountry','customerCounty',
                'paymentTerms');
            var date;

            invoice.customer = {
                customerNumber : rawInvoice.customer.customerNumber,
                name           : rawInvoice.customerName,
                address        : rawInvoice.customerAddress,
                postalCode     : rawInvoice.customerPostalCode,
                country        : rawInvoice.customerCountry,
                city           : rawInvoice.customerCity,
                county         : rawInvoice.customerCounty
            };
            date = invoice.date.split('-');
            invoice.year = date[0];
            invoice.month = date[1];
            invoice.dueDateTimestamp = Date.parse(invoice.dueDate);
            invoice.paymentTermsNumber = rawInvoice.paymentTerms.paymentTermsNumber;
            return invoice;
        }

        function sortByDate(invoice){
            return moment(invoice.date).unix();
        }

        return invoices;
    }

    function onSuccess(response, body) {

        if (response.statusCode !== 200) {
            throw new Error(JSON.stringify(body));
        }

        if (body.collection.length > 0){
            var promises;
            var invoices;

            invoices = digestRawInvoices(body.collection);
            promises = _.map(invoices, function (invoice) {
                var deferred = Q.defer();

                var newMsg = messages.newMessageWithBody(invoice);
                self.emit('data', newMsg);

                deferred.resolve();

                return deferred.promise;
            });

            Q.all(promises)
                .then(function (){
                    updateSnapshot();
                    self.emit('end');
                })
                .fail(function(e){
                    self.emit(e);
                    self.emit('end');
                }).done()

        } else {
            updateSnapshot();
            self.emit('end');
        }
    }

    function updateSnapshot(){
        var now = new Date(exports._getDateNow());
        var newSnapshot = { lastChecked : now.toISOString() };
        self.emit('snapshot', newSnapshot);
    }
}