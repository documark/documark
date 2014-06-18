/* jslint node: true */

var es      = require( 'event-stream' );
var series  = require( 'async' ).series;
var Plugin  = require( './Plugin' );

function PluginProvider( document ) {
	var loadedPlugins = [];
	var cache         = {};

	// Methods
	this.set = function( plugins ) {
		this.clear();

		// Set only allows a list of plugins
		if( ! Array.isArray( plugins ) ) {
			return;
		}

		this.add( plugins );
	};

	this.get = function() {
		return loadedPlugins;
	};

	this.clear = function() {
		// Unload
		for( var i = 0; i < loadedPlugins.length; ++i ) {
			loadedPlugins[i].unload();
		}

		loadedPlugins = [];
	};

	this.add = function( plugins ) {
		var plugin;

		// Custom plugin (by init function)
		if( typeof plugins === 'function' && ! ( plugins instanceof Plugin ) ) {
			return this.add( this.load( plugins ) );
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
			if( ! ( plugin instanceof Plugin ) ) {
				throw new Error( 'Invalid plugin: ' + plugin );
			}

			loadedPlugins.push( plugin );
		}
	};

	this.load = function( plugin ) {
		var module, newPlugin;

		if( typeof plugin === 'string' ) {
			// By name
			module = 'documark-' + plugin.replace( /[^a-z0-9\-]/gi, '' );
			plugin = null;
		} else if( typeof plugin === 'function' && plugin.name ) {
			// By class/function
			module = plugin.name;
		}

		newPlugin = new Plugin( document );

		if( ! module ) {
			// Initialize plugin by direct function call
			plugin( newPlugin );
		} else {
			if( ! cache[ module ] ) {
				cache[ module ] = plugin || require( module );
			}

			// Initialize plugin by cached function
			cache[ module ]( newPlugin );
		}

		newPlugin.load();

		return newPlugin;
	};
}

module.exports = PluginProvider;
