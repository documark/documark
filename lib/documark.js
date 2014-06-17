/* jslint node: true */

var fs             = require( 'fs' );
var path           = require( 'path' );
var EventEmitter   = require( 'eventemitter2' ).EventEmitter2;
var util           = require( 'util' );
var fm             = require( 'front-matter' );
var glob           = require( 'glob' );
var es             = require( 'event-stream' );
var spawn          = require( 'child_process' ).spawn;
var cheerio        = require( 'cheerio' );
var PluginProvider = require( './PluginProvider' );

function Documark( basePath ) {
	EventEmitter.call( this );

	// Determine path (and file)
	var file;

	basePath = path.resolve( basePath || '.' );

	if( fs.statSync( basePath ).isFile() ) {
		// File given
		basePath = path.dirname( basePath );
		file     = basePath;
	} else {
		file = null;
	}

	// Initialize privates
	var config  = null;
	var content = null;
	var debug   = 0;

	var pluginProvider = new PluginProvider( this );

	// Methods
	this.plugins = function() {
		return pluginProvider;
	};

	this.load = function() {
		var basePath = this.path();

		// Get file contents
		var rawContent = fs.readFileSync( this.file(), { encoding: 'utf-8' } );

		// Get config and content
		var data = fm( rawContent );

		rawContent = null;
		config     = data.attributes || {};
		content    = data.body;

		// Load config.json if no front matter is available
		if( ! Object.keys( config ).length ) {
			var configFile = path.join( basePath, 'config.json' );

			if( fs.existsSync( configFile ) ) {
				config = require( configFile );
			}
		}

		// Add basedir to config
		this.config().basedir = basePath;

		// Reload plugins
		this.plugins().set( this.config().plugins );
	};

	this.path = function() {
		return basePath;
	};

	this.file = function() {
		if( file === null ) {
			// Determine document file (if not given)
			var files = glob.sync( path.join( this.path(), 'document.*' ) );

			if( ! files.length ) {
				throw new Error( 'No document.* file found in ' + this.path() );
			}

			file = files[0];
		}

		return file;
	};

	this.outputFile = function( ext ) {
		var config   = this.config();
		var file     = this.file();
		var filename = config.filename || config.title || path.basename( file, path.extname( file ) );

		if( typeof ext !== 'string' ) {
			ext = '.pdf';
		}

		return path.join( this.path(), filename + ext );
	};

	this.config = function() {
		if( config === null ) {
			this.load();
		}

		return config;
	};

	this.content = function() {
		if( config === null ) {
			this.load();
		}

		return content;
	};

	this.verbosity = function( level ) {
		if( typeof level !== 'undefined' ) {
			debug = parseInt( level, 10 ) || 0;
		}
		return debug;
	};

	this.compile = function( cb ) {
		this.load();

		var config = this.config();
		var input  = this._createContentStream();
		var output = fs.createWriteStream( this.outputFile() );

		if( cb ) {
			output.on( 'finish', cb );
		}

		input
			.pipe( this.parser() )
			.pipe( this._createHTMLStream() )
			.pipe( this._createLogStream( 1, this.outputFile( '.html' ) ) )
			.pipe( this._createPDFGenerator( config.pdf ) )
			.pipe( output )
			;

		input.resume();
	};

	this.parser = function() {
		var ext    = path.extname( this.file() ).replace( /[^a-zA-Z0-9]/g, '' );
		var module = 'documark-parser-' + ext;

		try {
			return require( module )( this );
		}
		catch( e ) {
			if( e.code === 'MODULE_NOT_FOUND' ) {
				throw new Error( 'Parser "' + module + '" not found!' );
			}
			throw e;
		}
	};

	this._createContentStream = function() {
		return es.through().pause().queue( this.content() ).end();
	};

	this._createHTMLStream = function() {
		var self = this;

		return es.through( function( data ) {
			var that = this;
			var dom  = cheerio.load( data );

			self.emit( 'html', dom, function() {
				that.emit( 'data', dom.html() );
			} );
		} );
	};

	this._createLogStream = function( level, file ) {
		if( this.verbosity() < level ) {
			return es.through();
		}

		var log = fs.createWriteStream( file );

		return es.through( function( data ) {
			log.write( data );
			this.emit( 'data', data );
		}, function() {
			log.end();
			this.emit( 'end' );
		} );
	};

	this._createPDFGenerator = function( config ) {
		var options = [];
		var pdf;

		// Parse flags
		if( typeof config === 'object' ) {
			for( var option in config ) {
				options.push( '--' + option );
				if( config[ option ] !== null ) {
					options.push( config[ option ] );
				}
			}
		}

		options.push( '-' ); // Read from stdin
		options.push( '-' ); // Write to stdout

		this.emit( 'pdf-options', options );

		pdf = spawn( 'wkhtmltopdf', options, { cwd: this.path(), stdio: 'pipe' } );

		pdf.stderr.pipe( process.stderr );

		return es.duplex( pdf.stdin, pdf.stdout );
	};
}

util.inherits( Documark, EventEmitter );

module.exports = Documark;