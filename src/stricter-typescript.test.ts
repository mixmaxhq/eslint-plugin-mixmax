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
  valid: [{ code: '(a: any) => a' }],

  invalid: [
    {
      code: '(a) => a',
      errors: [
        {
          messageId: 'typescriptError',
          data: { message: "Parameter 'a' implicitly has an 'any' type. (ts 7006)" },
        },
      ],
    },
  ],
});
