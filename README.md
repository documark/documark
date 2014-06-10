# Documark

PDF generator for scripted documents.

A library that:

1. Compiles scripted document files (html, jade, markdown, css, js) into a PDF;
2. Allow usage of templates (`documark init` to pick template and configure it);
3. Is used as a command-line interface (`npm install documark -g`, `documark compile`);
4. Can watch for files changes (`documark compile --watch`) to recompile the document.

Note: This is still a work in progress!

## Dependencies

1. For now manually installing [wkhtmltopdf](http://wkhtmltopdf.org/downloads.html) is still required.

## Configuration

Document configuration can be done in two ways:

1. In the document's [front matter](https://github.com/jxson/front-matter#example);
2. In a seperate `config.json`.

If there is front matter in the document, the configuration file will be ignored.

### wkhtmltopdf

Configure wkhtmltopdf with the `pdf` object in the documents front matter. For example:

```yaml
---
title: Document
pdf:
  user-style-sheet: path/to/main.css
---
```

See [http://wkhtmltopdf.org/usage/wkhtmltopdf.txt](http://wkhtmltopdf.org/usage/wkhtmltopdf.txt) for a full list of configuration options.

## Scripts

Use inline scripts or the `--run-script <js>` option.

## Templates (draft)

Self-installable templates via `npm install documark-tpl-<name> -g`. And custom templates via `~/.config/documark/<name>/`.

## Roadmap / features

- [x] Compile to PDF
- [x] Watch option for auto-recompiling
- [x] Stylesheet support
- [x] Script support
- [x] Throttle compile watcher
- [x] Add basic example
- [ ] Add automatic installation of dependencies
- [ ] Template support and `init` command
- [ ] Header/footer support
- [ ] Footnote/source generation
- [ ] Table of contents
- [ ] Manual page breaks
- [ ] Automatically install requested plugins
- [ ] Make Sublime Text build system