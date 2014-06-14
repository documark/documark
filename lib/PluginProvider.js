/* jslint node: true */

var Plugin = require( './Plugin' );

function PluginProvider() {
	this.plugins = [];
}

PluginProvider.Plugin = Plugin;

PluginProvider.prototype.set = function( plugins ) {
	this.clear();

	// Set only allows a list of plugins
	if( ! Array.isArray( plugins ) ) {
		return;
	}

	this.add( plugins );
	this.load();
};

PluginProvider.prototype.clear = function() {
	this.unload();
	this.plugins = [];
};

PluginProvider.prototype.unload = function() {
	var plugins = this.plugins;

	for( var i = 0; i < plugins.length; ++i ) {
		plugins[i].unload();
	}
};

PluginProvider.prototype.add = function( plugins ) {
	var self = this;
	var name, plugin;

	// Single plugin
	if( ! Array.isArray( plugins ) ) {
		plugins = [ plugins ];
	}

	for( var i = 0; i < plugins.length; ++i ) {
		plugin = plugins[i];

		if( typeof plugin === 'string' ) {
			try {
				name   = 'documark-plugin-' + plugin.replace( /[^a-zA-Z0-9\-]/g, '' );
				plugin = require( name );
			} catch( e ) {
				if( e.code === 'MODULE_NOT_FOUND' ) {
					throw new Error( 'Plugin "' + name + '" not found!' );
				}

				throw e;
			}
		}
		if( ! plugin instanceof Plugin ) {
			throw new Error( 'Invalid plugin: ' + plugin );
		}

		self.plugins.push( plugin );
	}
};

PluginProvider.prototype.load = function() {
	var plugins = this.plugins;

	for( var i = 0; i < plugins.length; ++i ) {
		plugins[i].load();
	}
};

module.exports = PluginProvider;
