/* jslint node: true */

var fs           = require( 'fs' );
var path         = require( 'path' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );
var fm           = require( 'front-matter' );
var glob         = require( 'glob' );
var es           = require( 'event-stream' );
var spawn        = require( 'child_process' ).spawn;
var waterfall    = require( 'async' ).waterfall;

function Documark( basePath ) {
	EventEmitter.call( this );

	// Determine path (and file)
	basePath = path.resolve( basePath || '.' );

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
	this.debug   = 0;
}

util.inherits( Documark, EventEmitter );

Documark.prototype.load = function() {
	var basePath = this.getPath();

	// Get file contents
	var rawContent = fs.readFileSync( this.getFile(), { encoding: 'utf-8' } );

	// Get config and content
	var data = fm( rawContent );

	rawContent   = null;
	this.config  = data.attributes || {};
	this.content = data.body;

	// Load config.json if no front matter is available
	if( ! Object.keys( this.config ).length ) {
		var configFile = path.join( basePath, 'config.json' );

		if( fs.existsSync( configFile ) ) {
			this.config = require( configFile );
		}
	}

	// Add basedir to config
	this.config.basedir = basePath;

	// Load plugins
	this.addPlugins( this.getConfig().plugins );
};

Documark.prototype.addPlugins = function( plugins ) {
	if( ! Array.isArray( plugins ) ) {
		return;
	}

	plugins.forEach( this.addPlugin.bind( this ) );
};

Documark.prototype.addPlugin = function( name, plugin ) {
	// Check if not already loaded
	name = name.replace( /[^a-zA-Z0-9\-]/g, '' );

	if( this.plugins[ name ] !== undefined ) {
		return;
	}

	// Load plugin
	if( typeof plugin !== 'function' ) {
		plugin = require( 'documark-' + name );
	}

	this.plugins[ name ] = plugin( this );
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

Documark.prototype.getOutputFile = function( ext ) {
	var config   = this.getConfig();
	var file     = this.getFile();
	var filename = config.filename || config.title || path.basename( file, path.extname( file ) );

	if( typeof ext !== 'string' ) {
		ext = '.pdf';
	}

	return path.join( this.getPath(), filename + ext );
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

Documark.prototype.getVerbosity = function() {
	return this.debug;
};

Documark.prototype.setVerbosity = function( level ) {
	this.debug = parseInt( level, 10 ) || 0;
};

Documark.prototype.compile = function( cb ) {
	var config   = this.getConfig();
	var basePath = this.getPath();
	var options  = [
		'--allow', basePath
	];

	if( typeof config.pdf === 'object' ) {
		for( var option in config.pdf ) {
			options.push( '--' + option );
			if( config.pdf[ option ] !== null ) {
				options.push( config.pdf[ option ] );
			}
		}
	}

	options.push( '-' ); // Read from stdin
	options.push( '-' ); // Write to stdout

	var pdf    = spawn( 'wkhtmltopdf', options, { cwd: basePath, stdio: 'pipe' } );
	var input  = this._createContentStream();
	var output = fs.createWriteStream( this.getOutputFile() );

	pdf.stderr.pipe( process.stderr );

	input
		.pipe( this.getParser() )
		.pipe( this._createPluginHandler( 'html' ) )
		.pipe( this._createLogger( 1, this.getOutputFile( '.html' ) ) )
		.pipe( es.duplex( pdf.stdin, pdf.stdout ) )
		.pipe( output )
		;

	if( cb ) {
		output.on( 'finish', cb );
	}

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

Documark.prototype._createContentStream = function() {
	return es.through().pause().queue( this.getContent() ).end();
};

Documark.prototype._createPluginHandler = function( type ) {
	var self = this;

	return es.map( function( data, cb ) {
		// Collect plugins
		var plugins = [];

		self.emit( 'plugin:' + type, plugins );

		if( ! plugins.length ) {
			cb( null, data );
			return;
		}

		// Feed data
		plugins.unshift( function( cb ) { cb( null, data ); } );

		// Process plugins
		waterfall( plugins, cb );
	} );
};

Documark.prototype._createLogger = function( level, file ) {
	if( this.getVerbosity() < level ) {
		return es.through();
	}

	var log = fs.createWriteStream( file );

	return es.through( function( data ) {
		this.emit( 'data', data );
		log.write( data );
	}, function() {
		this.emit( 'end' );
		log.end();
	} );
};

module.exports = Documark;