'use strict';

var chai = require('chai');
chai.config.includeStack = true;
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
            // 'ifEqual(myMode, fright, runaway, myPos, target)',
            'tile := map(0, 0)',
            'dir := findWay(myPosX, myPosY, targetX, targetY)',
            'go(dir)',
            'done()',
            'findWay: a := 0 ; start',
            'end-findWay: a := 1'
        ].join('\n');

        var ghc = compiler(code);

        console.log('------');
        console.log(ghc);
        console.log('-------');
        console.log(ghc.split('\n').length);
    });

});
