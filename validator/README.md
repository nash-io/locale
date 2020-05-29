# locale-validator

### Usage

```typescript
// my-validator.ts
import { parse } from 'https://deno.land/std/flags/mod.ts'
import validate from 'https://github.com/nash-io/locale-validator/raw/master/validate.ts'

const { locale } = parse(Deno.args)

const defaultLocalePath = './locales/en.json'
const localesPath = Boolean(locale) ? locale : './locales/'
validate(defaultLocalePath, localesPath)
```

```bash
deno run --allow-read my-validator.ts
```

### Dev

```bash
deno run --unstable --lock=lock.json --lock-write validate.ts
```
