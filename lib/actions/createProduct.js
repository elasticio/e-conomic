var economic = require('./../client.js');
var messages = require('./../../../messages.js');
var commons = require('./../commons/commons.js');
var _ = require('lodash-node');

/**
 * customer schema is described here
 * http://restdocs.e-conomic.com/
 * https://restapi.e-conomic.com/schema/products.post.schema.json
 */

exports.process = processAction;
exports.getProductGroups = commons.getProductGroups;

function processAction (msg, cfg, next, snapshot) {
    var emitter = this;

    var client = new economic.EconomicClient(cfg);

    client.products.promiseCreateOrUpdateProduct(msg.body, cfg)
        .then(onSuccess)
        .fail(onError)
        .done(onDone);

    function onSuccess(body) {
        emitter.emit('data', messages.newMessageWithBody(body));
    }

    function onError(err) {
        emitter.emit('error', err);
    }

    function onDone(){
        emitter.emit('end');
    }
}
