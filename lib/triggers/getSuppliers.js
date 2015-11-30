var economic = require('./../economic.js');
var HttpComponent = require('elasticio-node').HttpComponent;
var messages = require('elasticio-node').messages;
var moment = require('moment');

exports.process = processTrigger;
exports._getDateNow = _getDateNow;

/**
 * Action - just wraps Date.now() to be able faked in spec
 */
function _getDateNow(){
    return Date.now();
};

function processTrigger(msg, cfg, snapshot) {
    snapshot = snapshot || {numbers: []}
    this.emit = console.log
    var requestOptions = economic.createRequestOptions(cfg, 'suppliers');

    new HttpComponent(this)
        .success(onSuccess.bind(this))
        .get(requestOptions);

    function onSuccess(response, body) {
        if (response.statusCode !== 200) {
            throw new Error(JSON.stringify(body));
        }
        var items = body.collection.filter(supplier => snapshot.numbers.indexOf(supplier.supplierNumber) === -1)
        if (items.length > 0){
            var outputMessage = messages.newMessageWithBody({items});
            this.emit('data', outputMessage);
        }
        var now = new Date(exports._getDateNow());
        var newSnapshot = {}
        newSnapshot.numbers = body.collection.map(supplier => supplier.supplierNumber)
        this.emit('snapshot', newSnapshot);
    }
}
