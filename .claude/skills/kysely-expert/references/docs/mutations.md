# Data Mutations in Kysely

> Inserting, updating, and deleting data with `.insertInto()`, `.updateTable()`, and `.deleteFrom()`.

## Insert Single Row

```typescript
const result = await db
  .insertInto('person')
  .values({
    first_name: 'Jennifer',
    last_name: 'Aniston',
    age: 40
  })
  .executeTakeFirst()
```

## Insert Multiple Rows

```typescript
await db
  .insertInto('person')
  .values([{
    first_name: 'Jennifer',
    age: 40
  }, {
    first_name: 'Arnold',
    age: 70
  }])
  .execute()
```

## Update Table

```typescript
const result = await db
  .updateTable('person')
  .set({
    first_name: 'Jennifer',
    last_name: 'Aniston'
  })
  .where('id', '=', 1)
  .executeTakeFirst()
```

## Delete From

```typescript
const result = await db
  .deleteFrom('person')
  .where('id', '=', 1)
  .executeTakeFirst()
```

## Returning Data (PostgreSQL / SQLite 3.35+)

```typescript
const result = await db
  .insertInto('person')
  .values({ first_name: 'Jennifer' })
  .returning(['id', 'first_name'])
  .executeTakeFirstOrThrow()
```

## On Conflict (Upsert)

```typescript
const result = await db
  .insertInto('person')
  .values({ id: 1, first_name: 'Jennifer' })
  .onConflict((oc) => oc
    .column('id')
    .doUpdateSet({ first_name: 'Jennifer' })
  )
  .execute()
```

## Subqueries in Mutations

```typescript
await db
  .insertInto('person')
  .values({
    first_name: 'Jennifer',
    age: db.selectFrom('person').select(({ fn }) => fn.avg<number>('age'))
  })
  .execute()
```
