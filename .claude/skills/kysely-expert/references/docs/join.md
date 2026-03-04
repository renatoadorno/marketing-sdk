# Joins in Kysely

> Relate data between tables with `.innerJoin()`, `.leftJoin()`, etc.

## Simple Inner Join

```typescript
const result = await db
  .selectFrom('person')
  .innerJoin('pet', 'pet.owner_id', 'person.id')
  .select(['person.id', 'pet.name as pet_name'])
  .execute()
```

## Left Join

```typescript
const result = await db
  .selectFrom('person')
  .leftJoin('pet', 'pet.owner_id', 'person.id')
  .select(['person.id', 'pet.name as pet_name'])
  .execute()
```

## Aliased Join

```typescript
const result = await db
  .selectFrom('person')
  .innerJoin('pet as p', 'p.owner_id', 'person.id')
  .where('p.name', '=', 'Doggo')
  .selectAll()
  .execute()
```

## Complex Join Clause

Use a callback to add multiple conditions:

```typescript
const result = await db
  .selectFrom('person')
  .innerJoin(
    'pet',
    (join) => join
      .onRef('pet.owner_id', '=', 'person.id')
      .on('pet.species', '=', 'dog')
  )
  .selectAll()
  .execute()
```

## Subquery Join

```typescript
const result = await db
  .selectFrom('person')
  .innerJoin(
    (eb) => eb
      .selectFrom('pet')
      .select(['owner_id as owner', 'name'])
      .where('name', '=', 'Doggo')
      .as('doggos'),
    (join) => join.onRef('doggos.owner', '=', 'person.id'),
  )
  .selectAll('doggos')
  .execute()
```

## Performance Tip

- Ensure joined columns (FKs) are indexed.
- Prefer explicit columns in `.select()` to avoid redundant data.
