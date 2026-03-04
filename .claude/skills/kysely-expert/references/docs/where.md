# Where Clauses in Kysely

> Filtering data with `.where()` and logic operators.

## Simple Where

```typescript
const result = await db
  .selectFrom('person')
  .where('id', '=', 1)
  .where('age', '>', 18)
  .selectAll()
  .execute()
```

## Where In

```typescript
const result = await db
  .selectFrom('person')
  .where('id', 'in', [1, 2, 3])
  .selectAll()
  .execute()
```

## Complex Logic (AND / OR)

To build complex conditions, use a callback:

```typescript
const result = await db
  .selectFrom('person')
  .where((eb) => eb.or([
    eb.and([
      eb('first_name', '=', 'Jennifer'),
      eb('age', '>', 18)
    ]),
    eb.and([
      eb('first_name', '=', 'Arnold'),
      eb('age', '>', 20)
    ])
  ]))
  .selectAll()
  .execute()
```

## Conditional Filtering

Useful for dynamic filters (e.g., search forms):

```typescript
let query = db.selectFrom('person').selectAll()

if (firstName) {
  query = query.where('first_name', '=', firstName)
}

if (minAge) {
  query = query.where('age', '>=', minAge)
}
```

## Subqueries in Where

```typescript
const result = await db
  .selectFrom('person')
  .where('id', 'in', (eb) => eb
    .selectFrom('pet')
    .select('owner_id')
    .where('species', '=', 'dog')
  )
  .selectAll()
  .execute()
```

## Object Filter (Shorthand Equality)

```typescript
const result = await db
  .selectFrom('person')
  .where('first_name', '=', 'Jennifer')
  .where('last_name', '=', 'Aniston')
  .selectAll()
  .execute()
```
