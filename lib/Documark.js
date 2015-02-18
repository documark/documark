/* jslint node: true */

var fs             = require('fs');
var path           = require('path');
var util           = require('util');
var EventEmitter   = require('eventemitter2').EventEmitter2;
var fm             = require('front-matter');
var Q              = require('q');
var sanitize       = require('sanitize-filename');
var resolve        = require('resolve').sync;
var cheerio        = require('cheerio');
var jade           = require('jade');
var wkhtmltopdf    = require('wkhtmltopdf');

const VERBOSITY_WARNING = 1;
const VERBOSITY_DEBUG   = 3;

Q.longStackSupport = true;

function Documark (basePath) {
	var self    = this;
	var config  = null;
	var content = null;
	var plugins = [];
	var debug   = 0;
	var file, basePath;

	function setBasePath (newPath) {
		var filename = 'document.jade';

		newPath = path.resolve(newPath || '.');

		if (fs.statSync(newPath).isFile()) {
			file = newPath;
		} else if (fs.existsSync(path.join(newPath, filename))) {
			file = path.join(newPath, filename);
		} else {
			throw new Error('No ' + filename + ' file found in ' + newPath);
		}

		basePath = path.dirname(file);
	}

	// Make Documark an event emitter
	EventEmitter.call(this);

	this.setMaxListeners(100);

	// Methods
	this.path = function (newPath) {
		if (typeof newPath !== 'undefined') {
			setBasePath(newPath);
		}

		return basePath;
	};

	this.file = function (newFile) {
		if (typeof newFile !== 'undefined') {
			setBasePath(newFile);
		}

		return file;
	};

	this.config = function () {
		if (config === null) {
			this.load();
		}

		config.pdf = (config.pdf || {});

		return config;
	};

	this.content = function () {
		if (config === null) {
			this.load();
		}

		return content;
	};

	this.plugins = function () {
		return plugins;
	};

	this.verbosity = function (level) {
		if (typeof level !== 'undefined') {
			debug = (parseInt(level, 10) || 0);
		}

		return debug;
	};

	this.isVerbosity = function (level) {
		return this.verbosity() >= level;
	};

	this.load = function () {
		var basePath = this.path();

		// Get file contents
		var rawContent = fs.readFileSync(this.file(), { encoding: 'utf-8' });

		// Get config and content
		var data = fm(rawContent);

		rawContent = null;
		config     = (data.attributes || {});
		content    = data.body;

		// Load config.json if no front matter is available
		if ( ! Object.keys(config).length) {
			var configFile = path.join(basePath, 'config.json');

			if (fs.existsSync(configFile)) {
				config = require(configFile);
			}
		}
	};

	this.outputFile = function() {
		var filename = (this.config().filename || 'Document.pdf');

		return path.resolve(this.path(), sanitize(filename));
	};

	this.applyPlugins = function ($, plugins) {
		var deferred = Q.defer();
		var plugin;

		// Handle plugins one by one to allow adding plugins while iterating
		var nextPlugin = function (err) {
			if (err) {
				deferred.reject(
					'Error in plugin ' +
					(plugin ? plugin.name || util.inspect(plugin) : '<unknown>') +
					': ' + err
				);
				return;
			}
			if ( ! plugins.length) {
				deferred.resolve($);
				return;
			}

			plugin = plugins.shift();

			if (typeof plugin !== 'function') {
				// Load relative to document path
				if (plugin.indexOf('./') === 0) {
					plugin = require(path.join(self.path(), plugin));
				}

				plugin = require(resolve(plugin, { basedir: self.path() }));
			}
			if (self.isVerbosity(VERBOSITY_DEBUG)) {
				console.log('Processing plugin: ' + util.inspect(plugin.name || plugin));
			}

			plugin($, self, nextPlugin);
		}

		nextPlugin();

		return deferred.promise;
	};

	this.parse = function () {
		var deferred = Q.defer();
		var html     = jade.compile(content, {
			filename: self.outputFile(),
			basedir: self.path()
		})(self.config());

		deferred.resolve(html);

		return deferred.promise;
	};

	this.createDOM = function (html) {
		var deferred = Q.defer();
		var $        = cheerio.load(html);

		deferred.resolve($);

		return deferred.promise;
	};

	this.handleDocumentPlugins = function ($) {
		var deferred = Q.defer();

		plugins = self.config().plugins;

		if ( ! Array.isArray(plugins)) {
			plugins = [];
		}

		return self.applyPlugins($, plugins);
	};

	this.compileToPDF = function ($) {
		var deferred = Q.defer();

		self.emit('pre-compile');

		var fileWriteStream = fs.createWriteStream(self.outputFile());

		fileWriteStream
			.on('error', function (err) { deferred.reject(err); })
			.on('finish', function () { deferred.resolve(); })
			;

		wkhtmltopdf($.html(), self.config().pdf, function (code, signal) {
			if (code || signal) {
				deferred.reject('Error generating PDF (code: ' +
								code + ', signal: ' + signal + ')!');
				return;
			}
		}).pipe(fileWriteStream);

		return deferred.promise;
	};

	this.triggerPostCompileEvent = function () {
		var deferred = Q.defer();

		self.emit('post-compile');

		deferred.resolve();

		return deferred.promise;
	};

	this.compile = function () {
		// Reload input config and text
		this.load();

		// Parse, build, and compile document
		return this.parse()
			.then(this.createDOM)
			.then(this.handleDocumentPlugins)
			.then(this.compileToPDF)
			.then(this.triggerPostCompileEvent)
			; // https://www.youtube.com/watch?v=GKNX6dieVcc
	};

	// Set path
	this.path(basePath);
}

util.inherits(Documark, EventEmitter);

module.exports = Documark;
