describe('e-conomic create product action', function() {

    var processAction = require('../../lib/actions/createProduct');
    var products = require('../../lib/commons/products');
    var messages = require('elasticio-node').messages;
    var nock = require('nock');

    process.env.ECONOMIC_PUBLIC_KEY = 'xJYREvIW6-Dl3GipNYEeNrQPb1CjTB-x_26Gb4YuHTo1';

    var createProductInput = {
        "productNumber": "123456",
        "name": "test",
        "productGroup": {
            "productGroupNumber": 1
        },
        "costPrice": 123,
        "recommendedPrice": 456
    };

    var createProductResponse = require('./../data/create_product_response.json.js');

    var msg = messages.newMessageWithBody(createProductInput);
    var cfg = { "accessId": "ppTVL-APWnOoB03lz4jHjPAHSyBygs-MMdPtqyeNxVo1" };

    it('should emit message on success', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .post('/products')
            .reply(201, createProductResponse);

        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length >= 2;
        });

        runs(function () {
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('data');
            expect(calls[0].args[1].body).toEqual(createProductResponse);

            expect(calls[1].args).toEqual(['end']);
        });
    });

    it('should emit error on 400 status code', function() {
        var self = jasmine.createSpyObj('self', ['emit']);

        nock('https://restapi.e-conomic.com')
            .post('/products')
            .reply(400, { message : "Ouch" });


        runs(function () {
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function () {
            return self.emit.calls.length >= 2;
        });

        runs(function () {
            var calls = self.emit.calls;

            expect(calls.length).toEqual(2);

            expect(calls[0].args[0]).toEqual('error');
            expect(calls[0].args[1].message).toEqual('Ouch {"message":"Ouch"}');

            expect(calls[1].args).toEqual(['end']);
        });
    });

    describe('buildProduct', function() {

        var productsModule = new products.ProductsModule();

        var cfg = {
            productGroupNumber: '5'
        };

        it('from message with empty fields', function () {

            var msgBody = {
                productNumber: '123456',
                name: 'Name',
                productGroup: null,
                costPrice: '',
                recommendedPrice: '',
                salesPrice: ''
            };

            var result = productsModule.buildProduct(msgBody, cfg);
            expect(result).toEqual({
                productNumber : '123456',
                name : 'Name',
                barred : false,
                productGroup : {
                    productGroupNumber : 5
                }
            });
        });

        it('from message with non-empty fields', function () {
            var msgBody = {
                productNumber: '123456',
                name: 'Name',
                productGroup: null,
                costPrice: '12.55',
                recommendedPrice: '13.55',
                salesPrice: '18'
            };

            var result = productsModule.buildProduct(msgBody, cfg);
            expect(result).toEqual({
                productNumber : '123456',
                name : 'Name',
                costPrice : 12.55,
                recommendedPrice : 13.55,
                salesPrice : 18,
                barred : false,
                productGroup : {
                    productGroupNumber : 5
                }
            });
        });
    });
});