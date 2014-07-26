'use strict';

var BiwaScheme = require("biwascheme"); 


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
    
    ret._1 = function(name, arg)
    {
        if (arguments.length <= 1) throw name + ' 1 ARG missing!';
        return name + ' ' + arg;
    }
    
    ret._2 = function(name, arg1, arg2)
    {
        if (arguments.length <= 1) throw name + ' 1 ARG missing!';
        if (arguments.length <= 2) throw name + ' 2 ARG missing!';
        return name + ' ' + arg1 + ' ' + arg2;
    }
    
    ret._3 = function(name, arg1, arg2, arg3)
    {
        if (arguments.length <= 1) throw name + ' 1 ARG missing!';
        if (arguments.length <= 2) throw name + ' 2 ARG missing!';
        if (arguments.length <= 3) throw name + ' 2 ARG missing!';
        return name + ' ' + arg1 + ' ' + arg2 + ' ' + arg3;
    }
    
    ret.FCALL = function(name){return ret._1('_FUNC', name);}
    
    ret.ADD     = function()            {return 'ADD';}
    ret.SUB     = function()            {return 'SUB';}
    ret.MUL     = function()            {return 'MUL';}
    ret.DIV     = function()            {return 'DIV';}
    ret.CONS    = function()            {return 'CONS';}
    ret.CAR     = function()            {return 'CAR';}
    ret.CDR     = function()            {return 'CDR';}
    ret.LDC     = function(arg1)        {return ret._1('LDC', arg1);}
    ret.LD      = function(arg1,arg2)   {return ret._2('LD', arg1, arg2);}
    ret.LDF     = function(arg1)        {return ret._1('LDF', arg1);}
    ret.RTN     = function()            {return 'RTN';}
    ret.AP      = function(arg1)        {return ret._1('AP', arg1);}

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
            if (obj[0] == 'halt'){return;}
            if (obj[0] == 'return'){acc.push(ret.RTN()); return;}
            if (obj[0] == 'argument'){return walk(obj[1]);}
            if (obj[0] == 'constant'){acc.push(ret.LDC(obj[1])); return walk(obj[2]);}
            if (obj[0] == 'refer-local'){acc.push(ret.LD(0, obj[1])); return walk(obj[2]);}
            if (obj[0] == 'refer-global'){
                // pop prev consant --- number of args
                var n = acc.pop().substr(4);
                //console.log('WALK F', obj[1], n)
                if (obj[1] == 'cons') {acc.push(ret.CONS());return ;}
                if (obj[1] == 'car') {acc.push(ret.CAR());return ;}
                if (obj[1] == 'cdr') {acc.push(ret.CDR());return ;}
                if (obj[1] == '+') {acc.push(ret.ADD());return ;}
                if (obj[1] == '-') {acc.push(ret.SUB());return ;}
                if (obj[1] == '*') {acc.push(ret.MUL());return ;}
                
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

    ret.compile = function(chunks)
    {
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
                var proc = x.pop();
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
        }
        //
        //console.log(prg.code);
        for (var i in prg.code)
        {
            var fPtr = prg.code[i].indexOf('#');
            if (fPtr > -1)
            {
                var cmd = prg.code[i].substr(0, fPtr);
                var fName = prg.code[i].substr(fPtr + 1);
                //console.log(fName);
                prg.code[i] = cmd + '' + prg.funcs[fName].start;
            }
        }
        return prg.code;
    }

    return ret;
}


