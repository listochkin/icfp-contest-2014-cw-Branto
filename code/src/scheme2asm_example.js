var SchemeAsm = require('./Scheme2asm');

var s2asm = (new SchemeAsm());

var code=[  '(define (listq n acc) (if n (listq (- n 1) (cons n acc)) acc))',
            '(define (listn n) (listq n 0))',
            '(listn 10)'
            ];

// example program with prefix and uncomplete func-refs:
// 1) add code with unknown function call
code.push('(listz 5)');
// 2) set prefix - storing two constants in stack
var prg_prefix = ['LDC 111', 'LDC 112'];
// 3) parse code line by line
var prg_uncomplete = code.map(s2asm.parse);
// 4) get all parts together
var prg_chunks = prg_uncomplete;
prg_chunks.unshift(prg_prefix);
prg_chunks.push(s2asm.parse('(define (listz a) (+ 3 a))'));
// 5) compile & prettify. all must be ok
var prg = s2asm.compile(prg_chunks, 0, true);
console.log("==============");
for (var i in prg)
{
    console.log(prg[i]);
}
//return prg;