'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var path = require('path'),
    fs = require('fs');

var emulator = require('../../src/emulator');
var Scheme2asm = require('../../src/Scheme2asm');

describe('Sample tests', function () {

    it('should eval in emulator', function (done) {
        this.timeout(15000);

        var s2asm = (new Scheme2asm());

        var code = [
            '(define (listn n) (if n (cons n (listn (- n 1))) 0))',
            '(cons (listn 10) 1)'
        ];

        // minimal main function
        var main_func = ['LDC 0', 'LDF 4', 'CONS', 'RTN'];
        var ast = code.map(s2asm.parse);
        // console.log(ast);
        // add main function first
        ast.unshift(main_func);
        var gcc = s2asm.compile(ast).join('\n');
        // console.log(gcc);

        emulator({
            map: 1,
            ghosts: [1],
            pacmanCode: gcc
        }, function (error, result) {
            console.log(result);
            console.log(result.trace);
            done();
        });
    });

    it('should eval Racket code', function () {

        this.timeout(1500);
        var s2asm = (new Scheme2asm());

        var code = s2asm.readFile2src(path.join(__dirname, '../../data/pacmans/2.gcc'));
        //console.log(code);

        var ast = code.map(s2asm.parse);
        console.log(ast);
        var gcc = s2asm.compile(ast, 0, true).join('\n');
        //console.log(gcc);

        assert(gcc.indexOf('#') < 0, 'found unimplemented instruction: ' + gcc.substr(gcc.indexOf('#'), 5))
    });
});
