import path from 'node:path';
import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import { Signal } from '@preact/signals-core';

import { rule } from './no-implicit-boolean-signal.js';
import { describe } from 'node:test';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: parser,
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts*'],
        defaultProject: 'tsconfig.json',
      },
      tsconfigRootDir: path.join(__dirname, '../..'),
    },
  },
});

ruleTester.run('no-implicit-boolean-signal', rule, {
  valid: [
    {
      name: 'Signal is not from a preact package',
      code: `
        class Signal {
          constructor(value) {
            this.value = value;
          }
        }

        const foo: Signal | null = new Signal(null);
        if (!foo) {
          console.log('foo is null');
        }
      `,
    },
  ],
  invalid: [],
});

['signals-core', 'signals', 'signals-react'].forEach((pkg) => {
  RuleTester.describe(`@preact/${pkg}`, () => {
    const withImport = (name: string, code: string) => ({
      name,
      code: `import { Signal } from '@preact/${pkg}';\n${code}`,
    });

    ruleTester.run('no-implicit-boolean-signal', rule, {
      valid: [
        withImport(
          'implicit conversion of Signal.value',
          `const foo = new Signal<string | null>(null);
          if (foo.value) {
            console.log(\`Hello, \${foo}\`);
          }`,
        ),
        withImport(
          'implicit conversion of Signal.peek()',
          `const foo = new Signal<string | null>(null);
          const y = foo.peek() ? 'yes' : 'no';`,
        ),
        withImport(
          'implicit truthy conversion',
          `const foo = new Signal<string | null>(null);
          const z = !!foo.value && 'yes';`,
        ),
        withImport(
          'nullable union type variable',
          `const bar: Signal<string> | null;
          if (bar === null) {
            console.log('bar is null');
          }`,
        ),
      ],
      invalid: [
        {
          ...withImport(
            'implicit conversion of Signal in if statement',
            `const foo = new Signal<string | null>(null);
              if (foo) {
                console.log(\`Hello, \${foo}\`);
              }`,
          ),
          errors: [
            {
              messageId: 'implicitBooleanSignal',
              line: 3,
              endLine: 3,
              column: 19,
              endColumn: 22,
            },
          ],
        },
        {
          ...withImport(
            'implicit conversion of Signal in ternary',
            `const foo = new Signal<string | null>(null);
            const y = foo ? 'yes' : 'no';`,
          ),
          errors: [
            {
              messageId: 'implicitBooleanSignal',
              line: 3,
              endLine: 3,
              column: 23,
              endColumn: 26,
            },
          ],
        },
        {
          ...withImport(
            'conversion via double-bang',
            `const foo = new Signal<string | null>(null);
              const z = !!foo && 'yes';`,
          ),
          errors: [
            {
              messageId: 'implicitBooleanSignal',
              line: 3,
              endLine: 3,
              column: 27,
              endColumn: 30,
            },
          ],
        },
        {
          ...withImport(
            'negating value of nullable union type',
            `const bar: Signal<string> | null;
            if (!bar) {
              console.log('bar is null');
            }`,
          ),
          errors: [
            {
              messageId: 'implicitBooleanSignal',
              line: 3,
              endLine: 3,
              column: 18,
              endColumn: 21,
            },
          ],
        },
      ],
    });
  });
});