# Generating Types in Kysely

> Kysely relies on TypeScript interfaces to provide full type safety.

## Manual Type Definition

If you don't use code generation, you must define your interfaces manually:

```typescript
import { Generated, ColumnType } from 'kysely'

export interface Database {
  person: PersonTable
  pet: PetTable
}

export interface PersonTable {
  id: Generated<number>
  first_name: string
  last_name: string | null
  age: number
  // For timestamps that are auto-generated on insert
  created_at: Generated<Date>
  // Complex columns can use ColumnType<SelectType, InsertType, UpdateType>
  updated_at: ColumnType<Date, string | undefined, string>
}

export interface PetTable {
  id: Generated<number>
  name: string
  owner_id: number
  species: 'dog' | 'cat' | 'hamster'
}
```

## Using Code Generators

It is highly recommended to use an automatic type generator based on your database schema:

- [kysely-codegen](https://github.com/robinwenzl/kysely-codegen): Generates types from a live database.
- [prisma-kysely](https://github.com/valtyr/prisma-kysely): Generates Kysely types from a Prisma schema.
- [kysely-prisma](https://github.com/clover-fi/kysely-prisma): Integration for Prisma and Kysely.

### Example: Using kysely-codegen

Run the command to introspect your database:

```bash
npx kysely-codegen --out types.ts --url postgresql://user:pass@localhost:5432/db
```

Then, use the generated types:

```typescript
import { Kysely, PostgresDialect } from 'kysely'
import { DB } from './types' // Generated file

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    // ... config
  })
})
```

## Using Selectable, Insertable, Updateable

Helpers for using table types in your application:

```typescript
import { Selectable, Insertable, Updateable } from 'kysely'
import { PersonTable } from './types'

export type Person = Selectable<PersonTable>
export type NewPerson = Insertable<PersonTable>
export type PersonUpdate = Updateable<PersonTable>

async function updatePerson(id: number, data: PersonUpdate) {
  // data is correctly typed for updates (optional fields)
}
```
