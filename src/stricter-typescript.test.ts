import * as path from 'path';

import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { stricterTypescript } from './stricter-typescript';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.join(__dirname, '..', 'spec').toString(),
    project: './tsconfig.json',
  },
});

ruleTester.run('stricter-typescript', stricterTypescript, {
  valid: [
    {
      // Smoke test
      code: '(a: any) => a',
    },
    {
      // Can disable individual Typescript errors by error code
      code: `
        // eslint stricter-typescript: [1, { ts7006: 0 }]
        (a) => a
      `,
    },
  ],
  invalid: [
    {
      // Reports Typescript errors
      code: '(a) => a',
      errors: [
        {
          messageId: 'typescriptError',
          data: { message: "Parameter 'a' implicitly has an 'any' type. (ts7006)" },
        },
      ],
    },
  ],
});
