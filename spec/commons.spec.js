describe('getCustomerGroups dynamic model',function(){

    var commons = require('../lib/commons/commons.js');
    var nock = require('nock');

    var allCustomerGroupsInJSON = require('./data/all_customer_groups_in.json.js');
    var allCustomerGroupsOutJSON = require('./data/all_customer_groups_out.json.js');
    var allPaymentTermsInJSON = require('./data/all_payment_terms_in.json.js');
    var allPaymentTermsOutJSON = require('./data/all_payment_terms_out.json.js');
    var allVatZonesInJSON = require('./data/all_vat_zones_in.json.js');
    var allVatZonesOutJSON = require('./data/all_vat_zones_out.json.js');

    describe('getCustomerGroups dynamic model',function(){

        it('should return list of customers on success req',function(){
            var self = jasmine.createSpyObj('self', ['emit']);
            var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1" };

            nock('https://restapi.e-conomic.com')
                .get('/customer-groups')
                .reply(200, allCustomerGroupsInJSON);

            var cb = jasmine.createSpy('cb');

            runs(function () {
                commons.getCustomerGroups.call(self, cfg, cb);
            });

            waitsFor(function () {
                return cb.calls.length;
            });

            runs(function () {

                expect(cb.calls.length).toEqual(1);
                expect(cb.calls[0].args[1]).toEqual(allCustomerGroupsOutJSON);

            });

        });
    });

    describe('getCustomerGroups dynamic model, response 400',function(){

        it('should return list of customers on success req',function(){

            var self = jasmine.createSpyObj('self', ['emit']);
            var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1" };

            nock('https://restapi.e-conomic.com')
                .get('/customer-groups')
                .reply(400, {"message": "Access Denied"});

            var cb = jasmine.createSpy('cb');

            runs(function () {
                commons.getCustomerGroups.call(self, cfg, cb);
            });

            waitsFor(function () {
                return cb.calls.length;
            });

            runs(function () {

                expect(cb.calls.length).toEqual(1);
                expect(cb.calls[0].args[0]).toBeDefined();
                expect(cb.calls[0].args[0].statusCode).toEqual(400);
                expect(cb.calls[0].args[0].json.message).toEqual('Access Denied');

            });

        });
    });

    describe('getPaymentTerms dynamic model',function(){
        it('should return list of payment terms on success req',function(){
            var self = jasmine.createSpyObj('self', ['emit']);
            var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1" };

            nock('https://restapi.e-conomic.com')
                .get('/payment-terms')
                .reply(200, allPaymentTermsInJSON);

            var cb = jasmine.createSpy('cb');

            runs(function () {
                commons.getPaymentTerms.call(self, cfg, cb);
            });

            waitsFor(function () {
                return cb.calls.length;
            });

            runs(function () {

                expect(cb.calls.length).toEqual(1);
                expect(cb.calls[0].args[1]).toEqual(allPaymentTermsOutJSON);

            });

        });
    });

    describe('getVatZones dynamic model',function(){
        it('should return list of vat zones on success req',function(){
            var self = jasmine.createSpyObj('self', ['emit']);
            var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1" };

            nock('https://restapi.e-conomic.com')
                .get('/vat-zones')
                .reply(200, allVatZonesInJSON);

            var cb = jasmine.createSpy('cb');

            runs(function () {
                commons.getVatZones.call(self, cfg, cb);
            });

            waitsFor(function () {
                return cb.calls.length;
            });

            runs(function () {

                expect(cb.calls.length).toEqual(1);
                expect(cb.calls[0].args[1]).toEqual(allVatZonesOutJSON);

            });

        });
    });

});
