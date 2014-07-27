'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var path = require('path'),
    stringify = require('json-stringify-safe');

var emulator = require('../../src/emulator'),
    compiler = require('../../src/ghc/compiler');

describe('Sample tests', function () {
    it.only('should compile a program', function () {
        var code = [
            '; consts',
            'fright := 1',

            '; awareness',
            'me := who( )',
            'myStartX, myStartY := start(me)',
            'myPosX, myPosY := pos(me)',
            'targetX, targetY := pacman(1)',
            'myMode := mode(me)',
            'ifEqual(myMode, fright, runaway, myPos, target)',
            'dir := findWay(myPosX, myPosY, targetX, targetY)',
            'go(dir)',
            'done()',
            'findWay: ; start',
            'end-findWay: a := 1'
        ].join('\n');

        var ghc = compiler(code);

        console.log('------');
        console.log(ghc);
    });

});
