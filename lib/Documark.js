/* jslint node: true */

var fs             = require('fs');
var path           = require('path');
var util           = require('util');
var fm             = require('front-matter');
var sanitize       = require('sanitize-filename');
var es             = require('event-stream');
var cheerio        = require('cheerio');
var jade           = require('jade');
var async          = require('async');
var wkhtmltopdf    = require('wkhtmltopdf');
var concatStream   = require('concat-stream');
var EventEmitter   = require('eventemitter2').EventEmitter2;

function Documark (basePath) {
	var config  = null;
	var content = null;
	var debug   = 0;
	var file, basePath;

	function setBasePath (newPath) {
		newPath = path.resolve(newPath || '.');

		if (fs.statSync(newPath).isFile()) {
			file = newPath;
		} else if (fs.existsSync(path.join(newPath, 'document.jade'))) {
			file = path.join(newPath, 'document.jade');
		} else {
			throw new Error('No document.jade file found in ' + newPath);
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

		return config;
	};

	this.content = function () {
		if (config === null) {
			this.load();
		}

		return content;
	};

	this.plugins = function () {
		var plugins = this.config().plugins;

		if ( ! Array.isArray(plugins)) {
			plugins = [];
		}

		return plugins.map(function (plugin) {
			if (typeof plugin === 'function') {
				return plugin;
			}
			if (typeof plugin === 'string') {
				return require(plugin);
			}
			throw new Error('Invalid plugin: ' + JSON.stringify(plugin));
		});
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

	this.outputFile = function (ext) {
		var config   = this.config();
		var file     = this.file();
		var filename = (config.filename || config.title);

		if ( ! filename) {
			filename = path.basename(file, path.extname(file));
			filename = filename.charAt(0).toUpperCase() + filename.substr(1);
		}

		if (typeof ext !== 'string') {
			ext = '.pdf';
		}

		return path.join(this.path(), sanitize(filename + ext));
	};

	this.contentStream = function () {
		return es.through().pause().queue(this.content()).end();
	};

	this.parserStream = function () {
		var basePath = this.path();
		var config   = this.config();

		return es.map(function (data, cb) {
			var options = { basedir: basePath };

			cb(null, jade.compile(data, options)(config));
		});
	};

	this.pluginStream = function () {
		var self = this;

		return es.through(function (data) {
			var $ = cheerio.load(data);

			async.applyEachSeries(self.plugins(), $, self, function (err) {
				if (err) {
					throw new Error('Error applying plugins: ' + err);
				}

				this.emit('data', $.html());
			}.bind(this));
		});
	};

	this.compileStream = function (config) {
		var self = this;

		return es.map(function (data, cb) {
			var config = (self.config().pdf || {});

			wkhtmltopdf(data, config, function (code, signal) {
				if (code || signal) {
					throw new Error('Error generating PDF (code: ' +
						code + ', signal: ' + signal + ')!');
				}
			}).pipe(concatStream(function (data) {
				cb(null, data);
			}));
		});
	};

	this.outputStream = function () {
		return fs.createWriteStream(this.outputFile());
	};

	this.compile = function (cb) {
		this.load();

		var input = this.contentStream();
		var self  = this;

		input
			.pipe(this.parserStream())
			.pipe(this.pluginStream())
			.pipe(this.compileStream())
			.pipe(this.outputStream())
			.on('finish', function () {
				if (typeof cb === 'function') {
					// Set Documark instance as 'this' in callback
					cb.apply(self);
				}
			})
			;

		input.resume();
	};

	this.verbosity = function (level) {
		if (typeof level !== 'undefined') {
			debug = (parseInt(level, 10) || 0);
		}

		return debug;
	};

	// Set path
	this.path(basePath);
}

util.inherits(Documark, EventEmitter);

module.exports = Documark;

