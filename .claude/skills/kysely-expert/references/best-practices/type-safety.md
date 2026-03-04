# Type Safety Best Practices in Kysely

> How to leverage TypeScript for robust, error-free database code.

## 1. Avoid `any` or `unknown`

Always provide a schema to your `Kysely` instance. This ensures autocomplete and type checks across all queries.

✅ **Do this:**

```typescript
import { Kysely } from 'kysely'
import { Database } from './types'

const db = new Kysely<Database>({ ... })
```

## 2. Using Selectable, Insertable, Updateable

Kysely provides helpers to extract row types from table definitions:

```typescript
import { Selectable, Insertable, Updateable } from 'kysely'
import { PersonTable } from './types'

export type Person = Selectable<PersonTable>
export type NewPerson = Insertable<PersonTable>
export type PersonUpdate = Updateable<PersonTable>
```

- **Selectable**: All columns (for reads).
- **Insertable**: Required columns must be provided (for inserts).
- **Updateable**: All columns are optional (for updates).

## 3. Explicitly Type Custom Column Conversions

For complex data (like JSON or Dates), use `ColumnType`:

```typescript
import { ColumnType } from 'kysely'

export interface PersonTable {
  // Select, Insert, Update types
  birthdate: ColumnType<Date, string, string>
  metadata: ColumnType<Record<string, any>, string | undefined, string>
}
```

## 4. Casting in Select (Cast to Non-Nullable)

If you know a column is NOT NULL but the type says otherwise, use casting:

```typescript
const result = await db
  .selectFrom('person')
  .select(['id', 'nullable_col'])
  .execute()

// Cast if you know it's there
const val = result[0].nullable_col as string
```

## 5. Reusable Type-Safe Helpers

Create generic helpers to reuse logic while maintaining types:

```typescript
async function findById<T extends keyof Database>(
  tableName: T,
  id: number
): Promise<Selectable<Database[T]> | undefined> {
  return await db
    .selectFrom(tableName as any)
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}
```

## 6. Prefer `executeTakeFirstOrThrow()`

For queries where a record MUST exist (like `findById`), use `executeTakeFirstOrThrow()`. This helps avoid `null` checks later in your code.

```typescript
const person = await db
  .selectFrom('person')
  .selectAll()
  .where('id', '=', 1)
  .executeTakeFirstOrThrow()
// person is not undefined here
```
