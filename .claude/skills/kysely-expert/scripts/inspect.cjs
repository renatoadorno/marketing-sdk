#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REFS_DIR = path.join(__dirname, '../references');
const DOCS_DIR = path.join(REFS_DIR, 'docs');
const BEST_PRACTICES_DIR = path.join(REFS_DIR, 'best-practices');
const FULL_DOCS_PATH = path.join(DOCS_DIR, 'full-docs-kysely.md');
const RESUME_DOCS_PATH = path.join(DOCS_DIR, 'resume-docs-kysely.md');

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

if (!command) {
  console.log(`Uso: node scripts/inspect.cjs <comando> [args]

Comandos disponíveis:
  list-docs                     Lista todos os arquivos de documentação disponíveis (docs + best-practices)
  summary                       Exibe o resumo consolidado do Kysely (resume-docs-kysely.md)
  search <termo> [fonte]        Busca um termo em todos os docs. Fonte: 'full', 'resume', 'docs', 'best-practices' ou omita para buscar em tudo.
  read <nome-do-arquivo>        Lê o conteúdo de um arquivo específico (ex: select.md, best-practices/type-safety.md, full, resume)
  `);
  process.exit(1);
}

// --- Helpers ---

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function getAllFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const stat = fs.statSync(path.join(dir, entry.name));
      results.push({ name: entry.name, fullPath: path.join(dir, entry.name), size: stat.size });
    }
  }
  return results;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// --- Commands ---

function listDocs() {
  const docFiles = getAllFiles(DOCS_DIR).filter(f => f.name !== 'full-docs-kysely.md');
  const bpFiles = getAllFiles(BEST_PRACTICES_DIR);

  console.log('\n📁 Docs Específicos (references/docs/):');
  docFiles.forEach(f => {
    const prefix = f.name.startsWith('resume') ? '  📋' : '  📄';
    console.log(`${prefix} ${f.name} (${formatSize(f.size)})`);
  });

  if (bpFiles.length > 0) {
    console.log('\n📁 Best Practices (references/best-practices/):');
    bpFiles.forEach(f => console.log(`  ✅ ${f.name} (${formatSize(f.size)})`));
  }

  console.log('\n📄 Documentação Completa:');
  if (fs.existsSync(FULL_DOCS_PATH)) console.log(`  � full-docs-kysely.md (${formatSize(fs.statSync(FULL_DOCS_PATH).size)}) -- Use apenas como fallback`);
}

function showSummary() {
  const content = readFile(RESUME_DOCS_PATH);
  console.log(`--- Resumo: Kysely (resume-docs-kysely.md) ---\n`);
  console.log(content);
}

function search(term, source) {
  if (!term) {
    console.log('Erro: Termo de busca não fornecido.');
    process.exit(1);
  }

  const matches = [];
  const termLower = term.toLowerCase();
  const filesToSearch = [];

  if (!source || source === 'docs' || source === 'resume') {
    const docsFiles = getAllFiles(DOCS_DIR).filter(f => {
      if (source === 'resume') return f.name === 'resume-docs-kysely.md';
      if (source === 'docs') return f.name !== 'full-docs-kysely.md'; // docs específicos
      return f.name !== 'full-docs-kysely.md'; // por padrão exclui full (muito grande)
    });
    docsFiles.forEach(f => filesToSearch.push({ label: `docs/${f.name}`, path: f.fullPath }));
  }

  if (!source || source === 'best-practices') {
    const bpFiles = getAllFiles(BEST_PRACTICES_DIR);
    bpFiles.forEach(f => filesToSearch.push({ label: `best-practices/${f.name}`, path: f.fullPath }));
  }

  if (source === 'full') {
    filesToSearch.push({ label: 'docs/full-docs-kysely.md', path: FULL_DOCS_PATH });
  }

  for (const fileConf of filesToSearch) {
    if (!fs.existsSync(fileConf.path)) continue;
    const content = fs.readFileSync(fileConf.path, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(termLower)) {
        matches.push({
          file: fileConf.label,
          line: index + 1,
          content: line.trim().substring(0, 150),
        });
      }
    });
  }

  if (matches.length > 0) {
    const total = matches.length;
    console.log(`Resultados para '${term}' (${Math.min(total, 60)} de ${total}):\n`);
    matches.slice(0, 60).forEach(m => {
      console.log(`  [${m.file}] linha ${m.line}:`);
      console.log(`    ${m.content}`);
    });

    if (total > 60) {
      console.log(`\n... e mais ${total - 60} resultados. Use a fonte 'full' para buscar na doc completa.`);
    }
  } else {
    console.log(`Nenhum resultado para '${term}'. Tente buscar na doc completa: search ${term} full`);
  }
}

function readSource(source) {
  if (source === 'full') {
    console.log(readFile(FULL_DOCS_PATH));
    return;
  }
  if (source === 'resume') {
    console.log(readFile(RESUME_DOCS_PATH));
    return;
  }

  // Tentar carregar como nome de arquivo dentro de docs/ ou best-practices/
  const tryPaths = [
    path.join(DOCS_DIR, source),
    path.join(BEST_PRACTICES_DIR, source),
    path.join(DOCS_DIR, `${source}.md`),
    path.join(BEST_PRACTICES_DIR, `${source}.md`),
  ];

  for (const p of tryPaths) {
    if (fs.existsSync(p)) {
      console.log(fs.readFileSync(p, 'utf8'));
      return;
    }
  }

  console.log(`Arquivo não encontrado: '${source}'. Use 'list-docs' para ver o que está disponível.`);
  process.exit(1);
}

// --- Router ---

switch (command) {
  case 'list-docs':
    listDocs();
    break;
  case 'summary':
    showSummary();
    break;
  case 'search':
    search(param, args[2]);
    break;
  case 'read':
    if (!param) {
      console.log('Erro: Especifique o arquivo. Ex: read select.md | read full | read resume | read best-practices/type-safety.md');
      process.exit(1);
    }
    readSource(param);
    break;
  default:
    console.log(`Comando desconhecido: '${command}'\nExecute sem argumentos para ver a ajuda.`);
    process.exit(1);
}
