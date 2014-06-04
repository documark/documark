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

## Templating (draft)

Self-installable templates via `npm install documark-tpl-<name> -g`. And custom templates via `~/.config/documark/<name>/`.

## Roadmap

- [x] Compile to PDF
- [x] Watch option for auto-recompiling
- [x] Stylesheet support
- [ ] Script support
- [ ] Template support and `init` command
- [ ] Header/footer support
- [ ] Footnote/source generation
- [ ] Table of contents
- [ ] Manual page breaks
