import { ESLintUtils } from '@typescript-eslint/utils';

export interface ExampleTypedLintingRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ExampleTypedLintingRuleDocs>(
  (name) => `https://github.com/bensaufley/eslint-plugin-preact-signals/tree/main/docs/${name}.md`,
);