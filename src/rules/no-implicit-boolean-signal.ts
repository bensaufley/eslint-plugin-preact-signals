import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../utils.js';
import type { Type } from 'typescript';

function isBooleanCoercion(node: TSESTree.Identifier): boolean {
  return (
    node.parent &&
    ((node.parent.type === TSESTree.AST_NODE_TYPES.UnaryExpression && node.parent.operator === '!') ||
      (node.parent.type === TSESTree.AST_NODE_TYPES.IfStatement && node.parent.test === node) ||
      (node.parent.type === TSESTree.AST_NODE_TYPES.ConditionalExpression && node.parent.test === node))
  );
}

const typeIsSignal = (type?: Type): Type | undefined => {
  if (type === undefined) return undefined;
  if (type.isUnionOrIntersection()) {
    return type.types.find((type) => typeIsSignal(type));
  }
  return type.symbol?.getName() === 'Signal' ? type : undefined;
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
          const sourceFile = declaration.getSourceFile();
          const importPath = sourceFile?.fileName;
          return importPath?.includes('/@preact/signals');
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
      recommended: true,
      requiresTypeChecking: true,
    },
  },
  name: 'no-implicit-boolean-signal',
  defaultOptions: [],
});
