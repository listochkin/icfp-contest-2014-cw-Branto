import ast

__author__ = 'ubuntu'

with open('laman.py') as f:
    contents = f.read()

tree = ast.parse(contents, 'laman.py')
print(ast.dump(tree))