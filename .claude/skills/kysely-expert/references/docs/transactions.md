# Transactions in Kysely

> Ensuring data atomicity with `.transaction()`.

## Simple Transaction

The easiest way to use transactions is by providing a callback:

```typescript
await db.transaction().execute(async (trx) => {
  const person = await trx
    .insertInto('person')
    .values({ first_name: 'Jennifer' })
    .returning('id')
    .executeTakeFirstOrThrow()

  await trx
    .insertInto('pet')
    .values({ name: 'Doggo', owner_id: person.id })
    .execute()
})
```

## Transaction Isolation Levels

You can specify the isolation level (e.g., `readCommitted`, `serializable`):

```typescript
await db
  .transaction()
  .setIsolationLevel('serializable')
  .execute(async (trx) => {
    // transaction logic
  })
```

## Controlled Transactions (Manual Commit/Rollback)

For more advanced scenarios:

```typescript
const trx = await db.transaction().acquire()

try {
  await trx.insertInto('person').values({ first_name: 'Jennifer' }).execute()
  await trx.commit()
} catch (error) {
  await trx.rollback()
  throw error
}
```

## Transactions with Savepoints

Savepoints allow you to rollback a specific part of a transaction:

```typescript
await db.transaction().execute(async (trx) => {
  await trx.insertInto('person').values({ first_name: 'Jennifer' }).execute()

  await trx.savepoint('sp1').execute(async (strx) => {
    await strx.insertInto('pet').values({ name: 'Doggo' }).execute()
    // If this fails, only 'pet' insert is rolled back
  })
})
```

## Why use transactions?

- **Atomicity**: Either all operations succeed or none do.
- **Consistency**: Database stays in a valid state.
- **Isolation**: Prevents other queries from seeing partial data.
