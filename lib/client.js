var Q = require("q");
var util = require("util");
var economic = require("./economic.js");
var request = require("request");
var debug = require('debug')('economic:client');

var CustomersModule = require("./commons/customers.js").CustomersModule;
var ProductsModule = require("./commons/products.js").ProductsModule;
var InvoicesModule = require("./commons/invoices.js").InvoicesModule;

function EconomicClient(cfg) {

    function doRequest(httpMethod, url, body){
        var options = economic.createRequestOptions(cfg, url);

        debug('Request options: %j', options);
        debug('Request body: %j', body);

        if (body) {
            options.body = body;
        }

        return Q.nfcall(request[httpMethod], options)
            .spread(checkStatusCode.bind(this, [200, 201]));
    }

    function getErrorMessage(response, body){
        if (typeof body === 'string') {
            return body;
        } else if (body.message) {
            return util.format('%s %j', body.message, body);
        } else {
            return util.format('%j', body);
        }
    }

    function checkStatusCode(allowedStatusCodes, response, body){
        if (!~allowedStatusCodes.indexOf(response.statusCode)) {
            var err = new Error(getErrorMessage(response, body));
            err.statusCode = response.statusCode;
            err.json = body;
            throw err;
        }
        return body;
    }

    this.post = function(url, body){
        return doRequest('post', url, body);
    };

    this.put = function(url, body){
        return doRequest('put', url, body);
    };

    this.get = function(url){
        return doRequest('get', url);
    };

    this.customers = new CustomersModule(this);
    this.products = new ProductsModule(this);
    this.invoices = new InvoicesModule(this);
}

exports.EconomicClient = EconomicClient;
