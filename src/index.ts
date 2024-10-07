import { rules } from './rules/index.js';
import type packageJson from '../package.json';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

const { name, version } =
  // `import`ing here would bypass the TSConfig's `"rootDir": "src"`
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../package.json') as typeof packageJson;

const plugin: FlatConfig.Plugin = {
  meta: { name, version },
  rules,
};

export default plugin;
