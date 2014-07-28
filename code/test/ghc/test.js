'use strict';

var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var path = require('path'),
    fs = require('fs'),
    stringify = require('json-stringify-safe');

var emulator = require('../../src/emulator'),
    compiler = require('../../src/ghc/compiler');

describe('Sample tests', function () {
    it('should compile a program', function () {
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

    it.only('should compile AI algorythm', function () {
        // def default_ghost_ai(world, ghost):
        //     turns = direction_turns(ghost.direction)
        //     ways_to_go = [d for d in turns + [ghost.direction] if can_move(world, ghost.pos, d)]
        //     if len(ways_to_go) == 0:
        //         direction = direction_back(ghost.direction)
        //     elif len(ways_to_go) == 1:
        //         direction = ways_to_go[0]
        //     else:
        //         choices = [(d, manhattan_distance(move_from(ghost.pos, d), world.laman.pos)) for d in ways_to_go]
        //         direction = min(choices, key=lambda x: x[1]) [0]
        //         # if len(choices) > 1:
        //         #     choice_names = ','.join([DIRECTION_NAMES[d] for d in ways_to_go])
        //         #     dname = DIRECTION_NAMES[self.direction]
        //         #     print('Choice point between {}; chose {}'.format(choice_names, dname))
        //     return direction

        var code = [
            // initialization
            'up := 0',
            'left := 0',
            'down := 0',
            'right := 0',
            // 'a := firstTime',
            // 'ifEqualSet(a, 0, firstTime, 1, lastDirection, down)',


            // 1. Check directions
            'me := who()',
            // 'myMode := mode(me)',
            // 'ifFright(myMode)',
            'myPosX, myPosY := pos(me)',
            'targetX, targetY := pacmanStart(1)',

            // init distances:
            'manhUp := 255',
            'manhDown := 255',
            'manhLeft := 255',
            'manhRight := 255',

            // 1.1 Up
            'upX := myPosX',
            'upY := myPosY - 1',
            'tile := map(upX, upY)',
            'ifCanMove(tile, distanceUp)',

            // 1.2 Left
            'leftX := myPosX - 1',
            'leftY := myPosY',
            'tile := map(leftX, leftY)',
            'ifCanMove(tile, distanceLeft)',

            // 1.3 Down
            'downX := myPosX',
            'downY := myPosY + 1',
            'tile := map(downX, downY)',
            'ifCanMove(tile, distanceDown)',

            // 1.4 Right
            'rightX := myPosX + 1',
            'rightY := myPosY',
            'tile := map(rightX, rightY)',
            'ifCanMove(tile, distanceRight)',

            // 2. Find the closest
            // manhUp, manhLeft, manhDown, manhRight
            // 'cantGo := oposite(lastDirection)',
            'call-minKey: direction := minKey(up, manhUp, left, manhLeft, down, manhDown, right, manhRight)',
            'go(direction)',

            // remember chosen dirrection
            'lastDirection := direction',

            // DONE!
            'done()',

            // calculate distances
            'distanceUp: mulUpX := upX - targetX',
            'mulUpX := mulUpX * mulUpX',
            'mulUpY := upY - targetY',
            'mulUpY := mulUpY * mulUpY',
            'end-distanceUp: manhUp := mulUpX + mulUpY',

            'distanceLeft: mulLeftX := leftX - targetX',
            'mulLeftX := mulLeftX * mulLeftX',
            'mulLeftY := leftY - targetY',
            'mulLeftY := mulLeftY * mulLeftY',
            'end-distanceLeft: manhLeft := mulLeftX + mulLeftY',

            'distanceDown: mulDownX := downX - targetX',
            'mulDownX := mulDownX * mulDownX',
            'mulDownY := downY - targetY',
            'mulDownY := mulDownY * mulDownY',
            'end-distanceDown: manhDown := mulDownX + mulDownY',

            'distanceRight: mulRightX := rightX - targetX',
            'mulRightX := mulRightX * mulRightX',
            'mulRightY := rightY - targetY',
            'mulRightY := mulRightY * mulRightY',
            'end-distanceRight: manhRight := mulRightX + mulRightY',
            //*/
            '',
        ].join('\n') || '';

        console.log('------');
        var ghc = compiler(code);

        console.log('------');
        console.log(ghc);
        fs.writeFileSync(path.join(__dirname, 'ghost.ghc'), ghc, 'utf8');
        console.log('-------');
        console.log(ghc.split('\n').length);
        ghc.split('\n').filter(function (line) {
            return line.indexOf('undefined') >= 0;
        }).forEach(function (line) {
            console.error(line);
        });
    });
});
