describe('e-conomic getCustomersContacts', function(){
    var nock = require('nock');
    var path = require('path');

    var API_URL = 'https://restapi.e-conomic.com';

    var componentPath = path.join('../../');
    var processAction = require(path.join(componentPath, 'lib/actions/getCustomersContacts'));

    var self;
    var msg = {
        body: {
            customerNumber: 1
        }
    };

    var cfg = {};

    beforeEach(function(){
        self = jasmine.createSpyObj('self',['emit']);
    });

    it('should emit data', function(){
        nock(API_URL)
            .get('/customers/1/contacts')
            .reply(200, {
                collection: [
                    {name: 'cont1'},
                    {name: 'cont2'}
                ]
            });

        runs(function(){
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function(){
            return self.emit.calls.length === 2;
        });

        runs(function() {
            var calls = self.emit.calls;
            var contacts = calls[0].args[1].body.contacts;

            expect(calls[0].args[0]).toBe('data');
            expect(Array.isArray(contacts)).toBeTruthy();
            expect(contacts[0].name).toBe('cont1');
            expect(contacts[0].customerNumber).toBe(1);
            expect(contacts[1].name).toBe('cont2');
            expect(contacts[1].customerNumber).toBe(1);
            expect(calls[1].args[0]).toBe('end');
        });
    });

    it('should emit error', function(){
        nock(API_URL)
            .get('/customers/1/contacts')
            .reply(404, 'some error');

        runs(function(){
            processAction.process.call(self, msg, cfg);
        });

        waitsFor(function(){
            return self.emit.calls.length === 2;
        });

        runs(function(){
            var calls = self.emit.calls;

            expect(calls[0].args[0]).toBe('error');
            expect(calls[0].args[1] instanceof Error).toBeTruthy();
            expect(calls[0].args[1].toString()).toContain('some error');
            expect(calls[1].args[0]).toBe('end');
        });
    });

    it('should emit error if customer number is empty', function(){
        runs(function(){
            processAction.process.call(self, {body: {}}, cfg);
        });

        waitsFor(function(){
            return self.emit.calls.length === 2;
        });

        runs(function(){
            var calls = self.emit.calls;

            expect(calls[0].args[0]).toBe('error');
            expect(calls[0].args[1] instanceof Error).toBeTruthy();
            expect(calls[0].args[1].toString()).toContain('is required');
            expect(calls[1].args[0]).toBe('end');
        });
    });
});
