# Avoiding N+1 Queries in Kysely

> The N+1 problem occurs when you fetch a parent record (1 query) and then fetch related records for each parent in a loop (N queries).

## Identifying the N+1 Problem

❌ **Don't do this:**

```typescript
// Fetches N people (1 query)
const people = await db.selectFrom('person').selectAll().execute()

// Fetches pets for each person (N queries!)
for (const person of people) {
  person.pets = await db.selectFrom('pet')
    .selectAll()
    .where('owner_id', '=', person.id)
    .execute()
}
```

## Solutions

### 1. Using Joins (Best for 1:1 or 1:N with flattening)

✅ **Do this for simple relationships:**

```typescript
const result = await db
  .selectFrom('person')
  .leftJoin('pet', 'pet.owner_id', 'person.id')
  .select([
    'person.id as person_id',
    'person.first_name',
    'pet.id as pet_id',
    'pet.name as pet_name'
  ])
  .execute()
```

### 2. Batch Fetching (Using `IN` clause)

✅ **Do this when you need to fetch distinct objects:**

```typescript
const people = await db.selectFrom('person').selectAll().execute()
const personIds = people.map(p => p.id)

const pets = await db.selectFrom('pet')
  .selectAll()
  .where('owner_id', 'in', personIds)
  .execute()

// Then map pets to people in memory
const peopleWithPets = people.map(person => ({
  ...person,
  pets: pets.filter(pet => pet.owner_id === person.id)
}))
```

### 3. Using Subqueries and JSON (PostgreSQL specific)

✅ **Most powerful for nested results:**

```typescript
const peopleWithPets = await db.selectFrom('person')
  .select((eb) => [
    'id',
    'first_name',
    eb.selectFrom('pet')
      .selectAll()
      .whereRef('pet.owner_id', '=', 'person.id')
      .as('pets')
  ])
  .execute()
```

*(Note: Kysely will handle the nested selection properly if the dialect supports it)*

## Summary

- Use **JOINS** for flat, performant data.
- Use **BATCHING** for large datasets where you want to keep models separate.
- Use **NESTED SELECTS** for hierarchical data (PostgreSQL/MySQL 8+).
