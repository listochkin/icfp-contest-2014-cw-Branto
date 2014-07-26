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


