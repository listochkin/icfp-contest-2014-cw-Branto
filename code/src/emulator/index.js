'use strict';

module.exports = emulator;

var fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    phantom = require("phantom-wd");

var root = '../../'; // ./code

function emulator(options, cb) {

    var map = fs.readFileSync(path.join(__dirname, root, 'data/maps/' + options.map +'.map'), { encoding: 'utf8' });
    var ghosts = options.ghosts.map(function (ghost) {
        return fs.readFileSync(path.join(__dirname, root, 'data/ghosts/' + ghost +'.ghc'), { encoding: 'utf8' });
    });
    var pacman = fs.readFileSync(path.join(__dirname, root, 'data/pacmans/' + options.pacman +'.gcc'), { encoding: 'utf8' });

    console.log(map, ghosts, pacman);

    var game = 'file://' + path.join(__dirname, 'icfpcontest2014.github.io/game.html');

    var browser = phantom({
        debug: true,       // boolean, console.log PhantomJS output
        port:  8910        // number, which port PhantomJS should listen on
    });

    browser.then(function (browser) {
        return browser.get(game)
        .then(function () {


            return browser

            .elementById('lambda').type(pacman)
            .elementById('map').type(map)
            .elementsByCssSelector('#ghosts textarea').then(function (ghostInputs) {
                console.log(ghostInputs);
                return Q.all(ghosts.map(function (ghost, index) {
                    return ghostInputs[index].type(ghost);
                }));
            })
            .elementById('load').click()
            .sleep(1000)
            .elementById('step').click()
            .sleep(1000)
            .elementById('maze').getAttribute('width').then(function (width) {
                console.log('Maze size', width);
                return new Q();
            })
            .takeScreenshot().then(function (screen) {
                console.log('screen ', screen);
                fs.writeFileSync(path.join(__dirname, options.map + '.png'), screen, 'base64');
                return new Q();
            })


            // textarea#lambda
            // #map
            // #ghosts textarea
            // #load
            // #step
            // #runAll
            // #maze
            // #score #lives #ticks
            // #trace

        }).then(function () {
            cb(1);
            return Q.promise(function () {});
        }).fin(function() { return browser.quit(); })
    })

    .done();
}
