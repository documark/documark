#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require('commander');

program
	.option('-v, --verbose', 'increase verbosity', function(v, total) { return total + 1; }, 0)
	.option('-w, --watch', 'automatically recompile on file change')
	.option('-t, --throttle [milliseconds]', 'throttle recompile watcher', 1000)
	.parse(process.argv)
	;

var basePath = (program.args.length ? program.args[program.args.length - 1] : '.');
var Documark = require('../lib/Documark');
var document = new Documark(basePath);
var chalk    = require('chalk');
var path     = require('path');

document.verbosity(program.verbose);

var start, stop;

function done () {
	stop = new Date();

	var seconds = ((stop.getTime() - start.getTime()) / 1000).toFixed(3);

	console.log(
		chalk.cyan('Completed in ' + seconds + 's at ' + stop) +
		(program.watch ? ' - Waiting..' : '')
	);
}

function error (e) {
	console.log(chalk.red('Error!'));
	throw e;
}

function compile (changedFile) {
	start = new Date();

	if (changedFile) {
		console.log(
			'\n' + chalk.green('>>') + ' File "' +
			path.relative(document.path(), changedFile.fullPath)
			+ '" changed.\n'
		);
	}

	console.log(chalk.underline('Compiling..'));

	try {
		document.compile(done);
	}
	catch (e) {
		error(e);
	}
}

compile();

if (program.watch) {
	var monocle  = require('monocle')();
	var throttle = require('throttleit');

	monocle.watchDirectory({
		root: document.path(),
		fileFilter: ['!**/*.pdf'],
		listener: throttle(compile, program.throttle)
	});
}

