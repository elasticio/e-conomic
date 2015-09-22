describe('e-conomic create customer action', function() {

    var request = require("request");

    // customer with external ID
    var customerInJSON = require('./../data/create_customer_in.json.js');
    var customerOutJSON = require('./../data/create_customer_out.json.js');

    // customer without external ID
    var customer2InJSON = require('./../data/create_customer2_in.json.js');
    var customer2OutJSON = require('./../data/create_customer2_out.json.js');

    var messages = require('elasticio-node').messages;
    var processAction = require('../../lib/actions/createCustomer');
    var nock = require('nock');

    var msg = messages.newMessageWithBody(customerInJSON);
    var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1"};

    it('for customer with external ID - should emit data and updateSnapshot on success', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .post('/customers')
            .reply(201, customerOutJSON);

        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length;
        });

        runs(function () {
            var calls = self.emit.calls;
            expect(calls.length).toEqual(3);

            expect(calls[1].args[0]).toEqual('updateSnapshot');
            expect(calls[1].args[1]).toEqual({$set:{morkovka : 113}});

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual(customerOutJSON);

            expect(calls[2].args).toEqual(['end']);
        });
    });

    it('for customer without external ID - should emit only data on success', function() {

        var self = jasmine.createSpyObj('self', ['emit']);
        var msg = messages.newMessageWithBody(customer2InJSON);

        nock('https://restapi.e-conomic.com')
            .post('/customers')
            .reply(201, customer2OutJSON);

        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length;
        });

        runs(function () {
            var calls = self.emit.calls;
            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual(customer2OutJSON);

            expect(calls[1].args).toEqual(['end']);
        });
    });

    it('for customer with external ID in snapshot - should update that customer by ID', function() {

        var self = jasmine.createSpyObj('self', ['emit']);
        var snapshot = {
            'morkovka': 113
        };

        nock('https://restapi.e-conomic.com')
            .put('/customers/113')
            .reply(201, customerOutJSON);

        runs(function () {
            processAction.process.call(self, msg, cfg, snapshot);
        });

        waitsFor(function () {
            return self.emit.calls.length;
        });

        runs(function () {
            var calls = self.emit.calls;
            expect(calls.length).toEqual(3);

            expect(calls[1].args[0]).toEqual('updateSnapshot');
            expect(calls[1].args[1]).toEqual({$set:{morkovka : 113}});

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual(customerOutJSON);

            expect(calls[2].args).toEqual(['end']);
        });
    });

    it('should emit error message on 400 API response', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .post('/customers')
            .reply(400, { message : "Ouch" });


        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length;
        });

        runs(function () {
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('error');
            expect(calls[0].args[1].message).toEqual('Ouch {"message":"Ouch"}');

            expect(calls[1].args).toEqual(['end']);
        });
    });

    it('should rebound message on 400 API response with E06010 error code', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .post('/customers')
            .reply(400, { "errorCode" : "E06010", "message": "The entity cannot be created because the key already exists" });


        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length;
        });

        runs(function () {
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('rebound');
            expect(calls[0].args[1]).toEqual("The entity cannot be created because the key already exists");

            expect(calls[1].args).toEqual(['end']);
        });
    });

});