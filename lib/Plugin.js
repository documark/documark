/* jslint node: true */

function Plugin( document ) {
	// Variables
	var loaded = false;

	this.document = document;

	// Methods
	this.isLoaded = function() {
		return loaded;
	};

	this.load = function() {
		if( this.isLoaded() ) return;

		// Events
		if( typeof this.onHTML === 'function' ) {
			document.on( 'html', this.onHTML );
		}

		if( typeof this.onPDFOptions === 'function' ) {
			document.on( 'pdf-options', this.onPDFOptions );
		}

		loaded = true;
	};

	this.unload = function() {
		if( ! this.isLoaded() ) return;

		// Events
		if( typeof this.onHTML === 'function' ) {
			document.off( 'html', this.onHTML );
		}

		if( typeof this.onPDFOptions === 'function' ) {
			document.off( 'pdf-options', this.onPDFOptions );
		}

		loaded = false;
	};
}

module.exports = Plugin;