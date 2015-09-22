/**
 * This functions have been copied from the components repository messages.js
 */

var s3 = require('s3');
var Q = require('q');

exports.addUrlAttachment = function(msg, name, url) {
    addEmptyAttachmentsIfRequired(msg);

    msg.attachments[name] = {
        url: url
    };
};

exports.addS3Attachment = function(msg, name, data) {
    var content = Buffer.isBuffer(data) ? data : new Buffer(data);
    var s3Client = s3.getClient(process.env.S3_BUCKET || 'my-bucket');

    return s3Client.putEncryptedBuffer(s3.getFilename(), content)
        .then(function(res) {
            console.log('Uploaded file to S3. URL : ' + decodeURIComponent(res.Location));
            addS3UrlAttachment(msg, name, res.Location);
            return Q(msg);
        })
        .fail(function(e) {
            console.log('Failed to upload file to S3');
            console.log(e);

            return Q.reject(e);
        });
};

exports.addS3StreamAttachment = function(msg, name, stream, contentLength) {
    var s3Client = s3.getClient(process.env.S3_BUCKET || 'my-bucket');

    return s3Client.putEncryptedStream(s3.getFilename(), stream)
        .then(function(res) {
            console.log('Uploaded file to S3. URL : ' + res.Location);
            addS3UrlAttachment(msg, name, res.Location);
            return Q(msg);
        })
        .fail(function(e) {
            console.log('Failed to upload file to S3');
            console.error(e);

            return Q.reject(e);
        });
};

function addS3UrlAttachment(msg, name, path) {
    addEmptyAttachmentsIfRequired(msg);
    var aPath = path.charAt(0) === '/' ? path.substring(1) : path;

    msg.attachments[name] = {
        s3: aPath
    };
}

function addEmptyAttachmentsIfRequired(msg) {
    msg.attachments = msg.attachments || {};
}
