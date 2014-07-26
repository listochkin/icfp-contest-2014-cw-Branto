var add = require('./add');

console.log(add(1, 3));

var SchemeAsm = require('./Scheme2asm');

var s2asm = (new SchemeAsm());
var str = '(cdr (cons 3 (cons 1 2)))';
s2asm.sampleParse(str);
var asm = s2asm.parse(str);
console.log(asm);

var str2 = '(+ 1 2)';
console.log(s2asm.parse(str2));

var strZ = '(define (z a b) (+ a b))';
/*
s2asm.sampleParse(strZ);

var BiwaScheme = require("biwascheme"); 
var on_error = function(e){
  console.log("ERROR", e.message);
};


var biwascheme = new BiwaScheme.Interpreter(on_error);
var opc = biwascheme.compile(strZ);

*/
var chunks = [];
chunks.push(s2asm.parse(strZ));
chunks.push(s2asm.parse('(z 1 2)'));
console.log(chunks);
var prg = s2asm.compile(chunks);
for (var i in prg)
{
    console.log(prg[i]);
}

chunks.push(s2asm.parse('(if (z 0 0) 2 3)'));
console.log(chunks);
var prg = s2asm.compile(chunks);
for (var i in prg)
{
    console.log(prg[i]);
}
var runCompile= function(code, shiftN){
    console.log('---------------')
    var chunks = [];
    for (var k in code)
    {
        chunks.push(s2asm.parse(code[k]));
    }
    var prg = s2asm.compile(chunks, shiftN);
    for (var i in prg)
    {
        console.log(prg[i]);
    }
    return prg;
}

var code=[  '(define (listn n) (if n (cons n (listn (- 1 n))) 0))',
            '(listn 10)'
            ];
runCompile(code);
runCompile(code, 1);
