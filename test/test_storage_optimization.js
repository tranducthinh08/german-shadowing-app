/**
 * test_storage_optimization.js
 * 
 * Automated unit test suite verifying Storage Health, Optimization, and Backup/Restore:
 * 1. Storage Health calculation & breakdown percentages
 * 2. 1-Click Backup Export & Schema validation
 * 3. 1-Click Backup Import & Data Restoration
 * 4. Safe Storage Cleanup of orphaned keys & legacy duplicates
 * 5. Code file line limits compliance (<= 400 lines)
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Mock localStorage for Node.js environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  key(index) { return Object.keys(this.store)[index] || null; }
  get length() { return Object.keys(this.store).length; }
}

global.localStorage = new LocalStorageMock();

// Import after setting global.localStorage
const {
  formatBytes,
  getStorageHealth,
  cleanupStorage,
  exportUserBackup,
  importUserBackup
} = await import('../client/src/utils/storageMonitor.js');

const {
  saveUserSettings,
  saveUserSavedVocab,
  saveUserStudyHistory,
  getUserSavedVocab
} = await import('../client/src/utils/userStorage.js');

console.log('\n🧪 Starting Automated Tests for Storage Optimization & Health Engine...\n');

// Test 1: Byte Formatting & Health Metrics Calculation
console.log('Test 1: Byte Formatting & Health Metrics Calculation');
assert.strictEqual(formatBytes(0), '0 B');
assert.strictEqual(formatBytes(512), '512 B');
assert.strictEqual(formatBytes(1536), '1.5 KB');
assert.strictEqual(formatBytes(2097152), '2.00 MB');

const initialHealth = getStorageHealth('test_user');
assert.ok(initialHealth.status === 'optimal', 'Initial storage status must be optimal');
assert.strictEqual(initialHealth.quotaPercent, 0, 'Empty storage must have 0% quota');
console.log('  ✅ Byte formatting and initial health metrics verified!');

// Test 2: Storage Tracking with User Data
console.log('\nTest 2: Storage Tracking with User Data');
const username = 'storage_tester';
saveUserSettings(username, { isBlurScript: false, selectedLang: 'de' });
saveUserSavedVocab(username, [
  { word: 'Guten Tag', translation: 'Xin chào', addedAt: new Date().toISOString() },
  { word: 'Auf Wiedersehen', translation: 'Hẹn gặp lại', addedAt: new Date().toISOString() }
]);
saveUserStudyHistory(username, [
  { videoId: 'SrcZ2ud4T3o', title: 'Nicos Weg Folge 1', completedCount: 5 }
]);

const updatedHealth = getStorageHealth(username);
assert.ok(updatedHealth.totalBytes > 0, 'Total bytes must be greater than 0');
assert.ok(updatedHealth.breakdown.vocab.bytes > 0, 'Vocab bytes must be tracked');
assert.ok(updatedHealth.breakdown.history.bytes > 0, 'History bytes must be tracked');
assert.ok(updatedHealth.breakdown.settings.bytes > 0, 'Settings bytes must be tracked');
console.log(`  ✅ Tracked storage: ${updatedHealth.userFormatted} for user ${username}!`);

// Test 3: 1-Click Backup Export
console.log('\nTest 3: 1-Click Backup Export');
const backupJson = exportUserBackup(username);
assert.ok(typeof backupJson === 'string', 'Export must return a string');
const parsed = JSON.parse(backupJson);
assert.strictEqual(parsed.appName, 'PolyGlot Studio', 'Backup must include appName');
assert.strictEqual(parsed.username, username, 'Backup must include username');
assert.strictEqual(parsed.savedVocab.length, 2, 'Backup must include 2 saved words');
assert.strictEqual(parsed.studyHistory.length, 1, 'Backup must include 1 history entry');
console.log('  ✅ Backup JSON export schema and data verified!');

// Test 4: 1-Click Backup Import & Restoration
console.log('\nTest 4: 1-Click Backup Import & Restoration');
const newUsername = 'restored_user';
const restoreResult = importUserBackup(newUsername, backupJson);
assert.strictEqual(restoreResult.success, true, 'Restore must report success');
assert.strictEqual(restoreResult.vocabCount, 2, 'Restored vocab count must match');
assert.strictEqual(restoreResult.historyCount, 1, 'Restored history count must match');

const restoredVocab = getUserSavedVocab(newUsername);
assert.strictEqual(restoredVocab.length, 2, 'Restored user must have 2 vocab words');
assert.strictEqual(restoredVocab[0].word, 'Guten Tag', 'Restored word must match original');
console.log('  ✅ Backup JSON import and data restoration verified!');

// Test 5: Safe Storage Cleanup (Orphaned Progress & Legacy Keys)
console.log('\nTest 5: Safe Storage Cleanup (Orphaned Progress & Legacy Keys)');
// Inject legacy keys and orphaned completed progress
localStorage.setItem('polyglot_study_history', JSON.stringify([{ videoId: 'old1' }]));
localStorage.setItem(`polyglot_user_${username}_completed_orphaned_vid`, JSON.stringify(['s1', 's2']));

const cleanupResult = cleanupStorage(username);
assert.ok(cleanupResult.freedBytes > 0, 'Cleanup must free bytes from orphaned keys');
assert.ok(cleanupResult.cleanedKeys >= 2, 'Cleanup must remove at least 2 keys');
assert.strictEqual(localStorage.getItem('polyglot_study_history'), null, 'Legacy key must be removed');
assert.strictEqual(localStorage.getItem(`polyglot_user_${username}_completed_orphaned_vid`), null, 'Orphaned progress must be removed');
console.log(`  ✅ Cleanup freed ${cleanupResult.freedFormatted} across ${cleanupResult.cleanedKeys} keys!`);

// Test 6: Line Limit Safety Check for Storage Components
console.log('\nTest 6: Line Limit Safety Check for Storage Components');
const FILES_TO_CHECK = [
  'client/src/utils/storageMonitor.js',
  'client/src/components/user/UserStorageTab.jsx',
  'scripts/monitor-bundle.js'
];

FILES_TO_CHECK.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert.ok(fs.existsSync(fullPath), `File ${relPath} must exist`);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n').length;
  assert.ok(lines <= 400, `${relPath} exceeds 400 lines (actual: ${lines})`);
  console.log(`  ✅ ${relPath}: ${lines} lines (<= 400 lines)`);
});

console.log('\n🎉 ALL STORAGE OPTIMIZATION & HEALTH TESTS PASSED SUCCESSFULLY!\n');
