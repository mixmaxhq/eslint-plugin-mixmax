import * as path from 'path';

import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { orOnlyOnBooleans } from './or-only-on-booleans';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: path.join(__dirname, '..', 'spec').toString(),
    project: './tsconfig.json',
  },
});

ruleTester.run('or-only-on-booleans', orOnlyOnBooleans, {
  valid: [
    // Applies only to ||
    { code: '0 && 0' },
    { code: '0 ?? 0' },
    // Valid if left operand is a boolean
    { code: 'true || 0' },
    { code: 'x as boolean || 0;' },
    { code: '!!0 || 0' },
    // Valid if left operand is a nullishable boolean
    { code: 'var x: boolean | null | undefined; x || 0;' },
    { code: 'var r: { x?: boolean }; r.x || 0' },
    // Understands type assertions
    { code: 'declare function isT<T>(x): x is T; isT(x) || 0;' },

    // Applies only to ||=
    { code: 'x &&= 0' },
    { code: 'x ??= 0' },
    // Valid if LHS is a boolean
    { code: 'var x: boolean; x ||= 0' },
    // Valid if LHS is a nullishable boolean
    { code: 'var r: { x?: boolean }; r.x ||= 0' },
  ],
  invalid: [
    {
      // Applies to non-booleans
      code: '0 || 0',
      output: '0 || 0',
      errors: [
        {
          messageId: 'orOnlyOnBooleans',
          suggestions: [{ messageId: 'useNullishCoalesce', output: '0 ?? 0' }],
        },
      ],
    },
    {
      // Applies to `any`
      code: 'x as any || 0',
      output: 'x as any || 0',
      errors: [
        {
          messageId: 'orOnlyOnBooleans',
          suggestions: [{ messageId: 'useNullishCoalesce', output: 'x as any ?? 0' }],
        },
      ],
    },
    {
      // Fixes if safe
      code: '({} || 0)',
      output: '({} ?? 0)',
      errors: [
        {
          messageId: 'orOnlyOnBooleans',
          suggestions: [{ messageId: 'useNullishCoalesce', output: '({} ?? 0)' }],
        },
      ],
    },

    {
      // Applies to non-booleans
      code: 'var x = 0; x ||= 0',
      output: 'var x = 0; x ||= 0',
      errors: [
        {
          messageId: 'orOnlyOnBooleans',
          suggestions: [{ messageId: 'useNullishCoalesce', output: 'var x = 0; x ??= 0' }],
        },
      ],
    },
    {
      // Applies to `any`
      code: 'var x: any; x ||= 0',
      output: 'var x: any; x ||= 0',
      errors: [
        {
          messageId: 'orOnlyOnBooleans',
          suggestions: [{ messageId: 'useNullishCoalesce', output: 'var x: any; x ??= 0' }],
        },
      ],
    },
    {
      // Fixes if safe
      code: '[] ||= a',
      output: '[] ??= a',
      errors: [
        {
          messageId: 'orOnlyOnBooleans',
          suggestions: [{ messageId: 'useNullishCoalesce', output: '[] ??= a' }],
        },
      ],
    },
  ],
});
