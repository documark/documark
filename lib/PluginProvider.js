/* jslint node: true */

var es      = require( 'event-stream' );
var series  = require( 'async' ).series;
var Plugin  = require( './Plugin' );

function PluginProvider( document ) {
	var loadedPlugins = [];
	var cache         = {};

	// Hooks
	document.on( 'html', function( $, cb ) {
		// Call every plugin.onHTML method with $ and cb
		series( loadedPlugins.map( function( plugin ) {
			if( typeof plugin.onHTML !== 'function' ) {
				return undefined;
			}

			return function( cb ) {
				plugin.onHTML( $, cb );
			};
		} ), cb );
	} );

	// Methods
	this.set = function( plugins ) {
		this.clear();

		// Set only allows a list of plugins
		if( ! Array.isArray( plugins ) ) {
			return;
		}

		this.add( plugins );
	};

	this.clear = function() {
		loadedPlugins = [];
	};

	this.add = function( plugins, fn ) {
		var plugin;

		// Custom plugin (by name and init function)
		if( typeof fn === 'function' ) {
			return this.add( this.load( '' + plugins, fn ) );
		}

		// Single plugin
		if( ! Array.isArray( plugins ) ) {
			plugins = [ plugins ];
		}

		for( var i = 0; i < plugins.length; ++i ) {
			plugin = plugins[i];

			if( typeof plugin === 'string' ) {
				plugin = this.load( plugin );
			}
			if( ! plugin instanceof Plugin ) {
				throw new Error( 'Invalid plugin: ' + plugin );
			}

			loadedPlugins.push( plugin );
		}
	};

	this.load = function( name, fn ) {
		var module, plugin;

		name   = name.replace( /[^a-zA-Z0-9\-]/g, '' );
		module = 'documark-' + name;
		plugin = new Plugin( name );

		if( ! cache[ module ] ) {
			try {
				cache[ module ] = fn || require( module );
			} catch( e ) {
				if( e.code === 'MODULE_NOT_FOUND' ) {
					throw new Error( 'Plugin "' + module + '" not found!' );
				}
				throw e;
			}
		}

		// Initialize plugin
		cache[ module ]( plugin, document );

		return plugin;
	};
}

module.exports = PluginProvider;
