var request = require('request');
var economic = require('./lib/economic');

module.exports = verify;

function verify(credentials, cb) {
    if (!credentials.accessId) {
        return cb(null, {verified: false});
    }

    request.get(economic.createRequestOptions(credentials, 'self'), onResponse);

    function onResponse(err, res) {
        if (err) {
            return cb(err);
        }

        if (res.statusCode !== 200) {
            if (res.statusCode === 401) {
                return cb(null, {verified: false});
            }
            return cb(new Error(JSON.stringify(res.body)));
        } else {
            cb(null, {verified: true});
        }
    }
}
