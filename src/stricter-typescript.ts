import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import _ from 'lodash';
import ts from 'typescript';

export const stricterTypescript: TSESLint.RuleModule<'typescriptError', unknown[]> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'show Typescript errors',
      category: 'Possible Errors',
      url: 'https://github.com/mixmaxhq/eslint-plugin-mixmax#stricter-typescript',
      recommended: false,
      suggestion: false,
    },
    schema: [],
    messages: {
      typescriptError: '{{message}}',
    },
  },
  create(context) {
    // Map of the errors by their range as strings: `${start},${end}`.
    const errors: Partial<Record<string, string>> = {};

    const parserServices = ESLintUtils.getParserServices(context);
    const diagnostics = ts.getPreEmitDiagnostics(parserServices.program);

    /**
     * Recollect the errors in this `Program` into the `errors` map.
     *
     * (`Program` is always processed before its children).
     */
    function collectErrors(program: TSESTree.Program) {
      const file = parserServices.esTreeNodeToTSNodeMap.get(program);
      for (const error of diagnostics) {
        if (
          error.file === file &&
          error.category == ts.DiagnosticCategory.Error &&
          error.start &&
          error.length
        ) {
          const start = error.start;
          const end = error.start + error.length;
          const key = `${start},${end}`;
          const message = formatError(error);

          if (key in errors) errors[key] += '\n\n' + message;
          else errors[key] = message;
        }
      }
    }

    /**
     * Look in the `errors` map for an error for this `node` and
     * report it if found.
     */
    function reportErrors(node: TSESTree.Node): void {
      const key = node.range.toString();
      const error = errors[key];
      if (error) {
        context.report({
          messageId: 'typescriptError',
          data: { message: error },
          node,
        });

        // Remove the error from the map to avoid reporting it multiple times
        errors[key] = undefined;
      }
    }

    return {
      ..._.mapValues(AST_NODE_TYPES, () => reportErrors),
      Program: collectErrors,
    };
  },
};

function formatError(error: ts.Diagnostic): string {
  const { messageText: message } = error;
  if (typeof message === 'string') return format([error as ts.DiagnosticMessageChain]);
  else return format([message]);
}

function format(messages: ts.DiagnosticMessageChain[], level = 0): string {
  const formattedMessages = messages.map((message) => {
    const { messageText, code, next } = message;
    const formattedMessage = '  '.repeat(level) + `${messageText} (ts ${code})`;

    if (next) return formattedMessage + '\n' + format(next, level + 1);
    else return formattedMessage;
  });

  return formattedMessages.join('\n\n');
}
