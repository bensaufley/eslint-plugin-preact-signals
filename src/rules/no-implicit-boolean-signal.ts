import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils.js';
import type { Type } from 'typescript';

const isBooleanCoercion = (node: TSESTree.Identifier): boolean =>
  !!node.parent &&
  ((node.parent.type === TSESTree.AST_NODE_TYPES.UnaryExpression && node.parent.operator === '!') ||
    (node.parent.type === TSESTree.AST_NODE_TYPES.IfStatement && containsNode(node.parent.test, node)) ||
    (node.parent.type === TSESTree.AST_NODE_TYPES.ConditionalExpression && containsNode(node.parent.test, node)) ||
    (node.parent.type === TSESTree.AST_NODE_TYPES.LogicalExpression && containsNode(node.parent, node)));

const containsNode = (parent: TSESTree.Node, node: TSESTree.Node): boolean => {
  if (parent === node) return true;
  if ('left' in parent && containsNode(parent.left, node)) return true;
  if ('right' in parent && containsNode(parent.right, node)) return true;
  return false;
};

const typeIsSignal = (type?: Type): Type | undefined => {
  if (type === undefined) return undefined;
  if (type.isUnionOrIntersection()) {
    return type.types.find((type) => typeIsSignal(type));
  }
  return ['Signal', 'ReadonlySignal'].includes(type.symbol?.getName()) ? type : undefined;
};

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context);

    return {
      Identifier(node) {
        const typeChecker = services.program.getTypeChecker();
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        const type = typeChecker.getTypeAtLocation(tsNode);

        const signalType = typeIsSignal(type);
        if (!signalType) return;
        if (!isBooleanCoercion(node)) return;

        const fromPreactPackages = signalType.symbol.getDeclarations()?.some((declaration) => {
          const importPath = declaration.getSourceFile().fileName;
          return importPath.includes('/@preact/signals');
        });

        // Includes signals-core, signals, signals-react
        if (!fromPreactPackages) return;

        context.report({
          node,
          messageId: 'implicitBooleanSignal',
        });
      },
    };
  },
  meta: {
    schema: [],
    fixable: 'code',
    type: 'suggestion',
    messages: {
      implicitBooleanSignal: 'Signal is implicitly converted to a boolean, which will always be true.',
    },
    docs: {
      description: 'Disallow implicit conversion of Signals to boolean',
      recommended: 'error',
      requiresTypeChecking: true,
    },
  },
  name: 'no-implicit-boolean-signal',
  defaultOptions: [],
});
