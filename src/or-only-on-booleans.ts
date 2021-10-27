import { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import _ from 'lodash';
import { unionTypeParts } from 'tsutils';
import ts from 'typescript';

function isBooleanOrNullish({ flags }: ts.Type) {
  return !!(
    flags &
    (ts.TypeFlags.BooleanLike | ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.VoidLike)
  );
}

function canBeStringOrNumber({ flags }: ts.Type) {
  return !!(
    flags &
    (ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.Any | ts.TypeFlags.Unknown)
  );
}

export const orOnlyOnBooleans: TSESLint.RuleModule<
  'orOnlyOnBooleans' | 'useNullishCoalesce' | 'castToBoolean',
  unknown[]
> = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'disallow || for non-boolean left operands',
      url: 'https://github.com/mixmaxhq/eslint-plugin-mixmax#or-only-on-booleans---disallow--with-non-boolean-left-arguments',
      recommended: 'error',
      suggestion: true,
      requiresTypeChecking: true,
    },
    schema: [],
    messages: {
      orOnlyOnBooleans: 'Left operand of `{{operator}}` must be boolean',
      useNullishCoalesce: 'Use `{{replacement}}` instead',
      castToBoolean: 'Cast left-hand side to boolean',
    },
  },
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    function typesOf(expression: TSESTree.Expression) {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(expression);
      return unionTypeParts(checker.getTypeAtLocation(originalNode));
    }

    function check(operator: '||' | '||=') {
      return (expression: TSESTree.LogicalExpression | TSESTree.AssignmentExpression) => {
        const types = typesOf(expression.left);
        if (_.every(types, isBooleanOrNullish)) return;

        const op = sourceCode.getFirstTokenBetween(
          expression.left,
          expression.right,
          (token) => token.value === operator
        );
        if (!op) return;

        const replacement = operator.replace('||', '??');
        const isSafelyFixable = !_.some(types, canBeStringOrNumber);
        const fix = (fixer: TSESLint.RuleFixer) => {
          return fixer.replaceTextRange(op.range, replacement);
        };

        context.report({
          node: expression,
          loc: op.loc,
          messageId: 'orOnlyOnBooleans',
          data: { operator },
          fix: isSafelyFixable ? fix : null,
          suggest: [{ messageId: 'useNullishCoalesce', data: { replacement }, fix }],
        });
      };
    }

    return {
      'LogicalExpression[operator="||"]': check('||'),
      'AssignmentExpression[operator="||="]': check('||='),
    };
  },
};
