#!/usr/bin/env node

/* jslint node: true */

'use strict';

var program = require( 'commander' );

program
	// ..
	.parse( process.argv )
	;

var basePath = program.args.length ? program.args[ program.args.length - 1 ] : '.';
var Documark = require( '../lib/Documark' );
var doc      = new Documark( basePath );
var YAML     = require( 'yamljs' );

console.log( YAML.stringify( doc.getConfig() ) );
