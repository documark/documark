/* jslint node: true */

var fs           = require( 'fs' );
var path         = require( 'path' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var fm           = require( 'front-matter' );
var glob         = require( 'glob' );
var through      = require( 'through' );
var duplex       = require( 'duplexer' );
var spawn        = require( 'child_process' ).spawn;

function Documark( basePath ) {
	EventEmitter.call( this );

	// Determine path (and file)
	basePath = path.resolve( basePath );

	if( fs.statSync( basePath ).isFile() ) {
		this.path = path.dirname( basePath );
		this.file = basePath;
	} else {
		this.path = basePath;
		this.file = null;
	}

	this.config  = null;
	this.content = null;
	this.plugins = {};
}

util.inherits( Documark, EventEmitter );

Documark.prototype.load = function() {
	// Get file contents
	var rawContent = fs.readFileSync( this.getFile(), { encoding: 'utf-8' } );

	// Get config and content
	var data = fm( rawContent );

	rawContent   = null;
	this.config  = data.attributes || {};
	this.content = data.body;

	// Load config.json if no front matter is available
	var configFile = path.join( this.getPath(), 'config.json' );

	if( fs.existsSync( configFile ) ) {
		this.config = require( configFile );
	}

	// Load plugins
	this.loadPlugins( this.getConfig().plugins );
};

Documark.prototype.loadPlugins = function( plugins ) {
	var self = this;

	if( typeof plugins === 'string' ) {
		plugins = [ plugins ];
	}
	if( ! Array.isArray( plugins ) ) {
		return;
	}

	plugins.forEach( function( plugin ) {
		// Check if not already loaded
		plugin = plugin.replace( /[^a-zA-Z0-9\-]/g, '' );

		if( self.plugins[ plugin ] !== undefined ) {
			return;
		}

		self.plugins[ plugin ] = require( 'documark-' + plugin )( self );
	} );
};

Documark.prototype.getPath = function() {
	return this.path;
};

Documark.prototype.getFile = function() {
	if( this.file === null ) {
		// Determine document file (if not given)
		var files = glob.sync( path.join( this.getPath(), 'document.*' ) );

		if( ! files.length ) {
			throw new Error( 'No document.* file found in ' + this.getPath() );
		}

		this.file = files[0];
	}

	return this.file;
};

Documark.prototype.getOutputFile = function() {
	var config   = this.getConfig();
	var file     = this.getFile();
	var filename = config.filename || config.title || path.basename( file, path.extname( file ) );

	return path.join( this.getPath(), filename + '.pdf' );
};

Documark.prototype.getConfig = function() {
	if( this.config === null ) {
		this.load();
	}

	return this.config;
};

Documark.prototype.getContent = function() {
	if( this.config === null ) {
		this.load();
	}

	return this.content;
};

Documark.prototype.createContentStream = function() {
	return through().pause().queue( this.getContent() ).end();
};

Documark.prototype.compile = function() {
	var options = [
		'--page-size', 'A4',
		'--orientation', 'portrait',
		'-', // Read from stdin
		'-'  // Write to stdout
	];

	var pdf    = spawn( 'wkhtmltopdf', options, { stdio: 'pipe' } );
	var input  = this.createContentStream();
	var output = fs.createWriteStream( this.getOutputFile() );

	pdf.on( 'error', console.error );

	input
		.pipe( this.getParser() )
		// .pipe( process.stdout )
		.pipe( duplex( pdf.stdin, pdf.stdout ) )
		.pipe( output )
		;

	input.resume();
};

Documark.prototype.getParser = function() {
	var ext = path.extname( this.getFile() ).replace( /[^a-zA-Z0-9]/g, '' );

	try {
		return require( 'documark-parser-' + ext )( this );
	}
	catch( e ) {
		throw new Error( 'No parser found for .' + ext + ' files!' );
	}
};

module.exports = Documark;