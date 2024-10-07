import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

import { rule as noImplicitBooleanSignal } from './no-implicit-boolean-signal.js';

export const rules: FlatConfig.Plugin['rules'] = {
  'preact-signals/no-implicit-boolean-signal': noImplicitBooleanSignal,
};
