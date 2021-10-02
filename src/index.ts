import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { TypeFlags } from 'typescript';

const { MemberExpression, Identifier } = AST_NODE_TYPES;
const { StringLike } = TypeFlags;

export const noTrimStart: TSESLint.RuleModule<'prefer', unknown[]> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow `String.prototype.trimStart`',
      category: 'Possible Errors',
      url: 'https://github.com/mixmaxhq/eslint-plugin-mixmax',
      recommended: false,
      suggestion: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      prefer: 'Prefer `trimLeft`, as it has wider browser support.',
    },
  },
  create(context) {
    function check(node: TSESTree.MemberExpression): void {
      function report() {
        context.report({
          messageId: 'prefer',
          node: node.property,
          fix: (fixer) => fixer.replaceText(node.property, 'trimLeft'),
        });
      }

      if (
        node.type === MemberExpression &&
        node.property.type === Identifier &&
        node.property.name === 'trimStart'
      ) {
        // String.prototype.trimStart
        if (
          node.object.type === MemberExpression &&
          node.object.property.type === Identifier &&
          node.object.property.name === 'prototype' &&
          node.object.object.type === Identifier &&
          node.object.object.name === 'String'
        ) {
          report();
          return;
        }

        // string.trimStart
        const parserServices = ESLintUtils.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();

        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node.object);
        const type = checker.getTypeAtLocation(originalNode);
        if (type.flags & StringLike) {
          report();
          return;
        }
      }
    }

    return {
      MemberExpression: check,
    };
  },
};

export const rules = {
  'no-trim-start': noTrimStart,
};
