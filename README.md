# Documark

[![npm version](https://badge.fury.io/js/documark.svg)](http://badge.fury.io/js/documark)
[![dependency status](https://david-dm.org/documark/documark.svg)](https://david-dm.org/documark)

> PDF generator for scripted documents.

A library that:

1. Compiles scripted document files ([Jade][jade], [Markdown][markdown], and assets) into a PDF.
2. Is used as a command line interface ([`npm install -g documark-cli`][documark-cli]).
3. Can watch for files changes to recompile the document (`documark compile --watch`).

## Why?

My personally hatret towards WYSIWYG word processors (Word, Pages, etc.) sparked me to write this tool. [LaTeX][latex] felt like a waste of time, so instead I figured: why not use Markdown? I like Documark because it:

1. Separates content and styling.
2. Uses mature webtechnologies like Markdown, HTML, JS, and CSS for writing/styling the document.
3. Enforces a consistent document style (no dragging around table columns and floating images).
4. Allows version control with Git or SVN.
5. Simplifies collaboration (by splitting up the document in separate files).
6. Allows you to use your favorite text editor - like Vim ❤ .
7. Makes automating things (through plugins) real easy.

## Example

Go to the [Documark example][documark-example] repository for a generated PDF and its source code.

## Dependencies

1. Currently manually installing [wkhtmltopodf v0.12.2.1+][wkhtmltopdf-install] is still required.

## Build process

These are the steps for compiling the PDF document:

1. Input files (Jade, Markdown, and assets)
2. Generate HTML
3. Convert to DOM tree (with [CheerioJS][cheeriojs])
3. Process plugins (which can alter the DOM and PDF configuration)
4. Emit `pre-compile` event
5. Generate PDF
6. Emit `post-compile` event

## Configuration

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

__Tip:__ Use the [documark plugin loader][dmp-plugin-loader] to load custom plugins!

### Themes

Themes are loaded as plugins and should be prefixed with `dmp-theme-`.

__Note:__ Currently the default theme (`dmp-theme-default`) is not consistent with this, which I will fix soon (see [Roadmap](#user-content-roadmap)).

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

## Plugin development

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

### Available plugins

Plugins all have the `documark-plugin` keyword. They are [listed on the NPM website][documark-plugins].

## Roadmap

1. [x] Move [documark CLI][documark-cli] commands to this repository.
1. [x] Rename `documark-` prefixed plugins and themes to `dmp-` and `dmp-theme-` respectively.
1. [ ] Research alternatives to wkhtmltopdf ([#12][issue-12]).
1. [ ] Use [wkhtmltopdf binary][wkhtmltopdf-binary] package to automatically download the required wkhtmltopdf tools.
1. [ ] Build tools for debugging ([dmp-debug][dmp-debug], logger etc).
1. [ ] Improve support: set up website, write wiki pages, and set up IRC channel.
1. [ ] Create [Yeoman generator][yeoman-generator] for easy document/plugin setup: `yo documark` and `yo documark-plugin`.
1. [ ] Including code files/snippets with highlighting.
1. [ ] Create scientific - [LaTex like][latex-theme] - theme.
1. [ ] Landscape pages ([not possible yet][wkhtmltopdf-page-options-issue] ◔̯◔).

[jade]: http://jade-lang.com/
[markdown]: http://daringfireball.net/projects/markdown/syntax
[latex]: http://www.latex-project.org/
[documark-cli]: https://www.npmjs.com/package/documark-cli
[documark-example]: https://github.com/documark/documark-example
[wkhtmltopdf-install]: http://wkhtmltopdf.org/downloads.html
[cheeriojs]: https://www.npmjs.com/package/cheerio
[front-matter]: https://github.com/jxson/front-matter#example
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
