/* jslint node: true */

var es = require( 'event-stream' );

function Parser( type, document ) {
	var module = 'documark-parser-' + type;
	var callback;

	// Methods
	this.callback = function( cb ) {
		if( typeof cb === 'function' ) {
			callback = cb;
		}

		return callback;
	};

	this.stream = function() {
		return es.map( callback );
	};

	// Load module
	try {
		require( module )( this, document );
	}
	catch( e ) {
		if( e.code === 'MODULE_NOT_FOUND' ) {
			throw new Error( 'Parser "' + module + '" not found!' );
		}
		throw e;
	}
}

module.exports = Parser;