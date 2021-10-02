import * as path from 'path';

import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { noTrimStart } from '.';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.join(__dirname, '..', 'spec').toString(),
    project: './tsconfig.json',
  },
});

ruleTester.run('no-trim-start', noTrimStart, {
  valid: [
    {
      code: '"".trimLeft',
    },
  ],

  invalid: [
    {
      code: 'String.prototype.trimStart',
      errors: [{ messageId: 'prefer' }],
      output: 'String.prototype.trimLeft',
    },
    {
      code: '"".trimStart',
      errors: [{ messageId: 'prefer' }],
      output: '"".trimLeft',
    },
    {
      code: 'var x: string; x.trimStart()',
      errors: [{ messageId: 'prefer' }],
      output: 'var x: string; x.trimLeft()',
    },
    {
      code: '`${x as any}`.trimStart',
      errors: [{ messageId: 'prefer' }],
      output: '`${x as any}`.trimLeft',
    },
  ],
});
