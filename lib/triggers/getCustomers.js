var crypto = require('crypto');
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
    var self = this;

    // init snapshot first time
    if (!snapshot.lastChecked) {
        var epoch = new Date(Date.parse('1970-01-01T00:00:00'));
        snapshot = { lastChecked : epoch.toISOString() };
    }

    // Build an API request
    var requestOptions = economic.createRequestOptions(cfg, 'customers', snapshot);

    function onSuccess(response, body) {

        if (response.statusCode !== 200) {
            throw new Error(JSON.stringify(body));
        }

        if (body.collection.length>0){
            var outputMessage = messages.newMessageWithBody({
                "items": body.collection
            });

            self.emit('data', outputMessage);
        }
        var now = new Date(exports._getDateNow());
        var newSnapshot = { lastChecked : now.toISOString() };
        self.emit('snapshot', newSnapshot);
    }

    new HttpComponent(this)
        .success(onSuccess)
        .get(requestOptions);
};