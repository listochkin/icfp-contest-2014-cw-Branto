var add = require('./add');

console.log(add(1, 3));

var SchemeAsm = require('./Scheme2asm');
var path = require('path'),
    fs = require('fs');

var s2asm = (new SchemeAsm());
var fName = path.join(__dirname, '../data/pacmans/2.gcc');

var code = s2asm.readFile2src(fName);

for(var i in code)
{
    console.log(code[i]);
    var ast = s2asm.parse(code[i]);
    console.log(ast);
}
/*
var x='  (define (make-move-score-list world-map point) \
    (cons (cons 0 (move-score world-map point 0)) \
          (cons (cons 1 (move-score world-map point 1)) \
                (cons (cons 2 (move-score world-map point 2)) \
                      (cons (cons 3 (move-score world-map point 3)) nil)))))';
                      
console.log(s2asm.parse(x));
*/