# Documark

> PDF generator for scripted documents.

A library that:

1. Compiles scripted document files (Jade, Markdown, and assets) into a PDF;
2. Is used as a command-line interface (`npm install -g documark-cli`, `documark compile`);
3. Can watch for files changes (`documark compile --watch`) to recompile the document.

## Why?

My personally hatret towards WYSIWYG word processors sparked me to write this tool. LaTeX felt like a waste of time, so instead I figured: why not use Markdown? I like Documark because it:

1. Separates content and styling
2. Uses mature webtechnologies like Markdown, HTML, JS, and CSS for writing/styling the document
3. Enforces a consistent document style (no dragging around table columns and floating images)
4. Allows version control with Git or SVN
5. Simplifies collaboration (by splitting up the document in separate files)
6. Allows you to use your favorite text editor - like Vim ❤
7. Makes automating things (through plugins) real easy!

## Example

Go to the [Documark example][documark-example] repository for a generated PDF and its sourcecode.

## Dependencies

1. Currently manually installing [WkHTMLToPDF][wkhtmltopdf-install] is still required.

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

1. In the document's [front matter][front-matter];
2. In a separate `config.json` file.

If there is front matter in the document, the configuration file will be ignored.

### WkHTMLToPDF

Configure WkHTMLToPDF with the `pdf` object in the documents front matter. For example:

```yaml
---
title: Document
pdf:
  userStyleSheet: path/to/main.css
---
```

See [this page][wkhtmltopdf-options] for a full list of configuration options.

[documark-example]: https://github.com/mauvm/documark-example
[wkhtmltopdf-install]: http://wkhtmltopdf.org/downloads.html
[cheeriojs]: https://github.com/cheeriojs/cheerio
[front-matter]: https://github.com/jxson/front-matter#example
[wkhtmltopdf-options]: http://wkhtmltopdf.org/usage/wkhtmltopdf.txt
