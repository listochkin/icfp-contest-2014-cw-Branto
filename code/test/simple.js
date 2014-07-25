'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

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

    it('should test external modules', function () {
        var add = require('../src/add');
        var result = add(2, 3);
        assert(result === 5, 'got incorrect result');
    });
});
