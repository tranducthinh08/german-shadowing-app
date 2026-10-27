#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../..');

console.log('🔍 [PolyGlot QA] Đang thực thi toàn bộ 6 bộ kiểm thử tự động...');
const startTime = Date.now();

const testSuites = [
  { name: 'Core & Diff Algorithm', file: 'test/test_core.js' },
  { name: 'German Grammar & Gender', file: 'test/test_grammar.js' },
  { name: 'Gamification Engine', file: 'test/test_gamification.js' },
  { name: 'Multi-User Storage Isolation', file: 'test/test_user_storage.js' },
  { name: 'Nicos Weg Playlist Curriculum', file: 'test/test_playlist.js' },
  { name: 'Alphabet & Daily Review', file: 'test/test_alphabet.js' }
];

let allPassed = true;
const results = [];

for (const suite of testSuites) {
  process.stdout.write(`  ⏳ Đang chạy: ${suite.name.padEnd(32)} `);
  try {
    execSync(`node ${suite.file}`, { cwd: rootDir, stdio: 'pipe' });
    console.log('✅ PASS');
    results.push({ name: suite.name, passed: true });
  } catch (error) {
    console.log('❌ FAILED');
    results.push({ 
      name: suite.name, 
      passed: false, 
      error: error.stderr ? error.stderr.toString() : error.stdout.toString() 
    });
    allPassed = false;
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);
console.log('\n------------------------------------------------------------');
if (allPassed) {
  console.log(`🎉 [PolyGlot QA] TẤT CẢ 6/6 BỘ TEST ĐÃ VƯỢT QUA (${duration}s)`);
  console.log('🚀 Toàn bộ chức năng lõi và dữ liệu đã được bảo đảm toàn vẹn!');
  process.exit(0);
} else {
  console.error(`💥 [PolyGlot QA] PHÁT HIỆN LỖI HỒI QUY! (${duration}s)`);
  results.filter(r => !r.passed).forEach(r => {
    console.error(`\n[Lỗi tại ${r.name}]:\n${r.error}`);
  });
  process.exit(1);
}
