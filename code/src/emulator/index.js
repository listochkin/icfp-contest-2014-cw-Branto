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

    var result = {
        score: 0,
        lives: 0,
        ticks: 0
    }

    browser.then(function (browser) {
        return browser.windowHandle().then(function (handle) {
            return browser.setWindowSize(2000, 2000, handle);
        }).get(game)
        .then(function () {

            return browser

            .elementById('lambda').clear().type(pacman)
            .elementById('map').clear().type(map)
            .elementsByCssSelector('#ghosts textarea').then(function (ghostInputs) {
                return Q.all(ghosts.map(function (ghost, index) {
                    return ghostInputs[index].clear().type(ghost);
                }));
            })
            .elementById('load').click()
            .then(function () {
                if ('steps' in options) {
                    var promise = browser.elementById('step');
                    for (var i = 0; i < options.steps; i++) {
                        promise = promise.click();
                    }
                    return promise;
                } else {
                    throw new Error('not iplemented');
                }
                return new Q();
            })
            .elementById('score').text().then(function (text) {
                result.score = parseInt(text, 10);
                return new Q;
            })
            .elementById('lives').text().then(function (text) {
                result.lives = parseInt(text, 10);
                return new Q;
            })
            .elementById('ticks').text().then(function (text) {
                result.ticks = parseInt(text, 10);
                return new Q;
            })
            .takeScreenshot().then(function (screen) {
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

        }).fin(function() { return browser.quit(); })
    }).then(function () {
        cb(null, result);
        return Q.promise(function () {});
    })

    .done();
}
