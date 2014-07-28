var SchemeAsm = require('./Scheme2asm');
var path = require('path'),
    fs = require('fs');

var s2asm = (new SchemeAsm());
var fName = path.join(__dirname, '../data/pacmans/lman1.scheme');

var code = s2asm.readFile2src(fName);
var ast = [];
// to be run in game
var prefix_lman = [
'LDC 0',
'LDF 4',
'CONS',
'RTN',
'LD 0 0',
'LD 0 1',
'LDF #step',
'AP 2',
'RTN'];

// to test on lman.html
var prefix_test = [
'LDF #test-step',
'AP 0',
'RTN'];

ast.push(prefix_lman);
code.map(function(src){ast.push(s2asm.parse(src));});
var asm = s2asm.compile(ast, 0, true);
for(i in asm)
{
    console.log(asm[i]);
}