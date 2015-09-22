describe('e-conomic create invoice action', function() {

    var processAction = require('../../lib/actions/createInvoice');
    var economic = require('../../lib/economic');

    var messages = require('elasticio-node').messages;
    var nock = require('nock');

    var customerOutJSON = require('./../data/create_customer_out.json.js');

    var inputData = require('./../data/create_draft_invoice_in.json.js');
    var inputDataWithLines = require('./../data/create_draft_invoice_with_lines_in.json.js');

    var outputData = require('./../data/create_draft_invoice_out.json.js');

    var msg = messages.newMessageWithBody(inputData);
    var msgWithLines = messages.newMessageWithBody(inputDataWithLines);

    var cfg = { "accessId": "mraewfJwjUf9HRtjcWoVdqGYEXLqSGJlg_Y78WHwnTg1" };

    afterEach(function(){
        nock.cleanAll();
    });

    it('should emit error message on 400 API response for create customer', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/customers?filter=email$eq:' + msg.body.customer.email)
            .reply(200, {})
            // Create or update customer
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

    it('should emit messages on success', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/customers?filter=email$eq:' + msg.body.customer.email)
            .reply(200, {})
            // Create or update customer
            .post('/customers')
            .reply(201, customerOutJSON)
            // Create draft invoice
            .post('/invoices/drafts')
            .reply(200, outputData);

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
            expect(calls[0].args[1].body).toEqual(outputData);

            expect(calls[1].args).toEqual(['end']);
        });
    });

    it('should create products for each line', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/customers?filter=email$eq:' + msg.body.customer.email)
            .reply(200, {})
            // Create or update customer
            .post('/customers')
            .reply(201, customerOutJSON)
            // Create or update customer
            .post('/products')
            .reply(201, {})
            // Create or update customer
            .post('/products')
            .reply(201, {})
            // Create draft invoice
            .post('/invoices/drafts')
            .reply(200, outputData);

        runs(function () {
            processAction.process.call(self, msgWithLines, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length;
        });

        runs(function () {
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual(outputData);

            expect(calls[1].args).toEqual(['end']);
        });
    });

    it('should emit error message on 400 API response for create draft invoice', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .get('/customers?filter=email$eq:' + msg.body.customer.email)
            .reply(200, {})
            // Create or update customer
            .post('/customers')
            .reply(201, customerOutJSON)
            // Create draft invoice
            .post('/invoices/drafts')
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

    it('should convert strings to numbers, lines to array', function(){

        var self = jasmine.createSpyObj('self', ['emit']);

        var cfg = {
            "accessId": "0hyU488mFSb82xytVncGWDLS3fhsM8zb9jjZtmL_baQ1",
            "vatZoneId" : "1",
            "paymentTermId" : "3",
            "customerGroupId" : "1"
        };

        var msg = {
            body: {
                "lines": {
                    "0": {
                        "description": "SMS beskeder Danmark",
                        "quantity": "100",
                        "unitNetPrice": "14",
                        "product": {
                            "costPrice": "10.0",
                            "salesPrice": "14",
                            "unit": {
                                "name": "10000",
                                "unitNumber": "1"
                            },
                            "productGroup": {
                                "productGroupNumber": "1.0"
                            },
                            "name": "Test",
                            "productNumber": "10",
                            "recommendedPrice": "0.00",
                            "packageVolume": ""
                        },
                        "unit": {
                            "name": "10000",
                            "unitNumber": 1
                        }
                    }
                },
                "customer": {
                    "address": " ",
                    "name": "SureSMS",
                    "city": "Glostrup",
                    "country": "Denmark",
                    "currency": "DKK",
                    "email": "glen.mandsberg@suresms.com",
                    "customerNumber": "89936627",
                    "telephoneAndFaxNumber": "89936627",
                    "vatNumber": "33263104",
                    "zip": "2600"
                },
                "date": "2015-03-01",
                "attention": "1",
                "currency": "DKK",
                "dueDate": "2015-03-09",
                "layout": {
                    "layoutNumber": "19"
                },
                "margin": "1",
                "externalId": "1",
                "marginPercentage": "100",
                "netAmount": "120",
                "netAmountBaseCurrency": "120",
                "paymentTerms": {
                    "paymentTermsNumber": ""
                }
            }
        };

        nock('https://restapi.e-conomic.com')
            .get('/customers?filter=email$eq:glen.mandsberg@suresms.com')
            .reply(200, {})
            .post('/customers')
            .reply(201, customerOutJSON)
            .post('/products')
            .reply(201, {})
            // Create or update customer
            .post('/invoices/drafts')
            .reply(200, outputData);

        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length >=3;
        });

        runs(function () {
            var calls = self.emit.calls;

            expect(calls.length).toEqual(3);

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[1].args[0]).toEqual('updateSnapshot');
            expect(calls[2].args[0]).toEqual('end');

            // @TODO test that numbers and integers were converted
        });

    });
});
