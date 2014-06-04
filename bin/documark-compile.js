#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require( 'commander' );

program
	.option( '-w, --watch', 'automatically recompile on file change' )
	.parse( process.argv )
	;

var basePath = program.args.length ? program.args[ program.args.length - 1 ] : '.';
var Documark = require( '../lib/documark' );
var doc      = new Documark( basePath );
var chalk    = require( 'chalk' );

function compile() {
	process.stdout.write( 'Compiling.. ' );
	try {
		doc.load();
		doc.compile();
		console.log( chalk.green( 'Done.' ) );
	}
	catch( e ) {
		console.log( chalk.red( 'Error!' ) );
		console.log( e );
	}
}

compile();

if( program.watch ) {
	var monocle = require( 'monocle' )();

	monocle.watchDirectory( {
		root: doc.getPath(),
		fileFilter: [ '!**/*.pdf' ],
		listener: compile
	} );
}
