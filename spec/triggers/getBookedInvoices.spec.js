describe('e-conomic get booked invoices', function () {
    var request = require("request");
    var allBookedInvoicesInJSON = require('./../data/all_booked_invoices_in.json.js');
    var fs = require('fs');
    var path = require('path');
    var bookedInvoiceOut1JSON = require('./../data/booked_invoice_out.1.json.js');
    var bookedInvoiceOut2JSON = require('./../data/booked_invoice_out.2.json.js');
    var bookedInvoiceOut3JSON = require('./../data/booked_invoice_out.3.json.js');
    var elastic = require('elasticio-node');
    var messages = elastic.messages;
    var processTrigger = require('../../lib/triggers/getBookedInvoices');
    var moment = require('moment');
    var nock = require('nock');
    var _ = require('lodash');
    var Q = require('q');

    var msg = messages.newMessageWithBody({});
    var cfg = {
        "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1",
        "toDownloadPDF": true
    };
    var snapshot = {lastChecked: '1970-01-01T00:00:00.000Z'};
    var newSnapshot;

    var self;

    function spyOnGetDateNow(date){
        var nowDate = date || 1412197200000; // 02-10-2014
        var fakeNow = new Date(nowDate);
        spyOn(processTrigger,'_getDateNow').andCallFake(function(){
            return fakeNow;
        });
    }


    beforeEach(function(){
        spyOnGetDateNow();

        self = jasmine.createSpyObj('self', ['emit']);

        var now = new Date(processTrigger._getDateNow());
        newSnapshot = { lastChecked : now.toISOString() };

    });

    it('should emit new msg on success request', function () {
        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked?filter=date$gt:'+snapshot.lastChecked+'&pagesize=999')
            .reply(200, allBookedInvoicesInJSON);

        runs(function(){
            processTrigger.process.call(self, msg, cfg, snapshot);
        });

        waitsFor(function(){
            console.log(self.emit.calls.length);
            return self.emit.calls.length >= 5;
        });

        runs(function(){
            var calls = self.emit.calls;
            var keys;
            var dataIndex1 = 0;
            var dataIndex2 = 1;
            var dataIndex3 = 2;

            expect(calls.length).toEqual(5); // heartbeat*3 -data*3 - snapshot - end

            //invoice #1.idx3
            expect(calls[dataIndex1].args[0]).toEqual('data');
            expect(calls[dataIndex1].args[1].body).toEqual(bookedInvoiceOut1JSON);

            //invoice #2.idx4
            expect(calls[dataIndex2].args[0]).toEqual('data');
            expect(calls[dataIndex2].args[1].body).toEqual(bookedInvoiceOut2JSON);

            //invoice #3.idx5
            expect(calls[dataIndex3].args[0]).toEqual('data');
            expect(calls[dataIndex3].args[1].body).toEqual(bookedInvoiceOut3JSON);

            // snapshot
            expect(calls[3].args[0]).toEqual('snapshot');
            expect(calls[3].args[1]).toEqual(newSnapshot);

            expect(calls[4].args).toEqual(['end']);

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
            processTrigger.process.call(self, msg, cfg, snapshot);
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

    xit('should filter incoming invoices and skip outdated', function () {
        var snapshot = { lastChecked : '2007-03-14T00:00:00.000Z' };

        nock('https://restapi.e-conomic.com')
            .get('/invoices/booked?filter=date$gt:'+snapshot.lastChecked+'&pagesize=999')
            .reply(200, allBookedInvoicesInJSON);

        runs(function(){
            processTrigger.process.call(self, msg, cfg, snapshot);
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

});