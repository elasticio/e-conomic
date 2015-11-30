describe('e-conomic get products trigger', function () {

    var request = require("request");
    var allProductsJSON = require('./../data/all_products.json.js');
    var allProductsOutJSON = require('./../data/all_products_out.json.js');
    var messages = require('elasticio-node').messages;
    var processTrigger = require('../../lib/triggers/getProductsList');
    var nock = require('nock');

    var msg = messages.newMessageWithBody({});
    var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1"};
    var snapshot = { lastChecked : '1970-01-01T00:00:00.000Z' };
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

        self = jasmine.createSpyObj('self',['emit']);

        var now = new Date(processTrigger._getDateNow());
        newSnapshot = { lastChecked : now.toISOString() };
    });

    it('should emit new msg on success request', function () {

        nock('https://restapi.e-conomic.com')
            .get('/products?filter=lastUpdated$gt:' + snapshot.lastChecked + '&pagesize=999')
            .reply(200, allProductsJSON);

        runs(function(){
            processTrigger.process.call(self, msg, cfg, snapshot);
        });

        waitsFor(function(){
            return self.emit.calls.length;
        });

        runs(function(){
            var calls = self.emit.calls;
            expect(calls.length).toEqual(3);
            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual({items: allProductsOutJSON});
            expect(calls[1].args[0]).toEqual('snapshot');
            expect(calls[1].args[1]).toEqual(newSnapshot);
            expect(calls[2].args).toEqual(['end']);
        });
    });

    it('should emit errors on request error', function () {

        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/products?filter=lastUpdated$gt:'+snapshot.lastChecked + '&pagesize=999')
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

});
