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

var path     = require('path');
var documark = require(path.join(__dirname, '..'));
var document = new documark.Document(process.cwd());
var chalk    = require('chalk');

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

function error (err) {
	console.error(chalk.red('Error!'), err);
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

	document.compile().then(done, error);
}

compile();

if (program.watch) {
	var monocle  = require('monocle')();
	var throttle = require('throttleit');

	monocle.watchDirectory({
		root: document.path(),
		fileFilter: ['**/*.{jade,md,markdown,mdown,js,css,png,jpg,jpeg,gif,bmp}'],
		listener: throttle(compile, program.throttle)
	});
}
