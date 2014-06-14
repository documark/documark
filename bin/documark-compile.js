#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require( 'commander' );

program
	.option( '-v, --verbose', 'increase verbosity', function( v, total ) { return total + 1; }, 0 )
	.option( '-w, --watch', 'automatically recompile on file change' )
	.option( '-t, --throttle [milliseconds]', 'throttle recompile watcher', 1000 )
	.parse( process.argv )
	;

var basePath = program.args.length ? program.args[ program.args.length - 1 ] : '.';
var Documark = require( '../lib/Documark' );
var doc      = new Documark( basePath );
var chalk    = require( 'chalk' );

doc.setVerbosity( program.verbose );

function compile() {
	console.log( chalk.bold( 'Compiling..' ) );
	try {
		doc.compile();
	}
	catch( e ) {
		console.log( chalk.red( 'Error!' ) );
		console.error( e );
	}
}

compile();

if( program.watch ) {
	var monocle  = require( 'monocle' )();
	var throttle = require( 'throttleit' );

	monocle.watchDirectory( {
		root: doc.getPath(),
		fileFilter: [ '!**/*.pdf' ],
		listener: throttle( compile, program.throttle )
	} );
}
