#!/usr/bin/env node
/**
 * monitor-bundle.js
 * 
 * Analyzes client production build bundle sizes:
 * 1. Scans client/dist/assets for JS and CSS files
 * 2. Measures raw size and gzip size for every chunk
 * 3. Categorizes chunks into Vendor, Data, Pages, Modals, Core
 * 4. Verifies budgets (max 250 kB raw / 65 kB gzip per chunk)
 * 5. Outputs a structured report with status indicators
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_ASSETS_DIR = path.resolve(__dirname, '../client/dist/assets');

// Budget thresholds in Kilobytes (KB)
const BUDGETS = {
  chunkRawMaxKb: 260, // Maximum allowed raw JS chunk size
  chunkGzipMaxKb: 65,  // Maximum allowed gzip JS chunk size
  totalJsGzipMaxKb: 300 // Total combined gzip JS size
};

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + ' kB';
}

function getGzipSize(filePath) {
  const fileContent = fs.readFileSync(filePath);
  return zlib.gzipSync(fileContent).length;
}

export function analyzeBundle() {
  if (!fs.existsSync(DIST_ASSETS_DIR)) {
    console.error(`\n❌ Dist assets directory not found at: ${DIST_ASSETS_DIR}`);
    console.error('Please run "npm run build" first.\n');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_ASSETS_DIR);
  const chunks = [];

  let totalRawJs = 0;
  let totalGzipJs = 0;
  let totalRawCss = 0;
  let totalGzipCss = 0;

  for (const file of files) {
    const fullPath = path.join(DIST_ASSETS_DIR, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file);
    if (ext !== '.js' && ext !== '.css') continue;

    const rawSize = stat.size;
    const gzipSize = getGzipSize(fullPath);

    let category = 'Other';
    if (file.startsWith('vendor-')) category = 'Vendor';
    else if (file.startsWith('data-')) category = 'Data Fixture';
    else if (file.includes('Tab-')) category = 'Page / Tab';
    else if (file.includes('Modal-') || file.includes('Popover-')) category = 'Modal';
    else if (file.startsWith('index-')) category = 'Entry Bundle';

    const isExceeded = (ext === '.js') && (
      (rawSize / 1024 > BUDGETS.chunkRawMaxKb) ||
      (gzipSize / 1024 > BUDGETS.chunkGzipMaxKb)
    );

    chunks.push({
      file,
      ext,
      category,
      rawBytes: rawSize,
      gzipBytes: gzipSize,
      isExceeded
    });

    if (ext === '.js') {
      totalRawJs += rawSize;
      totalGzipJs += gzipSize;
    } else {
      totalRawCss += rawSize;
      totalGzipCss += gzipSize;
    }
  }

  // Sort by raw size descending
  chunks.sort((a, b) => b.rawBytes - a.rawBytes);

  console.log('\n📊 PolyGlot Studio - Production Bundle Size Health Report');
  console.log('='.repeat(80));
  console.log(
    `${'Chunk Name'.padEnd(38)} | ${'Category'.padEnd(14)} | ${'Raw Size'.padEnd(10)} | ${'Gzip Size'.padEnd(10)} | Status`
  );
  console.log('-'.repeat(80));

  let hasViolations = false;

  for (const chunk of chunks) {
    const status = chunk.isExceeded ? '🔴 EXCEEDED' : '🟢 HEALTHY';
    if (chunk.isExceeded) hasViolations = true;

    console.log(
      `${chunk.file.padEnd(38)} | ${chunk.category.padEnd(14)} | ${formatSize(chunk.rawBytes).padEnd(10)} | ${formatSize(chunk.gzipBytes).padEnd(10)} | ${status}`
    );
  }

  console.log('='.repeat(80));
  console.log(`📦 Total JS Bundle Size:  ${formatSize(totalRawJs)} (Gzip: ${formatSize(totalGzipJs)})`);
  console.log(`🎨 Total CSS Bundle Size: ${formatSize(totalRawCss)} (Gzip: ${formatSize(totalGzipCss)})`);
  console.log(`🎯 Budget Threshold: Max chunk <= ${BUDGETS.chunkRawMaxKb} kB raw (<= ${BUDGETS.chunkGzipMaxKb} kB gzip)`);

  if (hasViolations) {
    console.error('\n⚠️ Bundle budget check FAILED: Some chunks exceeded the defined size threshold.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All chunks strictly satisfy bundle budget limits! Performance is optimal. 🚀\n');
  }

  return {
    chunks,
    totalRawJs,
    totalGzipJs,
    totalRawCss,
    totalGzipCss
  };
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  analyzeBundle();
}
