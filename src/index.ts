import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { readFileSync } from 'node:fs';

import type packageJson from '../package.json';

import { rules } from './rules/index.js';
import { resolve } from 'node:path';

const packagePath =
  typeof require === 'undefined' ? resolve(import.meta.dirname, '../package.json') : require.resolve('../package.json');

const { name, version } = JSON.parse(readFileSync(packagePath, 'utf8')) as typeof packageJson;

const plugin: FlatConfig.Plugin = {
  meta: { name, version },
  rules,
};

export default plugin;
