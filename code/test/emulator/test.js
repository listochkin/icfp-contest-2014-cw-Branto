'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var path = require('path'),
    stringify = require('json-stringify-safe');

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

    it('should execute a number of steps', function (done) {
        emulator({
            map: 1,
            ghosts: [1],
            pacman: 1,
            steps: 10
        }, function  (error, result) {
            assert(error == null, 'there was an error running an emulator');
            assert('score' in result);
            done();
        });
    })

    it('should solve a map', function (done) {
        this.timeout(15000);
        emulator({
            map: 1,
            ghosts: [1],
            pacman: 1,
            interval: 2000,
            timeout: 10000,
            screenshots: true
        }, function (error, result) {
            assert(error == null, 'there was an error running an emulator');
            assert('milestones' in result);
            console.log(stringify(result, null, 4));
            done();
        })
    });
});
