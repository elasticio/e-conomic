describe('e-conomic get booked invoices', function () {
    var request = require("request");
    var allBookedInvoicesInJSON = require('./../data/all_booked_invoices_in.json.js');
    var fs = require('fs');
    var path = require('path');
    var bookedInvoiceOut1JSON = require('./../data/booked_invoice_out.1.json.js');
    var bookedInvoiceOut2JSON = require('./../data/booked_invoice_out.2.json.js');
    var bookedInvoiceOut3JSON = require('./../data/booked_invoice_out.3.json.js');
    var messages = require('../../../../lib/components/messages.js');
    var processTrigger = require('../../../../lib/components/economic/lib/triggers/getBookedInvoices.js');
    var moment = require('moment');
    var nock = require('nock');
    var _ = require('underscore');
    var Q = require('q');

    var msg = messages.newMessageWithBody({});
    var cfg = {
        "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1",
        "toDownloadPDF"  : true
    };
    var snapshot = {lastChecked: '1970-01-01T00:00:00.000Z'};
    var newSnapshot;
    var next = jasmine.createSpy('next');

    process.env.S3_SECRET = process.env.S3_SECRET || 'my-secret';
    process.env.S3_KEY = process.env.S3_KEY       || 'my-key';
    process.env.S3_REGION = process.env.S3_REGION || 'eu-west-1';
    process.env.S3_BUCKET = process.env.S3_BUCKET || 'my-bucket';
    process.env.S3_CRYPTO_PASSWORD = 'chick-chick';
    process.env.S3_CRYPTO_ALGORITHM = 'aes-256-cbc';
    var s3 = require('s3').getClient(process.env.S3_BUCKET);

    var self;

    var bookedInvoicePDF1;
    var bookedInvoicePDF2;
    var bookedInvoicePDF3;

    function spyOnGetDateNow(date){
        var nowDate = date || 1412197200000; // 02-10-2014
        var fakeNow = new Date(nowDate);
        spyOn(processTrigger,'_getDateNow').andCallFake(function(){
            return fakeNow;
        });
    }

    function nockAllPDF(){
        var pdfURL;
        var fileName;

        pdfURL = 'https://restapi.e-conomic.com/invoices/booked/20001/pdf';
        fileName = path.join(process.cwd(),'spec/components/economic/data/20001.pdf');
        console.log('gonna load sync pdf mock from : %s',fileName);
        bookedInvoicePDF1 = fs.readFileSync(fileName,'utf8');

        pdfURL = 'https://restapi.e-conomic.com/invoices/booked/20002/pdf';
        fileName = path.join(process.cwd(),'spec/components/economic/data/20002.pdf');
        console.log('gonna load sync pdf mock from : %s',fileName);
        bookedInvoicePDF2 = fs.readFileSync(fileName,'utf8');

        pdfURL = 'https://restapi.e-conomic.com/invoices/booked/20003/pdf';
        fileName = path.join(process.cwd(),'spec/components/economic/data/20003.pdf');
        console.log('gonna load sync pdf mock from : %s',fileName);
        bookedInvoicePDF3 = fs.readFileSync(fileName,'utf8');

        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked/20001/pdf')
            .reply(200, bookedInvoicePDF1)
            .get('/invoices/booked/20002/pdf')
            .reply(200, bookedInvoicePDF2)
            .get('/invoices/booked/20003/pdf')
            .reply(200, bookedInvoicePDF3);
    }


    beforeEach(function(){
        spyOnGetDateNow();

        self = jasmine.createSpyObj('self',['emit']);

        var now = new Date(processTrigger._getDateNow());
        newSnapshot = { lastChecked : now.toISOString() };

        spyOn(messages, 'addS3StreamAttachment').andCallFake(function (msg, fileName) {
            var deferred = Q.defer();

            msg.attachments[fileName] = {
                s3: 'path/on/s3/' + fileName
            };

            deferred.promise.fail(function(e) {
                console.log("[mock]Failed to upload file to S3");
                console.log(e);

                return deferred.reject(e);
            });

            deferred.resolve();

            return deferred.promise;
        });

    });

    it('should emit new msg on success request', function () {
        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked?filter=date$gt:'+snapshot.lastChecked+'&pagesize=999')
            .reply(200, allBookedInvoicesInJSON)

            .get('/invoices/booked/20003/pdf')
            .reply(200, bookedInvoicePDF3);

        nockAllPDF();

        runs(function(){
            processTrigger.process.call(self, msg, cfg, next, snapshot);
        });

        waitsFor(function(){
            return self.emit.calls.length >= 8;
        });

        runs(function(){
            var calls = self.emit.calls;
            var keys;
            var dataIndex1 = 1;
            var dataIndex2 = 3;
            var dataIndex3 = 5;

            //calls.forEach(function(call){
            //    console.log(call.args[0]);
            //});

            expect(calls.length).toEqual(8); // heartbeat*3 -data*3 - snapshot - end

            //invoice #1.idx3
            expect(calls[dataIndex1].args[0]).toEqual('data');
            expect(calls[dataIndex1].args[1].body).toEqual(bookedInvoiceOut1JSON);

            keys = _.keys(calls[dataIndex1].args[1].attachments);
            expect(keys[0]).toEqual('booked-invoice-20001.pdf');
            keys = _.keys(calls[dataIndex1].args[1].attachments[keys[0]]);
            expect(keys[0]).toEqual('s3');

            //invoice #2.idx4
            expect(calls[dataIndex2].args[0]).toEqual('data');
            expect(calls[dataIndex2].args[1].body).toEqual(bookedInvoiceOut2JSON);

            keys = _.keys(calls[dataIndex2].args[1].attachments);
            expect(keys[0]).toEqual('booked-invoice-20002.pdf');
            keys = _.keys(calls[dataIndex2].args[1].attachments[keys[0]]);
            expect(keys[0]).toEqual('s3');

            //invoice #3.idx5
            expect(calls[dataIndex3].args[0]).toEqual('data');
            expect(calls[dataIndex3].args[1].body).toEqual(bookedInvoiceOut3JSON);

            keys = _.keys(calls[dataIndex3].args[1].attachments);
            expect(keys[0]).toEqual('booked-invoice-20003.pdf');
            keys = _.keys(calls[dataIndex3].args[1].attachments[keys[0]]);
            expect(keys[0]).toEqual('s3');

            // snapshot
            expect(calls[6].args[0]).toEqual('snapshot');
            expect(calls[6].args[1]).toEqual(newSnapshot);

            expect(calls[7].args).toEqual(['end']);

        });

    });

    it('should emit errors on request error', function () {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked?filter=date$gt:'+snapshot.lastChecked+'&pagesize=999')
            .reply(404, {
                "msg": "Resource not found.",
                "developerHint": "The API tries to provide all the resource urls you need. If you have hard coded urls yourself, then try to look at the enclosing collection for hypermedia information on where the resource you are looking for could be.",
                "logId": "4c87670f-a11e-4300-af31-9caa36c4e2ed",
                "httpStatusCode": 404
            });

        runs(function(){
            processTrigger.process.call(self, msg, cfg, next, snapshot);
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('error');
            expect(calls[0].args[1].message).toEqual('{"msg":"Resource not found.","developerHint":"The API tries to provide all the resource urls you need. If you have hard coded urls yourself, then try to look at the enclosing collection for hypermedia information on where the resource you are looking for could be.","logId":"4c87670f-a11e-4300-af31-9caa36c4e2ed","httpStatusCode":404}');

            expect(calls[1].args).toEqual(['end']);
        });
    });

    it('should filter incoming invoices and skip outdated', function () {
        var snapshot = { lastChecked : '2007-03-14T00:00:00.000Z' };

        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked?filter=date$gt:'+snapshot.lastChecked+'&pagesize=999')
            .reply(200, allBookedInvoicesInJSON);

        runs(function(){
            processTrigger.process.call(self, msg, cfg, next, snapshot);
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;

            expect(calls.length).toEqual(4);

            expect(calls[0].args[0]).toEqual('heartbeat');
            //invoice #3
            expect(calls[1].args[0]).toEqual('data');
            expect(calls[1].args[1].body).toEqual(bookedInvoiceOut3JSON);

            expect(calls[2].args[0]).toEqual('snapshot');
            expect(calls[2].args[1]).toEqual(newSnapshot);

            expect(calls[3].args).toEqual(['end']);

        });

    });

    it('should not download PDF if flag is not set', function () {
        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked?filter=date$gt:'+snapshot.lastChecked+'&pagesize=999')
            .reply(200, allBookedInvoicesInJSON);

        cfg.toDownloadPDF = false;

        runs(function(){
            processTrigger.process.call(self, msg, cfg, next, snapshot);
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;
            var keys;

            expect(calls.length).toEqual(5); // data*3 - snapshot - end

            //invoice #1.idx3
            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual(bookedInvoiceOut1JSON);
            expect(calls[0].args[1].attachments).toEqual({});

            //invoice #2.idx4
            expect(calls[1].args[0]).toEqual('data');
            expect(calls[1].args[1].body).toEqual(bookedInvoiceOut2JSON);
            expect(calls[1].args[1].attachments).toEqual({});


            //invoice #3.idx5
            expect(calls[2].args[0]).toEqual('data');
            expect(calls[2].args[1].body).toEqual(bookedInvoiceOut3JSON);
            expect(calls[2].args[1].attachments).toEqual({});

            // snapshot
            expect(calls[3].args[0]).toEqual('snapshot');
            expect(calls[3].args[1]).toEqual(newSnapshot);

            expect(calls[4].args).toEqual(['end']);

        });

    });

});