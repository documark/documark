/* jslint node: true */

function Plugin() {
	this.name = 'unknown';
}

Plugin.prototype.getName = function() {
	return this.name;
};

Plugin.prototype.load     = function() {};
Plugin.prototype.unload   = function() {}; // Can be called when not loaded
Plugin.prototype.isLoaded = function() {};

module.exports = Plugin;