# Documark

PDF generator for scripted documents.

A library that:

1. Compiles scripted document files (Jade, Markdown, and assets) into a PDF;
2. Is used as a command-line interface (`npm install documark -g`, `documark compile`);
3. Can watch for files changes (`documark compile --watch`) to recompile the document.

## Dependencies

1. Currently manually installing [WkHTMLToPDF][wkhtmltopdf-install] is still required.

## Build process

Each compile walks through the following steps:

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
2. In a seperate `config.json` file.

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

[wkhtmltopdf-install]: http://wkhtmltopdf.org/downloads.html
[cheeriojs]: https://github.com/cheeriojs/cheerio
[front-matter]: https://github.com/jxson/front-matter#example
[wkhtmltopdf-options]: http://wkhtmltopdf.org/usage/wkhtmltopdf.txt
