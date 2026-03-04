# Getting Started with Kysely

> Prerequisites and basic setup.

## Installation

```bash
npm install kysely
# Install the dialect driver for your database
npm install pg        # for PostgreSQL
npm install mysql2    # for MySQL
npm install sqlite3   # for SQLite
```

## Basic Configuration (PostgreSQL)

```typescript
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database } from './types'

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: 'localhost',
      database: 'my_db',
      password: 'password',
      user: 'user',
      port: 5432,
    })
  })
})
```

## Kysely with Bun (SQLite)

```typescript
import { Kysely, SqliteDialect } from 'kysely'
import { Database as BunDatabase } from 'bun:sqlite'
import { Database } from './types'

const db = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: new BunDatabase('db.sqlite')
  })
})
```

## Core Concepts

1. **Dialect**: The bridge between Kysely and the database (PG, MySQL, SQLite, etc.).
2. **Database Interface**: The TypeScript definition of your schema.
3. **Execution**: Most queries end with `.execute()` (returns array) or `.executeTakeFirst()` (returns single object or undefined).
