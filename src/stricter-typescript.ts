import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import _ from 'lodash';
import ts from 'typescript';

type Setting = 'off' | 'warn' | 0 | 1 | false | true;
const settingSchema = { enum: ['off', 'warn', 0, 1, false, true] };

export const stricterTypescript: TSESLint.RuleModule<'typescriptError', unknown[]> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'show Typescript errors',
      url: 'https://github.com/mixmaxhq/eslint-plugin-mixmax#stricter-typescript--show-typescript-errors-as-warnings',
      recommended: false,
      suggestion: true,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        patternProperties: { '^ts\\d+': settingSchema },
        noImplicitAny: settingSchema,
        additionalProperties: false,
      },
    ],
    messages: {
      typescriptError: '{{message}}',
    },
  },
  create(context) {
    // Map of the error messages keyed by their range as strings: `${start},${end}`
    const errorMap: Partial<Record<string, Array<string>>> = {};

    const parserServices = ESLintUtils.getParserServices(context);
    const diagnostics = ts.getPreEmitDiagnostics(parserServices.program);

    // This type assertion is implied by the rule's schema
    const options = (context.options[0] ?? {}) as Partial<Record<string, Setting>>;

    const setting = (code: number) => options?.[`ts${code}`] ?? 'warn';

    const isOn = (code: number) => [1, 'warn', true].includes(setting(code));

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
          error.length &&
          isOn(error.code)
        ) {
          const start = error.start;
          const end = error.start + error.length;
          const key = `${start},${end}`;
          const message = formatError(error);

          if (key in errorMap) errorMap[key]?.push(message);
          else errorMap[key] = [message];
        }
      }
    }

    /**
     * Look in the `errors` map for an error for this `node` and
     * report it if found.
     */
    function reportErrors(node: TSESTree.Node): void {
      const key = node.range.toString();
      const messages = errorMap[key];
      if (messages) {
        for (const message of messages) {
          context.report({
            node,
            messageId: 'typescriptError',
            data: { message },
          });

          // Remove the error from the map to avoid reporting it multiple times
          errorMap[key] = undefined;
        }
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
    const formattedMessage = '  '.repeat(level) + `${messageText} (ts${code})`;

    if (next) return formattedMessage + '\n' + format(next, level + 1);
    else return formattedMessage;
  });

  return formattedMessages.join('\n\n');
}
