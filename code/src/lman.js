var SchemeAsm = require('./Scheme2asm');
var path = require('path'),
    fs = require('fs');

var s2asm = (new SchemeAsm());
var fName = path.join(__dirname, '../data/pacmans/lman1.scheme');

var code = s2asm.readFile2src(fName);
var ast = [];
var prefix = [
'LDC 0',
'LDF 4',
'CONS',
'RTN',
'LD 0 1',
'LD 0 0',
'LDF #step',
'AP 2',
'RTN'];
ast.push(prefix);
code.map(function(src){ast.push(s2asm.parse(src));});
var asm = s2asm.compile(ast, 0, true);
for(i in asm)
{
    console.log(asm[i]);
}