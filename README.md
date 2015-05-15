# Documark

[![npm version](https://badge.fury.io/js/documark.svg)](http://badge.fury.io/js/documark)
[![dependency status](https://david-dm.org/documark/documark.svg)](https://david-dm.org/documark)

> PDF generator for scripted documents.

A library that:

1. Converts a scripted document (Jade/Markdown/HTML, CSS, and JavaScript) to a PDF (using [wkhtmltopdf][wkhtmltopdf])
2. Is used as a command line interface:

	```bash
	$ npm install -g documark-cli
	$ cd /path/to/my-document/
	$ npm install documark
	$ edit document.jade
	$ documark compile
	```

3. Can watch for files changes to recompile the document (`documark compile --watch`)

## Why?

My personally hatret towards WYSIWYG word processors (Word, Pages, etc.) sparked me to write this tool. I have used [LaTeX][latex] for a while, but it felt like a waste of time. So instead I figured: why not use Markdown? I like Documark because it:

1. Separates content and styling
2. Uses mature webtechnologies like Markdown, HTML, JS, and CSS for writing and styling the document
3. Enforces a consistent document style. No more dragging around of table columns and floating images
4. Allows version control with Git or SVN
5. Simplifies collaboration by version control and splitting up the document into separate files
6. Allows you to use your favorite text editor - like Vim ❤
7. Makes automating things (through plugins) real easy
8. Enables you to use libraries like [D3][d3] and [MathJax][mathjax] for generating graphs and math formulas!

## Getting started

### Install

1. Run `npm install -g documark-cli` to make the `documark` command available
2. Currently manually installing [wkhtmltopdf v0.12.2.1+][wkhtmltopdf-install] is still required, [but we're working on this!][roadmap]

### Example

Go to the [Documark example][documark-example] repository for a [generated PDF][documark-example-pdf] and its source code.

### From scratch

1. Install the Documark CLI and wkhtmltopdf
2. Navigate to (an empty) document directory: `$ mkdir ~/Documents/MyDocument && cd $_`
3. Install Documark: `$ npm install documark`
4. Install some basic styling: `$ npm i dmp-style-basic`
5. Add a `document.jade` file:

	```jade
	---
	title: My Document
	plugins:
		- dmp-style-basic
	---

	chapter
		h1= title
		p Hello world!
		:markdown
			Want some _Markdown_? No **problemo**!
	```

6. Run `$ documark compile`
7. And finally open `Document.pdf`

## Usage

### Configuration

Document configuration can be done in two ways:

1. In the document's [front matter][front-matter].
2. In a separate `config.json` file.

If there is front matter in the document, the configuration file will be ignored.

### Plugins

Add plugins via the `plugins` key in the `document.jade` front matter:

```yaml
---
title: Document
plugins:
	- dmp-plugin-loader
	- dmp-hr-to-page-break
---
```

Alternatively use JSON front matter:

```json
---json
{
	"title": "Document",
	"plugins": [
		"dmp-plugin-loader",
		"dmp-hr-to-page-break"
	]
}
---
```

Plugins all have the `documark-plugin` keyword. They are [listed on the NPM website][documark-plugins].

__Tip:__ Use the [documark plugin loader][dmp-plugin-loader] to load custom plugins!

### Themes

Themes are loaded as plugins and should be prefixed with `dmp-theme-`. A theme generally consists of some styling and other useful plugins, like [table of contents][dmp-table-of-contents], [page headers, footers, margins][dmp-page-meta], or [math equations][dmp-math].

### Styling

The easiest way is to load a predefined document style as a plugin. These plugins are prefixed with `dmp-style-`.

Another way of styling your document is through CSS files, inline CSS, or the element's `style` attribute.

### Build process

These are the steps for compiling the PDF document:

1. Input files (Jade, Markdown, and assets)
2. Generate HTML
3. Convert to DOM tree (with [CheerioJS][cheeriojs])
4. Process plugins (which can alter the DOM and PDF configuration)
5. Emit `pre-compile` event
6. Generate PDF
7. Emit `post-compile` event

### wkhtmltopdf

Configure wkhtmltopdf with the `pdf` object in the documents front matter. For example:

```yaml
---
title: Document
pdf:
	userStyleSheet: path/to/main.css
---
```

Note that [node-wkhtmltopdf][node-wkhtmltopdf] is used as an intermediate package, which uses camel cased (`userStyleSheet`) options instead of dashed ones (`user-style-sheet`, like in the command line tool). See [this page][wkhtmltopdf-options] for a full list of configuration options.

### Plugin development

Writing your own plugins is easy! Here's a boilerplate for a plugin named `dmp-my-custom-plugin` (`dmp-` is short for Documark plugin):

```js
// Require modules outside the plugin function
var path = require('path');

// Add camel cased plugin name to function (for debugging)
module.exports = function dmpMyCustomPlugin ($, document, done) {
	// Manipulate the DOM tree
	$('my-custom-element').replaceWith('<p>Hello world!</p>');

	// Or alter the configuration
	document.config().pdf.marginLeft = '5cm';

	// Don't forget to let Documark know the plugin is done!
	done();
};
```

A plugin has the following parameters:

- `$`: the [CheerioJS][cheeriojs] DOM tree (works a lot like jQuery) of the entire document.
- `document`: the [Document][lib-document] instance. Use `document.config()` to get/set configuration variables.
- `done`: the callback function. Don't forget to call this at the end!

Finally load your plugin in your document configuration:

```jade
---
plugins:
	- dmp-my-custom-plugin
---

chapter
	my-custom-element
```

## Roadmap

1. [x] Move [documark CLI][documark-cli] commands to this repository
1. [x] Rename `documark-` prefixed plugins and themes to `dmp-` and `dmp-theme-` respectively
1. [ ] Research alternatives to wkhtmltopdf ([#12][issue-12])
1. [ ] Use [wkhtmltopdf binary][wkhtmltopdf-binary] package to automatically download the required wkhtmltopdf tools
1. [ ] Build tools for debugging ([dmp-debug][dmp-debug], logger etc)
1. [ ] Improve support: set up website, write wiki pages, and set up IRC channel
1. [ ] Create [Yeoman generator][yeoman-generator] for easy document/plugin setup: `yo documark` and `yo documark-plugin`
1. [ ] Including code files/snippets with highlighting
1. [ ] Create scientific - [LaTex like][latex-theme] - theme
1. [ ] Landscape pages ([not possible yet][wkhtmltopdf-page-options-issue] ◔̯◔)

[wkhtmltopdf]: http://wkhtmltopdf.org/
[roadmap]: #user-content-roadmap
[jade]: http://jade-lang.com/
[markdown]: http://daringfireball.net/projects/markdown/syntax
[latex]: http://www.latex-project.org/
[documark-cli]: https://www.npmjs.com/package/documark-cli
[documark-example]: https://github.com/documark/documark-example
[documark-example-pdf]: https://github.com/documark/documark-example/blob/master/Example.pdf
[d3]: https://github.com/mbostock/d3/wiki/Gallery
[mathjax]: https://www.mathjax.org/
[wkhtmltopdf-install]: http://wkhtmltopdf.org/downloads.html
[dmp-table-of-contents]: https://www.npmjs.com/package/dmp-table-of-contents
[dmp-page-meta]: https://www.npmjs.com/package/dmp-page-meta
[dmp-math]: https://www.npmjs.com/package/dmp-math
[cheeriojs]: https://www.npmjs.com/package/cheerio
[front-matter]: https://github.com/jonschlinkert/gray-matter
[dmp-plugin-loader]: https://www.npmjs.com/package/dmp-plugin-loader
[lib-document]: https://github.com/documark/documark/blob/master/lib/document.js
[documark-plugins]: https://www.npmjs.com/browse/keyword/documark-plugin
[node-wkhtmltopdf]: https://www.npmjs.com/package/wkhtmltopdf
[wkhtmltopdf-options]: http://wkhtmltopdf.org/usage/wkhtmltopdf.txt
[issue-12]: https://github.com/documark/documark/issues/12
[wkhtmltopdf-binary]: https://www.npmjs.com/package/wkhtmltopdf-binary
[yeoman-generator]: https://www.npmjs.com/package/yo
[dmp-debug]: https://www.npmjs.com/package/dmp-debug
[latex-theme]: https://www.sharelatex.com/templates/thesis/norwegian-university-of-science-and-technology
[wkhtmltopdf-page-options-issue]: https://github.com/wkhtmltopdf/wkhtmltopdf/issues/2233
