/* jslint node: true */

var fs           = require('fs');
var path         = require('path');
var util         = require('util');
var fm           = require('front-matter');
var sanitize     = require('sanitize-filename');
var resolve      = require('resolve').sync;
var EventEmitter = require('eventemitter2').EventEmitter2;
var verbosity    = require('./verbosity.js');

function Document (documentFile) {
	this._file    = null;
	this._path    = null;
	this._config  = null;
	this._content = null;
	this._plugins = [];
	this._debug   = 0;

	if (documentFile) {
		this.file(documentFile);
	}

	// Make class an event emitter
	EventEmitter.call(this);

	this.setMaxListeners(100);
}

util.inherits(Document, EventEmitter);

Document.prototype.file = function (file) {
	if (typeof file === 'undefined') {
		return this._file;
	}

	var filename = 'document.jade';

	file = path.resolve(file || '.');

	if (fs.statSync(file).isFile()) {
		this._file = file;
	} else if (fs.existsSync(path.join(file, filename))) {
		this._file = path.join(file, filename);
	} else {
		throw new Error('No ' + filename + ' file found in ' + file);
	}

	this._path = path.dirname(this._file);
};

Document.prototype.path = function (newPath) {
	if (typeof newPath !== 'undefined') {
		this.file(newPath);
	}

	return this._path;
};

Document.prototype.config = function () {
	if (this._config === null) {
		this.load();
	}

	var config = this._config;

	config.path = this.path();
	config.file = this.file();

	if (typeof config.pdf !== 'object') {
		config.pdf = {};
	}

	return config;
};

Document.prototype.load = function () {
	// Get file contents
	var rawContent = fs.readFileSync(this.file(), { encoding: 'utf-8' });

	// Get config and content
	var data = fm(rawContent);

	rawContent = null;

	this._config  = (data.attributes || {});
	this._content = data.body;

	// Load config.json if no front matter is available
	if (Object.keys(this._config).length === 0) {
		var configFile = path.join(this.path(), 'config.json');

		if (fs.existsSync(configFile)) {
			this._config = require(configFile);
		}
	}
};

Document.prototype.content = function () {
	if (this._config === null) {
		this.load();
	}

	return this._content;
};

Document.prototype.plugins = function () {
	if (this._config === null) {
		this.load();
	}

	var config = this.config();

	config.plugins = config.plugins || [];

	return config.plugins;
};

Document.prototype.verbosity = function (level) {
	if (typeof level !== 'undefined') {
		this._debug = (parseInt(level, 10) || 0);
	}

	return this._debug;
};

Document.prototype.isVerbosity = function (level) {
	return this.verbosity() >= level;
};

Document.prototype.outputFile = function() {
	var filename = (this.config().filename || 'Document.pdf');

	return path.resolve(this.path(), sanitize(filename));
};

Document.prototype.applyPlugins = function ($, plugins, done) {
	var self = this;
	var plugin;

	// Handle plugins one by one to allow adding plugins while iterating
	var nextPlugin = function (err) {
		if (err) {
			done(
				'Error in plugin ' +
				(plugin.name || util.inspect(plugin)) +
				': ' + err
			);
			return;
		}
		if ( ! plugins.length) {
			done();
			return;
		}

		plugin = plugins.shift();

		if (typeof plugin !== 'function') {
			// Load relative to document path
			if (plugin.indexOf('./') === 0) {
				plugin = require(path.join(this.path(), plugin));
			}

			plugin = require(resolve(plugin, { basedir: self.path() }));
		}
		if (self.isVerbosity(verbosity.DEBUG)) {
			console.log('Processing plugin: ' + util.inspect(plugin.name || plugin));
		}

		plugin($, self, nextPlugin);
	};

	nextPlugin();
};

module.exports = Document;
