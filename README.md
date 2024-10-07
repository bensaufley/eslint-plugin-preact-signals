# `eslint-plugin-preact-signals`

ESLint plugin for type-aware linting of usage of [Preact Signals], including
from `@preact/signals-core`, `@preact/signals`, and `@preact/signals-react`.

## Installation

Add the `preact-signals` plugin to your ESLint configuration, and then you can
reference the rules in your config.

## Rules

- `preact-signals/no-implicit-boolean-signal`: disallow the implicit coercion of
  variables that can contain a Signal to a boolean value. This is useful for
  preventing accidental omissions of `.value` or `.peek()`.

[preact signals]: https://preactjs.com/guide/v10/signals/
