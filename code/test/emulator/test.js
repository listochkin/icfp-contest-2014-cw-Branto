'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var path = require('path');

var emulator = require('../../src/emulator');
// console.log('emulator ', emulator);

describe('Sample tests', function () {
    it('should run a sync test', function () {
        var x = 1;
        assert(x === 1, 'x is not 1');
    });

    it('should run an async test', function (done) {
        setTimeout(function () {
            var x = 1;
            assert(x === 1, 'x is not 1');
            done();
        }, 0);
    });

    it('should solve a map', function (done) {
        emulator({
            map: 1,
            ghosts: [1],
            lambda: 1,
            toCompletion: true
        }, function () {
            console.log(arguments);
            done();
        })
    });
});
