# Template: Shared Module

`eslint-plugin-mixmax` provides some eslint rules:
- `no-trimstart`: prevents using `String.prototype.trimStart`, which is not supported by MS Edge.

## How to use

First run: `npm install --save-dev \@mixmaxhq/eslint-plugin`

Then add this to your `.eslintrc.json` file:
```
  ...
  plugins: ['@typescript-eslint', '@mixmaxhq'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  rules: {
    '@mixmaxhq/no-trimstart': 'error',
    ...
```

## Building

`npm run build`

While developing, you can also run `npm run watch` to continually build as you save files.

## Running tests

`npm run test`

## Publishing

Merging to master will automatically publish the package if commits with non-trivial changes have been introduced (per [commit conventions](https://www.conventionalcommits.org)).
