#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require( 'commander' );

program
	.version( require( '../package.json' ).version )
	.command( 'config', 'output document configuration' )
	.command( 'compile', 'compile document to PDF' )
	.parse( process.argv )
	;

if( ! program.args.length ) {
	program.help();
}
