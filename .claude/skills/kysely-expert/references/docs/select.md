# Select Queries in Kysely

> SELECT queries are built using `.selectFrom()` and various `.select*()` methods.

## Basic Selection

```typescript
const result = await db
  .selectFrom('person')
  .select(['id', 'first_name', 'last_name'])
  .execute()
```

## Aliases

```typescript
const result = await db
  .selectFrom('person as p')
  .select([
    'p.first_name as name',
    'p.age as user_age'
  ])
  .execute()
```

## All Columns

```typescript
// SELECT *
const result = await db
  .selectFrom('person')
  .selectAll()
  .execute()

// SELECT person.*
const result = await db
  .selectFrom('person')
  .selectAll('person')
  .execute()
```

## Distinct

```typescript
const result = await db
  .selectFrom('person')
  .select('first_name')
  .distinct()
  .execute()
```

## Function Calls (Aggregates)

```typescript
const result = await db
  .selectFrom('person')
  .select(({ fn }) => [
    fn.avg<number>('age').as('avg_age'),
    fn.count<number>('id').as('total_count')
  ])
  .execute()
```

## Subqueries in Select

```typescript
const result = await db
  .selectFrom('person')
  .select((eb) => [
    'first_name',
    eb.selectFrom('pet')
      .select(({ fn }) => fn.count<number>('id'))
      .whereRef('pet.owner_id', '=', 'person.id')
      .as('pet_count')
  ])
  .execute()
```

## Complex Selections (JSON Objects)

Kysely supports complex nested objects if the dialect supports it (e.g., PostgreSQL JSON):

```typescript
const result = await db
  .selectFrom('person')
  .select((eb) => ({
    full_name: eb.fn('concat', ['first_name', eb.lit(' '), 'last_name']),
    address: eb.selectFrom('address')
      .selectAll()
      .whereRef('address.person_id', '=', 'person.id')
      .as('home_address')
  }))
  .execute()
```
