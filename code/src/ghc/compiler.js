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

    var llcode = lines.map(function (line, index) {
        return compileLine(line, index, variables, labels);
    });

    llcode = Array.prototype.concat.apply([], llcode);

    // console.log(llcode.join('\n'));
    var ghc = optimize(link(llcode));

    return ghc.join('\n');
}

function optimize (code) {
    code = code.map(function (line, index, lines) {
        var prevLine = code[index - 1];
        if (!prevLine) return line;
        var rP = /MOV ([^\s,]+), ([^\s]+)/.exec(prevLine);
        var rC = /MOV ([^\s,]+), ([^\s]+)/.exec(line);
        if (rP && rC) {
            if (rP[1] === rC[2] && rP[2] === rC[1]) {
                return '; optimized | ' + line + ' |';
            }
        }
        return line;
    }).map(function (line) {
        return line.replace(/\s+/g, ' ').trim();
    }).join('\n').replace(/\n;/g, ' ;').split('\n');

    return code;
}

function link(code) {
    // optimize

    var memIndex = 255;
    var memTable = {
        // vars start with % in intermediate form
    };
    var labels = {
        // labels start with $ when referenced in code
    };

    code = code.map(function (line) {
        return line
            // registers
            .replace(/(%([a-g])(([^\w\d]+?|$)))/g, '$2$3')
            // constants
            .replace(/(%(\d+)(([^\w\d]+?|$)))/g, '$2$3');
    }).map(function (line) {
        var vars = line.match(/%(\w[\w\d]*)/g);

        if (!vars) return line;

        var varComment = [];

        vars.map(function (v) {
            if (!(v in memTable)) {
                memTable[v] = memIndex--;
            }
            line = line.replace(v, '[' + memTable[v] + ']');
            varComment.push(v);
        });
        return line + '       ;  ' + varComment.join(', ');
    }).map(function (line, index) {
        if (/:[^=]/.test(line)) { // labels
            var fragments = line.split(':');
            var label = fragments[0].trim();
            fragments.shift();

            line = fragments.join(':');
            labels[label] = index;
        }
        return line;
    }).map(function (line, index) {
        var addressComment = [];
        line = line.replace(/\$([\w\d-]+)(\+(\d+))?/, function (fullAddress, label, b, extra) {
            addressComment.push(fullAddress);
            if (extra) {
                // we support pointer arithmetics at compile time
                return labels[label] + parseInt(extra, 10)
            } else {
                return labels[label];
            }
        }).trim()// + '    ; <= ' + index;
        if (addressComment.length > 0) {
            return line + '       ;  ' + addressComment.join(', ');
        } else {
            return line;
        }
    });

    return code;
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
    pacmanStart: function (id) {
        return [
            'pacmanStart: JLT $pacmanStart+5, %pacmanStartX, 0',
            'MOV a, %' + id,
            'INT 1',
            'MOV %pacmanStartX, a',
            'MOV %pacmanStartY, b',
        ]
    },
    ifCanMove: function (tile, check) {
        return ['call-' + check + ': JGT $' + check.trim() + ', %' + tile + ', 0' ];
    },
    minKey: function (up, manhUp, left, manhLeft, down, manhDown, right, manhRight) {
        return [
            'JGT $upGtLeft, %manhUp, %manhLeft',
            // compare with up
            // [l] > u

            'JGT $upGtDown, %manhUp, %manhDown',
            // [l, d] > u

            'JGT $upGtRight, %manhUp, %manhRight',
            // [l, d, r] > u
            'MOV a, %up',
            'JEQ $call-minKey+1, 1, 1',

            // [l, d, u] > r
            'upGtRight: MOV a, %right',
            'JEQ $call-minKey+1, 1, 1',

            // [l, u] > d
            'upGtDown: JGT $downGtRight, %manhDown, %manhRight',
            // [l, u, r] > d
            'MOV a, %down',
            'JEQ $call-minKey+1, 1, 1',

            // [l, u, d] > r
            'downGtRight: MOV a, %right',
            'JEQ $call-minKey+1, 1, 1',

            // [u] > l
            'upGtLeft: JGT $leftGtDown, %manhLeft, %manhDown',

            // [u, d] > l
            'JGT $leftGtRight, %manhLeft, %manhRight',

            // [u, d, r] > l
            'MOV a, %left',
            'JEQ $call-minKey+1, 1, 1',

            // [u, d, l] > r
            'leftGtRight: MOV a, %right',
            'JEQ $call-minKey+1, 1, 1',

            // [u, l] > d
            'leftGtDown: JGT $downGtRight, %manhDown, %manhRight',

            // [u, l, r] > d
            'MOV a, %down',
            'JEQ $call-minKey+1, 1, 1',

            // [u, l, d] > r
            'downGtRight: MOV a, %right',
            'JEQ $call-minKey+1, 1, 1',
        ];
    },
    go: function (direction) {
        return ['MOV a, %' + direction, 'INT 0']
    },
    done: function () {
        return 'HLT';
    }
}

// turned out that GHC doesn't support dynamic jumps
// var callSites = {
//     // func: n
// }

function callLabel(func) {
    // if (!(func in callSites)) {
    //     callSites[func] = 0;
    // }
    var label = 'call-' + func; // + '-' + callSites[func];
    // callSites[func] += 1;
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
            // 'MOV [h], $' + label + '+1 ; call',
            // 'INC h' ,
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
            vars.map(function (v, index) {
                var r = /(.+)([\+\-\*])(.+)/.exec(args[index]);
                if (r) {
                    code.push('MOV %' + v + ', %' + r[1].trim() + ' ; ' + args[index]);
                    switch (r[2]) {
                        case '+': code.push('ADD %' + v + ', %' + r[3].trim()); break;
                        case '-': code.push('SUB %' + v + ', %' + r[3].trim()); break;
                        case '*': code.push('MUL %' + v + ', %' + r[3].trim()); break;
                        default: code.push('; Unimplemented ' + args[index]);
                    }
                } else {
                    code.push('MOV %' + v + ', %' + args[index])
                }
            })
        }
    }

    if (label) {
        // support return
        var r = /end-(\w+)/.exec(label);
        if (r && r[1]) {
            code = code.concat([
                // 'DEC h',
                // 'MOV g, [h]',
                'JEQ $call-' + r[1] + '+1, 1, 1 ; return'
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
