'use strict';

var BiwaScheme = require("biwascheme"),
    path = require('path'),
    fs = require('fs');

module.exports = S2Asm;

function S2Asm() {
    var ret = {};

    ret.sampleParse = function (str) 
    {
        var on_error = function(e){
          console.log(e.message);
        };

        
        var biwascheme = new BiwaScheme.Interpreter(on_error);
        var opc = biwascheme.compile(str);
        //var dump = (new BiwaScheme.Dumper()).dump_opc(opc);

        var walk = function (obj, ident)
        {
            console.log(ident,'(');
            for (var k = 0; k < obj.length; k++)
            {
                if (obj[k] instanceof Array)
                {
                    var z = obj[k];
                    walk(z, ident + ' ');
                }
                else
                {
                    console.log(ident, obj[k]);
                }
            }
            console.log(ident, ')');
        }

        console.log('---------');
        walk(opc, '');
        console.log(opc);
        console.log('---------');
        console.log(str);
        var z = BiwaScheme.run(str);
        console.log(z.toString());
    };
    
    ret.readFile2src = function(fileName)
    {
        var src = fs.readFileSync(fileName, 'utf8');
        var lines = src.split('\n');
        var l2 = [];
        var acc = '';
        lines.forEach(function (line) {
            line = line.split(';')[0]; // strip comments
            
            if (!line.trim().length) { // empty line
                if (acc.length > 0)
                {
                    l2.push(acc);
                    acc = '';                    // start new line
                }
            } else {
                acc += ' ' + line;
            }
        });
        if (acc.length > 0)
        {
            l2.push(acc);
        }
        return l2;
    }

    
    ret._1 = function(name, arg1)
    {
        if (arg1 == undefined) throw name + ' 1 ARG missing!';
        return name + ' ' + arg1;
    }
    
    ret._2 = function(name, arg1, arg2)
    {
        if (arg1 == undefined) throw name + ' 1 ARG missing!';
        if (arg2 == undefined) throw name + ' 2 ARG missing!';
        return name + ' ' + arg1 + ' ' + arg2;
    }
    
    ret._3 = function(name, arg1, arg2, arg3)
    {
        if (arg1 == undefined) throw name + ' 1 ARG missing!';
        if (arg2 == undefined) throw name + ' 2 ARG missing!';
        if (arg3 == undefined) throw name + ' 3 ARG missing!';
        return name + ' ' + arg1 + ' ' + arg2 + ' ' + arg3;
    }
    
    ret.FCALL = function(name){return ret._1('_FUNC', name);}
    ret.d       = function(n){return (n>-1)?'# +' + n : '# ' + n;}
    
    ret.ADD     = function()            {return 'ADD';}
    ret.SUB     = function()            {return 'SUB';}
    ret.MUL     = function()            {return 'MUL';}
    ret.DIV     = function()            {return 'DIV';}
    ret.CONS    = function()            {return 'CONS';}
    ret.CAR     = function()            {return 'CAR';}
    ret.CDR     = function()            {return 'CDR';}
    ret.CEQ     = function()            {return 'CEQ';}
    ret.CGT     = function()            {return 'CGT';}
    ret.LDC     = function(arg1)        {return ret._1('LDC', arg1);}
    ret.LD      = function(arg1,arg2)   {return ret._2('LD', arg1, arg2);}
    ret.LDF     = function(arg1)        {return ret._1('LDF', arg1);}
    ret.RTN     = function()            {return 'RTN';}
    ret.AP      = function(arg1)        {return ret._1('AP', arg1);}
    ret.TSEL    = function(arg1, arg2)  {return ret._2('TSEL', arg1, arg2);}
    
    ret.ATOM    = function()            {return 'ATOM';}

    ret.parse = function(str)
    {
        var on_error = function(e){
          console.log(e.message);
        };

        
        var biwascheme = new BiwaScheme.Interpreter(on_error);
        var opc = biwascheme.compile(str);

        var acc = [];
        var walk = function (obj)
        {
            //console.log('WALK', obj[0])
            if (obj[0] == 'frame'){
                for (var i = 1; i < obj.length; i++)
                {
                    walk(obj[i]);
                }
                return;
            }
            if (obj[0] == 'close') {walk(obj[2]); acc.push(ret.RTN()); walk(obj[3]); return;}
            if (obj[0] == 'assign-global') {acc.push(ret.FCALL(obj[1])); return;} /// PSEUDONODE
            if (obj[0] == 'test'){
                var kTest = acc.length;
                acc.push(ret.TSEL('', '')); // PLACEHOLDER
                walk(obj[1]);

                acc.push(ret.LDC(0));
                var kElse = acc.length;
                acc.push(ret.TSEL('', '')); // PLACEHOLDER
                walk(obj[2]);
                
                var kEnd = acc.length;
                var relElse = kElse - kTest + 1;
                var relEnd  = kEnd - kElse;
                acc[kTest] = ret.TSEL(ret.d(1),      ret.d(relElse));
                acc[kElse] = ret.TSEL(ret.d(relEnd), ret.d(relEnd));
                return;
            }
            if (obj[0] == 'halt'){return;}
            if (obj[0] == 'return'){acc.push(ret.RTN()); return;}
            if (obj[0] == 'argument'){return walk(obj[1]);}
            if (obj[0] == 'constant'){acc.push(ret.LDC(obj[1] == 'nil'?0:obj[1])); return walk(obj[2]);}
            if (obj[0] == 'refer-local'){acc.push(ret.LD(0, obj[1])); return walk(obj[2]);}
            if (obj[0] == 'refer-global'){
                // nil is special constant
                //console.log('GLOBAL:', obj[1]);
                if (obj[1] == 'nil') {acc.push(ret.LDC(0)); return walk(obj[2]);}
                
                // pop prev consant --- number of args
                var n = parseInt(acc.pop().substr(4));
                // quick & dirty fix of passing 2 or more args
                // TODO: fix in ast
                if (n > 1)
                {
                    var delta = n + 2;
                    acc.push(ret.LDF(ret.d(4)));
                    acc.push(ret.AP(n));
                    acc.push(ret.LDC(0));
                    acc.push(ret.TSEL(ret.d(delta), ret.d(delta)));
                    for (var i = n-1; i >= 0; --i)
                    {
                        acc.push(ret.LD(0, i));
                    }
                    acc.push(ret.RTN());
                }
                if (obj[1] == 'cons') {acc.push(ret.CONS());return ;}
                if (obj[1] == 'car') {acc.push(ret.CAR());return ;}
                if (obj[1] == 'cdr') {acc.push(ret.CDR());return ;}

                // math
                if (obj[1] == '+') {acc.push(ret.ADD());return ;}
                if (obj[1] == '-') {acc.push(ret.SUB());return ;}
                if (obj[1] == '*') {acc.push(ret.MUL());return ;}

                // logic
                if (obj[1] == '=') {acc.push(ret.CEQ());return ;}
                if (obj[1] == '>') {acc.push(ret.CGT());return ;}
                
                // nil & ATOM
                if (obj[1] == 'ATOM') {acc.push(ret.ATOM()); return;}

                //throw 'UNKNOWN FUNC "' + obj[1] + '" !';
                acc.push(ret.LDF('#' + obj[1]));
                acc.push(ret.AP(n));
                return;
            }
            
            throw 'UNKNOWN NODE "' + obj[0] + '" !';
        }
        
        walk(opc);
        return acc;
    }

    ret.compile = function(chunks, shiftN, prettify)
    {
        shiftN = shiftN || 0; // to start program not from 0
        prettify = prettify || false;
        var prg = {code:[], funcs:{}};
        // gather functions
        for(var k in chunks)
        {
            var x = chunks[k];
            var p = x[x.length-1];
            var isFunc = p.indexOf('_FUNC') == 0;
            //console.log(x, isFunc);
            if (isFunc)
            {
                var proc = p;
                var fname = proc.substr(6);
                prg.funcs[fname] = {start: -1, idx: k, name: fname};
                //console.log(k, fname, prg.funcs[fname]);
            }
            else
            {
                prg.code = prg.code.concat(x);
            }
        }
        //
        prg.code.push('RTN');
        //
        for (var n in prg.funcs)
        {
            var k = prg.funcs[n].idx;
            var fname = prg.funcs[n].name;
            prg.funcs[fname].start = prg.code.length;
            prg.code = prg.code.concat(chunks[k]);
            prg.code.pop(); // remove FUNC placeholder
        }
        //
        //console.log(prg.code);
        for (var i = 0; i < prg.code.length; i++)
        {
            var fPtr = prg.code[i].indexOf('#');
            if (fPtr > -1)
            {
                var cmd = prg.code[i].split('#');
                for (var k = 1; k < cmd.length; k++)
                {
                    if (cmd[k][0] == ' ') // relative addr
                    {
                        var tok = cmd[k].substr(1).split(' ');
                        var delta = parseInt(tok[0], 10);
                        //console.log(i, delta, tok);
                        tok[0] = shiftN + i + delta;
                        cmd[k] = tok.join(' ');
                    }
                    else //function
                    {
                        var tok = cmd[k].split(' ');
                        
                        var fName = tok[0];                        
                        //console.log(fName);
                        if (prg.funcs[fName])
                        {
                            tok[0] = shiftN + prg.funcs[fName].start;
                        }
                        else
                        {
                            console.log("WARNING ! unresolved ref ", fName);
                            tok[0] = '#' + tok[0];
                        }
                        cmd[k] = tok.join(' ');
                    }
                }
                prg.code[i] = cmd.join('');
            }
        }
        if (prettify)
        {
            for (var i = 0; i < prg.code.length; ++i)
            {
                var align = '               ;';
                prg.code[i] += align.substr(prg.code[i].length) + (shiftN + i);
            }
            for (var n in prg.funcs)
            {
                var fname = prg.funcs[n].name;
                var funcStart = prg.funcs[n].start;
                prg.code[funcStart] += ' @' + fname;
            }
        }
        return prg.code;
    }

    return ret;
}


