'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var path = require('path');

var emulator = require('../../src/emulator');
var Scheme2asm = require('../../src/Scheme2asm');

describe('Sample tests', function () {
    it('should run a sync test', function () {
        var x = 1;
        assert(x === 1, 'x is not 1');
    });

    it.only('should eval in emulator', function (done) {
        var s2asm = (new Scheme2asm());
        var str2 = '(+ 1 2)';
        console.log(s2asm.parse(str2));

        var code = s2asm.parse(str2).join('\n');

        emulator({
            map: 1,
            ghosts: [1],
            pacmanCode: code,
            steps: 100
        }, function (error, result) {
            console.log(result);
            done();
        });
    });
});
