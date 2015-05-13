#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require('commander');

program
	.version(require('../package.json').version)
	.command('compile', 'compile document to PDF')
	.command('config', 'output document configuration in JSON')
	.parse(process.argv)
	;

if ( ! program.runningCommand) {
	program.help();
}
