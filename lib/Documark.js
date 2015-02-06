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

const VERBOSITY_WARNING = 2;
const VERBOSITY_DEBUG   = 5;

function Documark (basePath) {
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

	this.outputFile = function () {
		var filename = (this.config().filename || 'Document.pdf');

		return path.join(this.path(), sanitize(filename));
	};

	this.contentStream = function () {
		return es.through().pause().queue(this.content());
	};

	this.parserStream = function () {
		var outputFile = this.outputFile();
		var basePath   = this.path();
		var config     = this.config();

		return es.map(function (data, cb) {
			var options = {
				filename: outputFile,
				basedir: basePath
			};

			cb(null, jade.compile(data, options)(config));
		});
	};

	this.pluginStream = function () {
		var self = this;

		return es.through(function (data) {
			var $ = cheerio.load(data);
			var plugin;

			// Determine initial plugins
			plugins = self.config().plugins;

			if ( ! Array.isArray(plugins) ) {
				plugins = [];
			}

			// Handle plugins one by one to allow adding plugins while iterating
			var nextPlugin = function (err) {
				if (err) {
					throw new Error('Error in plugin ' +
						(plugin ? plugin.name || util.inspect(plugin) : '<unknown>') +
						': ' + err
					);
				}
				if ( ! plugins.length) {
					// Done, so continue streaming 
					this.emit('data', $.html());
					return;
				}

				plugin = plugins.shift();

				if (typeof plugin !== 'function') {
					if (plugin.indexOf('./') === 0) {
						plugin = path.join(self.path(), plugin);
					}
					plugin = require(plugin);
				}
				if (self.isVerbosity(VERBOSITY_DEBUG)) {
					console.log('Processing plugin: ' + util.inspect(plugin.name || plugin));
				}

				plugin($, self, nextPlugin);
			}.bind(this);

			nextPlugin();
		});
	};

	this.compileStream = function (config) {
		var self   = this;
		var stream = es.map(function (data, cb) {
			self.emit('pre-compile');

			wkhtmltopdf(data, self.config().pdf, function (code, signal) {
				if (code || signal) {
					throw new Error('Error generating PDF (code: ' +
						code + ', signal: ' + signal + ')!');
				}
			}).pipe(concatStream(function (data) {
				cb(null, data);
				stream.end();
			}));
		});

		return stream;
	};

	this.outputStream = function () {
		var self = this;

		return fs.createWriteStream(this.outputFile())
			.on('finish', function () {
				self.emit('post-compile');
			})
			;
	};

	this.compile = function () {
		this.load();

		var input = this.contentStream();
		var self  = this;

		input
			.pipe(this.parserStream())
			.pipe(this.pluginStream())
			.pipe(this.compileStream())
			.pipe(this.outputStream())
			;

		input.resume();
	};

	// Temp file helper functions
	this.tempFolderPath = function (create) {
		var tempFolder = path.join(this.path(), '.documark');

		if (create && ! fs.existsSync(tempFolder)) {
			fs.mkdirSync(tempFolder, 0755);
		}

		return tempFolder;
	};

	this.tempFilePath = function (file) {
		return path.join(this.tempFolderPath(true), sanitize(file));
	};

	this.tempFileReadStream = function (file) {
		return fs.createReadStream(this.tempFilePath(file));
	};

	this.tempFileWriteStream = function (file) {
		return fs.createWriteStream(this.tempFilePath(file));
	};

	// Set path
	this.path(basePath);
}

util.inherits(Documark, EventEmitter);

module.exports = Documark;
