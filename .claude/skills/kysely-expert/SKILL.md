---
name: kysely-expert
description: Master Kysely (TypeScript SQL query builder) with database design best practices. Covers complex queries, joins, subqueries, type safety, migrations, and performance optimization.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Kysely Expert

> **Learn to build TYPE-SAFE SQL, not just any query.**

---

## 🔧 Runtime Scripts

**Execute esses scripts para inspecionar a documentação (não leia, apenas execute):**

| Script | Propósito | Uso |
|--------|-----------|-----|
| `scripts/inspect.cjs` | Buscar termos e ler docs do Kysely | `node scripts/inspect.cjs <comando> [args]` |

**Comandos do inspect.cjs:**

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `list-docs` | Lista todos os arquivos disponíveis | `node scripts/inspect.cjs list-docs` |
| `summary` | Exibe o resumo consolidado do Kysely | `node scripts/inspect.cjs summary` |
| `search <termo>` | Busca em todos os docs específicos | `node scripts/inspect.cjs search "json_agg"` |
| `search <termo> best-practices` | Busca somente nas best practices | `node scripts/inspect.cjs search "N+1" best-practices` |
| `search <termo> full` | Busca na documentação completa (fallback) | `node scripts/inspect.cjs search "merge" full` |
| `read <arquivo>` | Lê um arquivo específico | `node scripts/inspect.cjs read select.md` |
| `read full` | Lê a documentação completa | `node scripts/inspect.cjs read full` |
| `read resume` | Lê o resumo da documentação | `node scripts/inspect.cjs read resume` |

> **Regra:** Sempre use o script para buscar antes de assumir qualquer comportamento do Kysely. A busca padrão (`search <termo>`) já exclui a `full-docs-kysely.md` para ser mais rápida. Use `search <termo> full` apenas como último recurso.

---

## 📂 Mapa de Documentação

Os documentos estão organizados em `references/docs/` e `references/best-practices/`.

**Leia APENAS os arquivos relevantes ao que está sendo pedido:**

| Arquivo | Descrição | Quando Ler |
|---------|-----------|------------|
| `resume-docs-kysely.md` | Resumo geral com índice de todas as APIs | Orientação geral e overview |
| `getting-started.md` | Dialetos, instalação, configuração inicial | Configurando o Kysely |
| `generating-types.md` | Codegen, definição de interfaces de banco | Definindo schema TypeScript |
| `select.md` | Colunas, aliases, distinct, subselects | Construindo queries SELECT |
| `where.md` | Condições, OR, WHERE IN, subqueries | Filtrando dados |
| `join.md` | Inner, Left, Right joins, joins complexos | Unindo tabelas |
| `mutations.md` | Insert, Update, Delete, Returning | Modificando dados |
| `transactions.md` | Transações controladas, savepoints | Garantindo atomicidade |
| `migrations.md` | Arquivos de migration, execução | Gerenciando mudanças de schema |
| `best-practices/n-plus-one.md` | Evitando N+1 com JOINs e Subqueries | Performance de queries |
| `best-practices/type-safety.md` | Generic helpers, casting, not-null | Aproveitando o TypeScript |
| `full-docs-kysely.md` | Documentação completa (fallback) | Apenas se os docs específicos não cobrirem |

---

## ⚠️ Core Principles

- **Type Safety Above All:** Prefira os métodos nativos do Kysely a strings SQL cruas.
- **SQL-First Thinking:** Entenda o SQL gerado pelo Kysely (sempre verifique o comportamento de `.execute()`).
- **Manual Control:** Kysely NÃO é um ORM; relacionamentos e migrations são gerenciados manualmente.
- **Atomic Changes:** Use transações para updates em múltiplas tabelas.

---

## Decision Checklist

Antes de escrever uma query complexa no Kysely:

- [ ] Os tipos estão corretamente gerados/definidos para as tabelas envolvidas?
- [ ] É um join ou múltiplas subqueries? (Verifique a performance)
- [ ] Preciso usar `.returning()`? (Dependente do dialeto)
- [ ] Considerei o problema N+1 nessa busca?
- [ ] Existe um índice nas colunas de filtro/join?

---

## Anti-Patterns

❌ Usar `selectAll()` quando apenas colunas específicas são necessárias.  
❌ Envolver toda query em uma transação sem motivo.  
❌ Usar `any` ou `unknown` em vez de um schema tipado corretamente.  
❌ Ignorar diferenças de dialeto (ex: `returning` do PostgreSQL vs `insertId` do MySQL).  
❌ Fazer mapeamento de dados no JS que poderia ser feito no SQL (ex: `fn.sum`, `fn.avg`).
