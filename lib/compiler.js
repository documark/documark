/* jslint node: true */

var fs           = require('fs');
var util         = require('util');
var Q            = require('q');
var cheerio      = require('cheerio');
var jade         = require('jade');
var wkhtmltopdf  = require('wkhtmltopdf');
var md           = require('markdown-it')({
	html: true,
	xhtmlOut: true,
	linkify: true
});
var Document     = require('./document.js');
var wrapperHTML  = '<!DOCTYPE html><html><head>' +
					'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
					'</head><body></body></html>';

Q.longStackSupport = true;

jade.filters.markdown = function (src, options) {
	return md.render(src);
};

function Compiler () {
	this._document = null;
}

Compiler.prototype.document = function (document) {
	if (typeof document === 'undefined') {
		return this._document;
	}

	this._document = document;
};

Compiler.prototype.compile = function (document) {
	this.document(document);

	// Reload input config and text
	document.load();

	// Parse, build, and compile document
	return this.parse()
		.then(this.createDOM.bind(this))
		.then(this.handleDocumentPlugins.bind(this))
		.then(this.triggerPreCompileEvent.bind(this))
		.then(this.compileToPDF.bind(this))
		.then(this.triggerPostCompileEvent.bind(this))
		; // youtu.be/GKNX6dieVcc
};

Compiler.prototype.parse = function () {
	var deferred = Q.defer();
	var document = this.document();
	var html     = jade.compile(document.content(), {
		filename: document.outputFile(),
		basedir: document.path()
	})(document.config());

	deferred.resolve(html);

	return deferred.promise;
};

Compiler.prototype.createDOM = function (html) {
	var deferred = Q.defer();
	var $        = cheerio.load(html);

	// Wrap in html, head, and body element
	if ( ! $('> body').length) {
		var $wrapper = $(wrapperHTML);
		$wrapper.find('> body').append($.root().children());
		$.root().append($wrapper);
	}

	deferred.resolve($);

	return deferred.promise;
};

Compiler.prototype.handleDocumentPlugins = function ($) {
	var deferred = Q.defer();
	var document = this.document();

	// Reference so plugins themselves can add to the list
	var plugins = document.config().plugins;

	document.applyPlugins($, plugins, function (err) {
		if (err) { deferred.reject(err); }
		else     { deferred.resolve($); }
	});

	return deferred.promise;
};

Compiler.prototype.triggerPreCompileEvent = function ($) {
	var deferred = Q.defer();

	this.document().emit('pre-compile');

	deferred.resolve($);

	return deferred.promise;
};

Compiler.prototype.compileToPDF = function ($) {
	var deferred        = Q.defer();
	var document        = this.document();
	var fileWriteStream = fs.createWriteStream(document.outputFile());

	fileWriteStream
		.on('error' , function (err) { deferred.reject(err); })
		.on('finish', function ()    { deferred.resolve(); })
		;

	wkhtmltopdf($.html(), document.config().pdf, function (code, signal) {
		if (code || signal) {
			deferred.reject(
				'Failed to generate PDF.\n' +
				code + ' (signal: ' + signal + ').'
			);
			return;
		}
	}).pipe(fileWriteStream);

	return deferred.promise;
};

Compiler.prototype.triggerPostCompileEvent = function () {
	var deferred = Q.defer();

	this.document().emit('post-compile');

	deferred.resolve();

	return deferred.promise;
};

module.exports = Compiler;
