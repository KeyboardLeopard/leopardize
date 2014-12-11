leopardize
==========

An NPM/browserify module for running a static version of the replacement logic from KeyboardLeopard

## Differences between this and the version in KeyboardLeopard

- This uses Cheerio rather than the DOM.
- Unlike KeyboardLeopard's filter loader function, the constructor interface
  doesn't filter for "enabled" filters.