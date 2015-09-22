var _ = require('lodash');
var economic = require('./../economic');
var messages = require('elasticio-node').messages;
var Q = require('q');
var request = require('request');
var util = require('util');

exports.checkFloatFields = checkFloatFields;
exports.checkIntegerFields = checkIntegerFields;

exports.getCustomerGroups = getKeysValuesFunction(
    'customer-groups', 'customerGroupNumber', 'name'
);
exports.getPaymentTerms = getKeysValuesFunction(
    'payment-terms', 'paymentTermsNumber', 'name'
);
exports.getVatZones = getKeysValuesFunction(
    'vat-zones', 'vatZoneNumber', 'name'
);
exports.getProductGroups = getKeysValuesFunction(
    'product-groups', 'productGroupNumber', 'name'
);

function getKeysValuesFunction(economicUrl, keyParameter, valueParameter) {

    return function getKeysValues(cfg, cb){

        // it's included here, because if included on top, circular reference happens
        var EconomicClient = require('./../client.js').EconomicClient;
        var client = new EconomicClient(cfg);

        client.get(economicUrl)
            .then(onSuccess)
            .fail(cb)
            .done();

        function onSuccess(data) {
            var result = {};
            if (data && data.collection && data.collection.length > 0) {
                data.collection.forEach(function(record){
                    result[record[keyParameter]] = record[valueParameter];
                });
            }
            cb(null, result);
        }
    }
}

function checkFloatFields(object, fields){
    _.each(fields, function (field){
        if (object && object[field]) {
            object[field] = parseFloat(object[field]);
            if (isNaN(object[field])) {
                throw new Error(util.format('%s should be a valid numeric value!', field));
            }
        }
    })
}

function checkIntegerFields(object, fields){
    _.each(fields, function (field){
        if (object && object[field]) {
            object[field] = parseInt(object[field], 10);
            if (isNaN(object[field])) {
                throw new Error(util.format('%s should be a valid integer!', field));
            }
        }
    })
}