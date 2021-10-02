# Template: Shared Module

This repository contains the template structure and boilerplate for a new shared module. It can run
as-is to give you a sense for how everything functions, but you'll want to follow the instructions
under "How to use."

## How to use

1. Click Github's "Use this Template" button on the [project homepage](https://github.com/mixmaxhq/template-module).
2. Git clone the new repo locally
3. Run the new project's initialization script: `./init.sh <name of project>`
4. Remove the `private` flag from `package.json` and update the `description`.
5. If creating a new public module, change the `publishConfig`'s `access` field in the `package.json` to
   `public` - this will cause `semantic-release` to publish it for any user of `npm`. Add in the
   appropriate `LICENSE` file and update the `license` field in `package.json`.
6. Remove the example code from `src/index.js`.
7. Update the README to document the modules's purpose and API.
<!-- END_TEMPLATE -->

## Building

`npm run build`

Outputs a commonjs-compatible bundle to `dist/index.js`.

While developing, you can also run `npm run watch` to continually build as you save files.

## Running tests

`npm test`

## Publishing

Merging to master will automatically publish the package if commits with non-trivial changes have
been introduced (per [commit conventions](https://www.conventionalcommits.org)).
