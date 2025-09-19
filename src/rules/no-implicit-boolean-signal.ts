import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { TypeFlags, type Type } from 'typescript';

import { createRule } from '../utils.js';

const isBooleanCoercion = (node: TSESTree.Identifier): boolean | 'nullishCoalesce' => {
  if (!node.parent) return false;

  switch (node.parent.type) {
    case TSESTree.AST_NODE_TYPES.UnaryExpression:
      return node.parent.operator === '!';
    case TSESTree.AST_NODE_TYPES.IfStatement:
      return containsNode(node.parent.test, node);
    case TSESTree.AST_NODE_TYPES.ConditionalExpression:
      return containsNode(node.parent.test, node);
    case TSESTree.AST_NODE_TYPES.LogicalExpression:
      if (containsNode(node.parent, node)) {
        return node.parent.operator === '??' ? 'nullishCoalesce' : true;
      }
      return false;
    default:
      return false;
  }
};

const containsNode = (parent: TSESTree.Node, node: TSESTree.Node): boolean => {
  if (parent === node) return true;
  if ('left' in parent && containsNode(parent.left, node)) return true;
  if ('right' in parent && containsNode(parent.right, node)) return true;
  return false;
};

const getTypes = (type: Type): Type[] => (type.isUnionOrIntersection() ? type.types.flatMap(getTypes) : [type]);

const typeIsSignal = (type?: Type): [Type, ...Type[]] | undefined => {
  if (type === undefined) return undefined;
  const types = getTypes(type);
  const symbolTypeIndex = types.findIndex((t) => ['Signal', 'ReadonlySignal'].includes(t.symbol?.getName()));
  if (symbolTypeIndex === -1) return undefined;
  return [types[symbolTypeIndex]!, ...types.toSpliced(symbolTypeIndex)];
};

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);

    return {
      Identifier(node) {
        const typeChecker = services.program.getTypeChecker();
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        const type = typeChecker.getTypeAtLocation(tsNode);

        const types = typeIsSignal(type);
        if (!types) return;
        const [signalType, ...otherTypes] = types;

        const boolCoercion = isBooleanCoercion(node);
        if (!boolCoercion) return;

        const isNullable = otherTypes.some((t) => t.flags & TypeFlags.Null || t.flags & TypeFlags.Undefined);

        // Allow nullish coalescing with null or undefined
        if (boolCoercion === 'nullishCoalesce') {
          if (context.options[0]?.allowNullishCoalesce === 'always') return;
          if (context.options[0]?.allowNullishCoalesce === 'onlyNullable' && isNullable) return;
        }

        const fromPreactPackages = signalType.symbol.getDeclarations()?.some((declaration) => {
          const importPath = declaration.getSourceFile().fileName;
          return importPath.includes('/@preact/signals');
        });

        // Includes signals-core, signals, signals-react
        if (!fromPreactPackages) return;

        if (boolCoercion === 'nullishCoalesce') {
          context.report({
            node,
            messageId: 'implicitNullishCheck',
            data: { name: node.name },
          });
          return;
        }

        context.report({
          node,
          messageId: 'implicitBooleanSignal',
        });
      },
    };
  },
  meta: {
    schema: [
      {
        type: 'object',
        properties: {
          allowNullishCoalesce: {
            oneOf: [
              {
                type: 'string',
                enum: ['always', 'onlyNullable'],
              },
              {
                type: 'boolean',
                enum: [false],
              },
            ],
            default: 'onlyNullable',
          },
        },
      },
    ],
    type: 'problem',
    messages: {
      implicitBooleanSignal: 'Signal is implicitly converted to a boolean, which will always be true.',
      implicitNullishCheck:
        'Signal is implicitly checked for nullishness. Because this may be confused with a boolean check, consider using ${name} === null instead.',
    },
    docs: {
      description: 'Disallow implicit conversion of Signals to boolean',
      recommended: 'error',
      requiresTypeChecking: true,
    },
  },
  name: 'no-implicit-boolean-signal',
  defaultOptions: [
    {
      allowNullishCoalesce: 'onlyNullable' as 'always' | 'onlyNullable' | false,
    },
  ],
});
