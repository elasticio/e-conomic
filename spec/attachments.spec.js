describe('attachments', function() {
    process.env.S3_CRYPTO_PASSWORD = 'all-attachment-password';
    process.env.S3_CRYPTO_ALGORITHM = 'aes-256-cbc';

    var messages = require('../lib/attachments');
    var s3 = require('s3');
    var s3Client = require('s3/lib/client');
    var Q = require('q');

    var err;
    var response;

    var expectedLocation = 's3-path-to-foobarbaz.txt';
    var expectedUploadRes = {
        Location : expectedLocation
    };

    function catchError(e) {
        err = e;
    }

    function catchResponse(res) {
        response = res;
    }

    describe('addS3Attachment', function() {
        beforeEach(function() {
            process.env.S3_KEY = 'mykey';
            process.env.S3_SECRET = 'mysecret';
            process.env.S3_REGION = 'myregion';
            process.env.S3_BUCKET = 'mybucket';

            err = undefined;
            response = undefined;

            spyOn(s3, 'getFilename').andReturn(expectedLocation);
        });

        it('Successful addition of attachment', function () {
            var msg = {
                body: {
                    someParam: 'someParamValue'
                }
            };

            spyOn(s3Client.Client.prototype, 'putStream').andCallFake(function(path, stream) {
                return Q(expectedUploadRes);
            });

            runs(function() {
                messages.addS3Attachment(msg, 'foobarbaz.txt', new Buffer('CONTENT'))
                    .then(catchResponse)
                    .fail(catchError)
                    .done();
            });

            waitsFor(function() {
                return response;
            });

            runs(function() {
                expect(response.body).toEqual(msg.body);
                expect(response.attachments).toEqual({ 'foobarbaz.txt': { s3: expectedLocation }});
            });
        });

        it('Unsuccessful addition of attachment', function () {
            spyOn(s3Client.Client.prototype, 'putStream').andCallFake(function(path, stream) {
                return Q.reject({message: 'upload fail'});
            });

            runs(function () {
                messages.addS3Attachment({}, "foobarbaz.txt", new Buffer("CONTENT"))
                    .then(catchResponse)
                    .fail(catchError)
                    .done();
            });

            waitsFor(function () {
                return err;
            });

            runs(function () {
                expect(err.message).toEqual('upload fail');
            });
        });
    });

    describe('addUrlAttachment', function () {
        var name = 'file.txt';
        var url = 'http://some.com/test.txt';
        var msg;

        beforeEach(function () {
            msg = {
                body: {
                    id: 1
                }
            };
        });

        it('should add url message with defined attachments', function () {
            msg.attachments = {};
            messages.addUrlAttachment(msg, name, url);
            expect(msg.attachments['file.txt'].url).toEqual(url);
        });

        it('should add url message without defined attachments', function () {
            messages.addUrlAttachment(msg, name, url);
            expect(msg.attachments['file.txt'].url).toEqual(url);
        });
    });
});

