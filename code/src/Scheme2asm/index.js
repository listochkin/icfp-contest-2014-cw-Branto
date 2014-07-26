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
    
    ret.A1 = function(name, arg)
    {
        if (!arg) throw '1 ARG missing!';
        return name + ' ' + arg;
    }
    
    ret.A2 = function(name, arg1, arg2)
    {
        if (!arg1) throw '1 ARG missing!';
        if (!arg2) throw '2 ARG missing!';
        return name + ' ' + arg1 + ',' + arg2;
    }
    
    ret.A3 = function(name, arg1, arg2, arg3)
    {
        if (!arg1) throw '1 ARG missing!';
        if (!arg2) throw '2 ARG missing!';
        if (!arg3) throw '2 ARG missing!';
        return name + ' ' + arg1 + ',' + arg2 + ',' + arg3;
    }
    
    ret.ADD     = function()            {return 'ADD';}
    ret.SUB     = function()            {return 'SUB';}
    ret.MUL     = function()            {return 'MUL';}
    ret.DIV     = function()            {return 'DIV';}
    ret.CONS    = function()            {return 'CONS';}
    ret.CAR     = function()            {return 'CAR';}
    ret.CDR     = function()            {return 'CDR';}
    ret.LDC     = function(arg1)        {return ret.A1('LDC', arg1);}
    ret.LD      = function(arg1,arg2)   {return ret.A2('LD', arg1, arg2);}
    ret.LDF     = function(arg1)        {return ret.A1('LDF', arg1);}
    ret.RTN     = function()            {return 'RTN';}
    ret.AP      = function(arg1)        {return ret.A1('AP', arg1);}

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
            if (obj[0] == 'halt'){return;}
            if (obj[0] == 'argument'){return walk(obj[1]);}
            if (obj[0] == 'constant'){acc.push(ret.LDC(obj[1])); return walk(obj[2]);}
            if (obj[0] == 'refer-global'){
                //console.log('WALK F', obj[1])
                // pop prev consant --- number of args
                acc.pop();
                if (obj[1] == 'cons') {acc.push(ret.CONS());return ;}
                if (obj[1] == 'car') {acc.push(ret.CAR());return ;}
                if (obj[1] == 'cdr') {acc.push(ret.CDR());return ;}
                if (obj[1] == '+') {acc.push(ret.ADD());return ;}
                if (obj[1] == '-') {acc.push(ret.SUB());return ;}
                if (obj[1] == '*') {acc.push(ret.MUL());return ;}
                throw 'UNKNOWN FUNC "' + obj[1] + '" !';
            }
            
            throw 'UNKNOWN NODE "' + obj[0] + '" !';
        }
        
        walk(opc);
        return acc;
    }
    return ret;
}


