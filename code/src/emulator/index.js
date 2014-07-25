'use strict';

module.exports = emulator;

var fs = require('fs'),
    path = require('path'),
    wd = require('wd');

var root = '../../'; // ./code

function emulator(options, cb) {

    var map = fs.readFileSync(path.join(__dirname, root, 'data/maps/' + options.map +'.map'), { encoding: 'utf8' });


    cb(1, 'args');
}
