# `no-implicit-boolean-signal`

Signals can act like scalar values in certain situations in Preact and React, and in template literals. But this can lead to mistakes where rather than checking for the truthiness of a Signal's value, you're checking if the Signal itself is truthy – which will always be true. This rule disallows implicit coercion of a Signal to a boolean.

## Examples

### Error cases

```ts
import { Signal } from '@preact/signals-core';

const foo = new Signal<string | null>(null);

if (foo) {
  console.log(`Hello, ${foo}`);
}

const y = foo ? 'yes' : 'no';

const z = !!foo && 'yes';

const bar: Signal<string> | null;

if (!bar) {
  console.log('bar is null');
}
```

### Correct cases

```ts
import { Signal } from '@preact/signals-core';

const foo = new Signal<string | null>(null);

if (foo.value) {
  console.log(`Hello, ${foo}`);
}

const y = foo.peek() ? 'yes' : 'no';

const z = !!foo.value && 'yes';

const bar: Signal<string> | null;

if (bar === null) {
  console.log('bar is null');
}
```
