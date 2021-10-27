# Mixmax's ESLint plugin

- [Mixmax's ESLint plugin](#mixmaxs-eslint-plugin)
- [How to use](#how-to-use)
- [Available Rules](#available-rules)
  - [`or-only-on-booleans` - disallow `||` with non-boolean left arguments](#or-only-on-booleans---disallow--with-non-boolean-left-arguments)
  - [`stricter-typescript` – show Typescript errors as warnings](#stricter-typescript--show-typescript-errors-as-warnings)
    - [The problem](#the-problem)
    - [Proposed solution](#proposed-solution)
    - [Issues](#issues)
- [Contributing](#contributing)
  - [Building](#building)
  - [Running tests](#running-tests)
  - [Publishing](#publishing)

# How to use

First run: `npm install --save-dev \@mixmaxhq/eslint-plugin`

If you want to use any of the type-aware (Typescript-only) rules, add this to your `.eslintrc.js` file:

```js
{
  plugins: ['@typescript-eslint', '@mixmaxhq'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  …
```

Finally, enable any rules you need by adding them to `.eslintrc.js`, e.g.:

```js
{
  rules: {
    '@mixmaxhq/stricter-typescript': 'warn',
    …
```

# Available Rules

## `or-only-on-booleans` - disallow `||` with non-boolean left arguments

This rule will forbid using `||` with a non-boolean left argument, suggesting to either use `??` or cast the left-hand operand to a boolean using `!!`.

This prevents errors like `timeout || DEFAULT_TIMEOUT` not allowing setting `timeout` to `0`.

## `stricter-typescript` – show Typescript errors as warnings

This rule will report any Typescript errors as ESLint warnings.

This allows you, by using a different Typescript configuration for linting, to show certain errors as warnings in your IDE.

### The problem

When facing a large Javascript to Typescript migration, enabling the strictest type checking will make the initial migration Herculean task, but using a more lenient `tsconfig` will not take advantage of all the power of Typescript, and offer no progressive path towards the stricter standards.

A common solution is to use a more strict configuration in your IDE than in your build but, when the number of pending typechecking errors is large, your real errors will get lost in the haystack of "IDE-only" ones.

### Proposed solution

1. Define two separate Typescript configurations for your project:

   1. `tsconfig.build.json` will be used for building, and should only enable the type checks that you want to achieve in your initial migration effort.

   1. `tsconfig.eslint.json` will be used by ESLint and by this plugin, and should enable all type checks that you want to improve on.

   1. `tsconfig.json`, being the default, will be used by your IDE and other tools (most, like [Visual Studio Code](https://github.com/Microsoft/vscode/issues/12463), do not support changing it). Should, typically, just extend `tsconfig.build.json` (or viceversa).

   At mixmax we just have a `tsconfig-lint.json` and the defalt `tsconfig.json`, but the setup described above is more in line with the custom of the Typescript community and may give some additional flexiblity.

2. Configure your lint-test-build processes to use them.

   Add this to your `package.json`:

   ```js
   {
     "scripts": {
       "build": "tsc -p tsconfig.build.json",
       …
   ```

   and in `.eslintrc.json`:

   ```js
   {
     "parserOptions": {
       "project": "./tsconfig.eslint.json"
     }
     …
   ```

### Issues

True Typescript errors (the ones which are reported with both `tsconfig`s) are reported twice in the IDE: one by Typescript, one by ESLint.

Some of the reported errors may be difficult to understand and fix, because the types seen by ESLint may be different from those reported by the IDE -- since some of the Typescript type checking options actually change the types of entities. See for example [`noUncheckedIndexAccess`](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess) or [`exactOptionalProperties`](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes).

# Contributing

## Building

`npm run build`

While developing, you can also run `npm run watch` to continually build as you save files.

## Running tests

`npm run test`

## Publishing

Merging to master will automatically publish the package if commits with non-trivial changes have been introduced (per [commit conventions](https://www.conventionalcommits.org)).
