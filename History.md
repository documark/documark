
n.n.n / 2015-05-15
==================

  * Update README.
  * Update remaining markdown-it dependency.

v0.5.3 / 2015-05-14
===================

  * Bump to v0.5.3.
  * Update dependencies.
  * Update README.
  * Support many front matter languages (resolve #10).
  * Seperate document and compiler (resolve #9).

v0.5.2 / 2015-05-14
===================

  * Bump to v0.5.2.
  * Fix previous release. Oops.

v0.5.1 / 2015-05-13
===================

  * Bump to v0.5.1.
  * Add document path and file path to config.
  * Add 'documark config' command.
  * Move pre-compile event to seperate function.
  * Fix watcher stopping on exception (resolves #5).
  * Update README.

v0.5.0 / 2015-03-18
===================

  * Bump to v0.5.0.
  * Replace marked with markdown-it.
  * Update roadmap.
  * Update links in README.
  * Update package.json (repo urls).
  * Update README.
  * Update README.

v0.4.3 / 2015-03-06
===================

  * Bump to v0.4.3.
  * Fix '.slice(0)' error when no plugins are given.
  * Always wrap DOM in html, head, and body element.
  * Update roadmap in README.
  * Update roadmap in README.
  * Fix small mistake in README.

v0.4.2 / 2015-03-03
===================

  * Bump to v0.4.2.
  * Update README (resolve #6).
  * Fix version selectors of dependencies and add badges to README.
  * Small improvements to README.

v0.4.1 / 2015-02-22
===================

  * Add missing resolve dependency and bump to v0.4.1.
  * Update README.

v0.4.0 / 2015-02-22
===================

  * Bump to v0.4.0.
  * Add --file compile flag (resolve #4).
  * Move commands to this package.
  * Improve README.
  * Update README about writing/available plugins.
  * Minor code improvements.
  * Add roadmap to README.
  * Add wkhtmltopdf minimal required version to README.
  * Rewrite build process to use promises instead of streaming.
  * Minor improvements to README.
  * Update README.
  * Update README.
  * Update authors.

v0.3.0 / 2015-02-17
===================

  * Install locally instead, bump to v0.3.0.

v0.2.2 / 2015-02-15
===================

  * Bump to v0.2.2.
  * Simplify verbosity levels (warning=1, debug=3).
  * Add 'applyPlugins' function.
  * This time really remove async. Oops, here is a :banana:!
  * Remove obsolete async dependency.
  * Update README (add example and short rationale).
  * Update README.

v0.2.1 / 2015-02-10
===================

  * Bump to v0.2.1.
  * Move temp file helper functions to documark-cache plugin.
  * Properly close compile stream (fix async plugins).
  * Minor improvements.
  * Add 'pre-compile' and 'post-compile' event (replaces compile callback).
  * Add plugin logging (on verbosity of 2+) and temp file helper functions.
  * Fix plugin loading and Jade includes.
  * Improve file filters, which prevents unnecessary recompiles.
  * Only use given filename, and 'Document.pdf' by default.
  * Always add PDF options object to document config.
  * Apply plugins in series.

v0.2.0 / 2015-02-05
===================

  * Major rewrite.
  * Syntax changes, remove examples, and update README.
  * Uppercase first letter of filename if no document title/filename given.
  * Remove roadmap (will later be moved to wiki).
  * Simplify error handling of parser/plugin requiring.
  * Remove plugin names.

v0.1.5 / 2014-06-18
===================

  * Change plugin prefix back to 'documark-' and bump to 0.1.5.
  * Add seperate class for Parser.
  * Set main file directly to Documark.

v0.1.4 / 2014-06-17
===================

  * Bump to 0.1.4.
  * Fix dependency.
  * Update dependencies.
  * Rename lib/documark.js to lib/Documark.js (2/2).
  * Rename lib/documark.js to lib/Documark.js (1/2).
  * Improve compile watcher logging.
  * Refactor plugin system.
  * Output help on invalid command.
  * Add PDF plugin event.
  * Move wkhtmltopdf spawning to seperate method.
  * Add plugin provider.
  * Fix parser loading error message.
  * Move relative-paths plugin to Jade parser.
  * Reset plugins on reload (load method).
  * Allow adding custom/preloaded plugins.
  * Update README.
  * Improve basic example.
  * Add relative-paths as default plugin.
  * No loading of config.json when front matter IS available.
  * Update README.
  * Add hr-to-page-break as default plugin.

v0.1.3 / 2014-06-10
===================

  * Bump to 0.1.3.
  * Update README and basic example.
  * Allow document base as base dir in wkhtmltopdf.
  * Add callback to compile method, remove duplicate 'done' message.
  * Fix wkhtmltopdf error output.
  * Prefix private commands with underscore.
  * Add support for html modification by plugins.
  * Make cwd for spawn command relative to document root.
  * Add initial (not full functional) example of document basics.
  * Fix verbosity (default to zero).
  * Allow valueless flags for wkhtmltopdf.
  * Throttle recompile watcher and add flag to set throttle (in milliseconds).
  * Add HTML dump option to compile command (with -v flag).
  * Update README.md.
  * Verified script support.
  * Add wkhtmltopdf option support.

v0.1.2 / 2014-06-04
===================

  * Minor bugfixes. Also created visionmedia/commander.js#224.

v0.1.1 / 2014-06-04
===================

  * Bump to 0.1.0.
  * Add Jade as default parser.
  * Minimal working example.

v0.1.0 / 2014-05-30
===================

  * Add package.json and index.js.
  * Initial commit
