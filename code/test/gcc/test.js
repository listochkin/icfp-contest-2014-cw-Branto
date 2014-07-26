'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var path = require('path'),
    fs = require('fs');

var emulator = require('../../src/emulator');
var Scheme2asm = require('../../src/Scheme2asm');

describe('Sample tests', function () {
    it('should run a sync test', function () {
        var x = 1;
        assert(x === 1, 'x is not 1');
    });

    it('should eval in emulator', function (done) {
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
            console.log(result.trace);
            done();
        });
    });

    it('should eval Racket code', function () {
        var src = fs.readFileSync(path.join(__dirname, '../../data/pacmans/2.gcc'), 'utf8');
        var lines = src.split('\n');
        var l2 = [[]];

        lines.forEach(function (line) {
            if (!line.length) { // empty line
                l2.push([]); // start new line
            } else {
                line = line.split(';')[0]; // strip comments
                l2[l2.length - 1].push(line);
            }
        });
        var code = l2.map(function (lineFragments) {
            return lineFragments.join(' ').replace(/\s{2,}/g, ' ').trim();
        }).filter(function (line) {
            return line.length > 0;
        });

        // console.log(code);
        var s2asm = (new Scheme2asm());

        var ast = code.map(s2asm.parse);
        // console.log(ast);
        var gcc = s2asm.compile(ast).join('\n');
        // console.log(gcc);

        assert(gcc.indexOf('#') < 0, 'found unimplemented instruction: ' + gcc.substr(gcc.indexOf('#'), 5))
    });
});
