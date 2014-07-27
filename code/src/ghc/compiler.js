'use strict';

module.exports = compiler;

function compiler(code) {

    var variables = {};
    var labels = {};

    // tidy up source
    var lines = code.split('\n').map(function (line) {
        return (line.split(';')[0]).replace(/\s/g, '').trim(); // comments
    }).filter(function (line) {
        return line.length > 0;
    });
    // lines are now clean

    var ghc = lines.map(function (line, index) {
        return compileLine(line, index, variables, labels);
    });

    ghc = Array.prototype.concat.apply([], ghc);

    return ghc.join('\n');
}

// Register use
// a, b, c, d .. - return variables
// h - callstack address (starts at 0)
var registers = 'abcdefgh'.split('');

var prelude = {
    who: function () {
        return 'INT 3';
    },
    start: function (id) {
        return ['MOV a, %' + id, 'INT 4']
    },
    pos: function (id) {
        return ['MOV a, %' + id, 'INT 5']
    },
    pacman: function (id) {
        return ['MOV a, %' + id, 'INT 1']
    },
    mode: function (id) {
        return ['MOV a, %' + id, 'INT 6']
    },
    map: function (x, y) {
        return ['MOV a, %' + x, 'MOV b, %' + y, 'INT 7']
    },
    go: function (direction) {
        return ['MOV a, %' + direction, 'INT 0']
    },
    done: function () {
        return 'HLT';
    }
}

var callSites = {
    // func: n
}

function callLabel(func) {
    if (!(func in callSites)) {
        callSites[func] = 0;
    }
    var label = 'call-' + func + '-' + callSites[func];
    callSites[func] += 1;
    return label;
}

function codeFor (func, args) {
    if (func in prelude) {
        return prelude[func].apply(null, args);
    } else {
        var label = callLabel(func);
        var code = (args || []).map(function (arg, index) {
            return 'MOV ' + registers[index] + ', %' + arg + (!index ? ' ; params' : '');
        });
        return code.concat([
            'MOV [h], %' + label + '+1 ; call',
            'INC h' ,
            label + ': JEQ $' + func + ', 1, 1 ; <= ' + func + '(' + args + ')'
        ]);
        // throw new Error('Unimplemented: ' + func);
    }
}

function compileLine(line, index, variables, labels) {
    var fragments = null,
        code = [],
        assignment = false,
        label = null,
        vars = null,
        func = null,
        args = [];

    if (/:[^=]/.test(line)) { // labels
        fragments = line.split(':');
        label = fragments[0].trim();
        fragments.shift();

        line = fragments.join(':');
        labels[label] = index;
    }

    if (/:=/.test(line)) { // assignment
        var assignment = true;

        fragments = line.split(':=');
        vars = fragments[0].split(',');
        line = fragments[1];
    }

    if (/\(/.test(line)) { //call
        fragments = line.split('(');
        func = fragments[0];

        args = fragments[1].split(')')[0].split(',').filter(function (a) {
            return a.length > 0;
        });
        var callCode = codeFor(func, args);
        code = code.concat(callCode);

        if (assignment) {

            vars.map(function (vara, index) {
                code.push('MOV %' + vara + ', ' + registers[index]);
            })
        }
    } else {
        args = line.split(',');
        if (assignment) {
            vars.map(function (vara, index) {
                code.push('MOV %' + vara + ', %' + args[index])
            })
        }
    }

    if (label) {
        // support return
        var r = /end-(\w+)/.exec(label);
        if (r && r[1]) {
            code = code.concat([
                'DEC h',
                'JEQ [h], 1, 1 ; return'
            ]);
        }
        code[0] = label + ': ' + code[0];
    }

    if (code.length === 0) {
        throw new Error('Unimplemented Case: ' + line);
    } else {
        return code;
    }
}
