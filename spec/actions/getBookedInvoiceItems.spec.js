describe('e-conomic get booked invoice items', function () {

    var request = require("request");
    var bookedInvoiceItemsIn1JSON = require('./../data/booked_invoice_items_in.1.json.js');
    var bookedInvoiceItemsIn2JSON = require('./../data/booked_invoice_items_in.2.json.js');
    var bookedInvoiceItemsOutJSON = require('./../data/booked_invoice_items_out.json.js');
    var messages = require('elasticio-node').messages;
    var processAction = require('../../lib/actions/getBookedInvoiceItems');
    var moment = require('moment');
    var nock = require('nock');

    var msg = messages.newMessageWithBody(bookedInvoiceItemsIn1JSON);
    var cfg = {"accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1"};

    var self;

    beforeEach(function(){
        self = jasmine.createSpyObj('self',['emit']);
        msg.attachments = {
            'test.pdf' :  {
                s3: 'path/on/s3/test.pdf'
            }
        };

    });

    it('should emit new msg on success request', function () {

        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked/20020')
            .reply(200, bookedInvoiceItemsIn2JSON);

        runs(function(){
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body.lines).toEqual(bookedInvoiceItemsOutJSON.lines);
            expect(calls[0].args[1].body).toEqual(bookedInvoiceItemsOutJSON);
            expect(calls[0].args[1].attachments).toBeDefined();
            expect(calls[0].args[1].attachments).toEqual(msg.attachments);

            expect(calls[1].args).toEqual(['end']);

        });

    });

    it('should emit errors on request error', function () {

        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked/20020')
            .reply(404, {
                "msg": "Resource not found.",
                "developerHint": "The API tries to provide all the resource urls you need. If you have hard coded urls yourself, then try to look at the enclosing collection for hypermedia information on where the resource you are looking for could be.",
                "logId": "4c87670f-a11e-4300-af31-9caa36c4e2ed",
                "httpStatusCode": 404
            });

        runs(function(){
            processAction.process.call(self, msg, cfg);
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

});