# Migrations in Kysely

> Kysely provides a manual migration system for precise control over your database schema.

## Creating a Migration

Migrations are simple JS/TS files with an `up` and `down` function:

```typescript
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('person')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('first_name', 'varchar', (col) => col.notNull())
    .addColumn('last_name', 'varchar')
    .addColumn('gender', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('person_first_name_index')
    .on('person')
    .column('first_name')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('person').execute()
}
```

## Running Migrations

You can run migrations using the `Migrator` class:

```typescript
import * as path from 'path'
import { promises as fs } from 'fs'
import { Migrator, FileMigrationProvider } from 'kysely'

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, 'migrations'),
  }),
})

// To migrate to the latest version:
const { error, results } = await migrator.migrateToLatest()
```

## Common Schema Operations

- **Add Column**: `.addColumn('age', 'integer')`
- **Drop Column**: `.dropColumn('age')`
- **Alter Column**: `.alterColumn('first_name', (col) => col.setNotNull())`
- **Rename Table**: `.renameTable('old', 'new')`
- **Create Index**: `.createIndex('idx').on('table').column('col').execute()`

## Best Practices

- Always write a `down` function for rollbacks.
- Never modify an existing migration file that has already been deployed. Create a new one.
- Test your migrations locally before deploying to production.
- Use `sql` template tag for dialect-specific defaults (like `sql`now()``).
