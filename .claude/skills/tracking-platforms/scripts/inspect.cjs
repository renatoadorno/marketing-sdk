#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REFS_DIR = path.join(__dirname, '../references');
const PLATFORMS = ['google', 'facebook', 'spotify'];

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];
const param2 = args[2];

if (!command) {
  console.log(`Uso: node inspect.cjs <comando> [args]

Comandos disponíveis:
  list-files [plataforma]       Lista todos os arquivos de referência (ou de uma plataforma)
  summary <plataforma>          Exibe o resumo consolidado de uma plataforma (google|facebook|spotify)
  search <termo> [plataforma]   Busca um termo em todos os arquivos (ou em uma plataforma)
  events                        Exibe o mapa de equivalência de eventos entre plataformas
  compare <aspecto>             Compara um aspecto específico (dedup|auth|userdata|limits|structure)
  interfaces [plataforma]       Lista as interfaces TypeScript disponíveis
  read <caminho-relativo>       Exibe o conteúdo de um arquivo específico
  `);
  process.exit(1);
}

// --- Helpers ---

function getAllFiles(dir, basePath = '') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...getAllFiles(path.join(dir, entry.name), relPath));
    } else {
      const stat = fs.statSync(path.join(dir, entry.name));
      results.push({ path: relPath, size: stat.size });
    }
  }
  return results;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function readFile(filePath) {
  const fullPath = path.join(REFS_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

// --- Commands ---

function listFiles(platform) {
  const dirs = platform ? [platform] : [...PLATFORMS, '.'];
  
  for (const dir of dirs) {
    const targetDir = dir === '.' ? REFS_DIR : path.join(REFS_DIR, dir);
    const label = dir === '.' ? 'Raiz' : dir.toUpperCase();
    const files = getAllFiles(targetDir);
    
    if (files.length === 0) continue;
    
    if (dir !== '.') {
      const rootFiles = files.filter(f => !f.path.includes('/'));
      if (rootFiles.length > 0) {
        console.log(`\n📁 ${label}:`);
        rootFiles.forEach(f => {
          const prefix = f.path.startsWith('resumo-') ? '  📋' : '  📄';
          console.log(`${prefix} ${f.path} (${formatSize(f.size)})`);
        });
      }
    } else {
      const rootFiles = fs.readdirSync(REFS_DIR)
        .filter(f => fs.statSync(path.join(REFS_DIR, f)).isFile());
      if (rootFiles.length > 0) {
        console.log(`\n📁 RAIZ:`);
        rootFiles.forEach(f => {
          const stat = fs.statSync(path.join(REFS_DIR, f));
          console.log(`  📋 ${f} (${formatSize(stat.size)})`);
        });
      }
    }
  }

  // Interfaces
  if (!platform || platform === 'interfaces') {
    const intDir = path.join(REFS_DIR, 'interfaces');
    if (fs.existsSync(intDir)) {
      console.log(`\n📁 INTERFACES (TypeScript):`);
      const files = getAllFiles(intDir);
      files.forEach(f => console.log(`  🔷 ${f.path} (${formatSize(f.size)})`));
    }
  }
}

function showSummary(platform) {
  if (!platform || !PLATFORMS.includes(platform)) {
    console.log(`Erro: Plataforma inválida. Use: ${PLATFORMS.join(' | ')}`);
    process.exit(1);
  }

  const summaryFiles = {
    google: 'google/resumo-google-analytics.md',
    facebook: 'facebook/resumo-facebook.md',
    spotify: 'spotify/resumo-spotify.md',
  };

  const filePath = summaryFiles[platform];
  const content = readFile(filePath);
  console.log(`--- Resumo: ${platform.toUpperCase()} ---\n`);
  console.log(content);
}

function search(term, platform) {
  if (!term) {
    console.log('Erro: Termo de busca não fornecido.');
    process.exit(1);
  }

  const dirs = platform ? [platform] : [...PLATFORMS, '.'];
  const matches = [];
  const termLower = term.toLowerCase();

  for (const dir of dirs) {
    const targetDir = dir === '.' ? REFS_DIR : path.join(REFS_DIR, dir);
    
    // Buscar em arquivos do diretório (não recursivo para '.')
    const filesToSearch = dir === '.'
      ? fs.readdirSync(targetDir).filter(f => fs.statSync(path.join(targetDir, f)).isFile())
      : getAllFiles(targetDir).map(f => f.path);

    for (const file of filesToSearch) {
      const filePath = dir === '.' ? file : `${dir}/${file}`;
      const fullPath = path.join(REFS_DIR, filePath);
      
      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(termLower)) {
          matches.push({
            file: filePath,
            line: index + 1,
            content: line.trim().substring(0, 120),
          });
        }
      });
    }
  }

  // Also search interfaces
  const intDir = path.join(REFS_DIR, 'interfaces');
  if (fs.existsSync(intDir)) {
    const intFiles = getAllFiles(intDir);
    for (const file of intFiles) {
      const fullPath = path.join(intDir, file.path);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(termLower)) {
          matches.push({
            file: `interfaces/${file.path}`,
            line: index + 1,
            content: line.trim().substring(0, 120),
          });
        }
      });
    }
  }

  if (matches.length > 0) {
    console.log(`Resultados para '${term}' (${Math.min(matches.length, 50)} de ${matches.length}):\n`);
    matches.slice(0, 50).forEach(m => {
      console.log(`  ${m.file}:${m.line}`);
      console.log(`    ${m.content}`);
    });
  } else {
    console.log(`Nenhum resultado encontrado para '${term}'.`);
  }
}

