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

        var code = [
            '(define (listn n) (if n (cons n (listn (- 1 n))) 0))',
            '(listn 10)'
        ];

        var ast = code.map(s2asm.parse);
        console.log(ast);
        var gcc = s2asm.compile(ast).join('\n');
        console.log(gcc);

        emulator({
            map: 1,
            ghosts: [1],
            pacmanCode: gcc,
            steps: 100
        }, function (error, result) {
            console.log(result);
            done();
        });
    });
});
