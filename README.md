# Template: Shared Module

`eslint-plugin-mixmax` provides an eslint rule to prevent using `String.prototype.trimStart`, which
is not supported on MS Edge.

## How to use


## Building

`npm run build`

While developing, you can also run `npm run watch` to continually build as you save files.

## Running tests

`npm run test`

## Publishing

Merging to master will automatically publish the package if commits with non-trivial changes have
been introduced (per [commit conventions](https://www.conventionalcommits.org)).
