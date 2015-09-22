describe('Verify Credentials', function () {
    var nock = require('nock');
    var request = require('request');

    var verify = require('../../../lib/components/economic/verifyCredentials.js');

    var cfg;
    var cb;

    var BASE_URL = 'https://restapi.e-conomic.com';

    beforeEach(function () {
        cfg = {accessId: 'some-access-id'};
        cb = jasmine.createSpy('cb');
    });

    it('should return verified false if user did not provide accessId', function () {
        var cfg = {};

        waitsFor(function () {
            return cb.callCount;
        });

        verify(cfg, cb);

        runs(function () {
            expect(cb).toHaveBeenCalled();
            expect(cb.calls.length).toEqual(1);
            expect(cb).toHaveBeenCalledWith(null, {verified: false});
        });
    });

    it('should return verified false for 401 answer', function () {

        nock(BASE_URL)
            .get('/self')
            .reply(401, '');

        waitsFor(function () {
            return cb.callCount;
        });

        verify(cfg, cb);

        runs(function () {
            expect(cb).toHaveBeenCalled();
            expect(cb.calls.length).toEqual(1);
            expect(cb).toHaveBeenCalledWith(null, {verified: false});
        });
    });

    it('should return verified true for 200 answer', function () {
        nock(BASE_URL)
            .get('/self')
            .reply(200, {});

        waitsFor(function () {
            return cb.callCount;
        });

        verify(cfg, cb);

        runs(function () {
            expect(cb).toHaveBeenCalled();
            expect(cb.calls.length).toEqual(1);
            expect(cb).toHaveBeenCalledWith(null, {verified: true});
        });
    });

    it('should return error for 500 cases', function () {

        nock(BASE_URL)
            .get('/self')
            .reply(500, {message: 'super error 500'});


        waitsFor(function () {
            return cb.callCount;
        });

        verify(cfg, cb);

        runs(function () {
            expect(cb).toHaveBeenCalled();
            expect(cb.calls.length).toEqual(1);
            expect(cb.calls[0].args[0].message).toEqual('{"message":"super error 500"}');
        });
    });

    it('should return error for error cases', function () {

        spyOn(request, 'get').andCallFake(function (opt, cb) {
            cb({message: 'super error'});
        });

        waitsFor(function () {
            return cb.callCount;
        });

        verify(cfg, cb);

        runs(function () {
            expect(cb).toHaveBeenCalled();
            expect(cb.calls.length).toEqual(1);
            expect(cb.calls[0].args[0].message).toEqual('super error');
        });
    });


});