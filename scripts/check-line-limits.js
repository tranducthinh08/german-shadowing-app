#!/usr/bin/env node
/**
 * check-line-limits.js
 * 
 * Enforces a strict line count limit (default: 400 lines) for all code files
 * in client/src, server/src, api, and test directories.
 * 
 * Ignores:
 * - node_modules, dist, .git
 * - Pure static dataset fixtures in src/data/ (e.g. nicosWegPlaylist.js, germanAlphabetData.js)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const MAX_LINES = 400;

// Directories to scan
const TARGET_DIRS = [
  'client/src',
  'server/src',
  'api',
  'test'
];

// File extensions to check
const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

// Whitelisted pure static dataset fixtures (not code logic)
const WHITELISTED_FILES = new Set([
  'client/src/data/nicosWegPlaylist.js',
  'server/src/data/nicosWegPlaylist.js',
  'client/src/data/germanAlphabetData.js'
]);

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && !file.startsWith('.')) {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content) return 0;
  return content.split(/\r\n|\r|\n/).length;
}

function runCheck() {
  console.log(`\n🔍 Checking code file line limits (Max: ${MAX_LINES} lines per file)...\n`);

  let totalFilesScanned = 0;
  const violations = [];
  const compliantFiles = [];

  for (const relDir of TARGET_DIRS) {
    const fullDir = path.join(ROOT_DIR, relDir);
    const files = getAllFiles(fullDir);

    for (const filePath of files) {
      const ext = path.extname(filePath);
      if (!CODE_EXTENSIONS.has(ext)) continue;

      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      // Check if file is whitelisted dataset fixture
      if (WHITELISTED_FILES.has(relativePath)) {
        continue;
      }

      totalFilesScanned++;
      const lines = countLines(filePath);

      if (lines > MAX_LINES) {
        violations.push({ path: relativePath, lines });
      } else {
        compliantFiles.push({ path: relativePath, lines });
      }
    }
  }

  console.log(`📊 Scanned ${totalFilesScanned} source code files.\n`);

  if (violations.length > 0) {
    console.error(`❌ VIOLATION: Found ${violations.length} file(s) exceeding ${MAX_LINES} lines:\n`);
    violations
      .sort((a, b) => b.lines - a.lines)
      .forEach(v => {
        console.error(`  - \x1b[31m${v.path}\x1b[0m: \x1b[1m${v.lines}\x1b[0m lines (exceeds by +${v.lines - MAX_LINES})`);
      });
    console.error(`\nPlease refactor these files into sub-components, custom hooks, or utility modules.\n`);
    process.exit(1);
  }

  console.log(`✅ All ${totalFilesScanned} code files strictly satisfy the limit of <= ${MAX_LINES} lines! 🎉\n`);
  process.exit(0);
}

runCheck();
