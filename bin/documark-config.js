#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require('commander');

program
	.option('-v, --verbose', 'increase verbosity', function(v, total) { return total + 1; }, 0)
	.option('-f, --file [file]', 'specify path to document file', './document.html')
	.parse(process.argv)
	;

var path     = require('path');
var documark = require(path.join(__dirname, '..'));
var document = new documark.Document(path.resolve(program.file));
var compiler = new documark.Compiler();

document.verbosity(program.verbose);

compiler.compileToPDF = function ($) {
	process.stdout.write(JSON.stringify(document.config(), null, 4));
	process.exit(0);
};

compiler.compile(document);