function showEvents() {
  const content = readFile('analise-comparativa.md');
  
  // Extrair a seção de eventos
  const eventSection = content.match(/## 2\. Eventos.*?(?=\n## \d)/s);
  if (eventSection) {
    console.log('--- Mapa de Equivalência de Eventos ---\n');
    console.log(eventSection[0].trim());
  } else {
    console.log('Seção de eventos não encontrada.');
  }
}

function compare(aspect) {
  const content = readFile('analise-comparativa.md');
  
  const sectionMap = {
    dedup: /## 6\. Deduplicação.*?(?=\n## \d)/s,
    auth: /### Request Body Comparado.*?(?=\n### Campos Obrigatórios)/s,
    userdata: /## 4\. Dados do Usuário.*?(?=\n## \d)/s,
    limits: /## 8\. Limitações.*?(?=\n## \d)/s,
    structure: /## 5\. Estrutura de Request.*?(?=\n## \d)/s,
    params: /## 3\. Parâmetros de Evento.*?(?=\n## \d)/s,
    custom: /## 7\. Eventos Personalizados.*?(?=\n## \d)/s,
  };

  if (!aspect || !sectionMap[aspect]) {
    console.log(`Erro: Aspecto inválido. Use: ${Object.keys(sectionMap).join(' | ')}`);
    process.exit(1);
  }

  const match = content.match(sectionMap[aspect]);
  if (match) {
    console.log(match[0].trim());
  } else {
    console.log(`Seção '${aspect}' não encontrada na análise comparativa.`);
  }
}

function listInterfaces(platform) {
  const intDir = path.join(REFS_DIR, 'interfaces');
  if (!fs.existsSync(intDir)) {
    console.log('Diretório de interfaces não encontrado.');
    return;
  }

  const dirs = platform ? [platform] : PLATFORMS;
  
  for (const dir of dirs) {
    const targetDir = path.join(intDir, dir);
    if (!fs.existsSync(targetDir)) continue;
    
    console.log(`\n🔷 ${dir.toUpperCase()} Interfaces:`);
    const files = fs.readdirSync(targetDir);
    for (const file of files) {
      const content = fs.readFileSync(path.join(targetDir, file), 'utf8');
      // Extrair nomes das interfaces/types
      const interfaces = [...content.matchAll(/(?:export\s+)?(?:interface|type)\s+(\w+)/g)].map(m => m[1]);
      console.log(`  📄 ${file}: ${interfaces.join(', ') || '(sem interfaces exportadas)'}`);
    }
  }
}

function readRefFile(filePath) {
  console.log(readFile(filePath));
}

// --- Router ---

switch (command) {
  case 'list-files':
    listFiles(param);
    break;
  case 'summary':
    showSummary(param);
    break;
  case 'search':
    search(param, param2);
    break;
  case 'events':
    showEvents();
    break;
  case 'compare':
    compare(param);
    break;
  case 'interfaces':
    listInterfaces(param);
    break;
  case 'read':
    if (!param) {
      console.log('Erro: Caminho do arquivo não fornecido.');
      process.exit(1);
    }
    readRefFile(param);
    break;
  default:
    console.log(`Comando desconhecido: '${command}'`);
    process.exit(1);
}
