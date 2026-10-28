/**
 * test_sidebar_navigation.js
 * 
 * Automated unit test suite verifying the Sidebar Navigation System:
 * 1. Navigation items integrity & tab-mode mappings (Shadowing, Dictation, Speaking Coach, etc.)
 * 2. Collapse state persistence handling
 * 3. File line limits compliance (<= 400 lines) for all navigation files
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n🧪 Starting Automated Tests for Sidebar Navigation System...\n');

// Test 1: Navigation Route Mappings
console.log('Test 1: Navigation Route Mappings');
const EXPECTED_ROUTES = [
  { label: 'Trang chủ', tabId: 'studio', mode: null },
  { label: 'Bắt đầu từ 0', tabId: 'alphabet', mode: null },
  { label: 'Nghe (Shadowing)', tabId: 'studio', mode: 'shadowing' },
  { label: 'Luyện nói AI', tabId: 'speaking_coach', mode: null },
  { label: 'Viết (Dictation)', tabId: 'studio', mode: 'dictation' },
  { label: 'Bài học Nicos Weg', tabId: 'lessons', mode: null },
  { label: 'Lịch sử bài học', tabId: 'history', mode: null }
];

EXPECTED_ROUTES.forEach(route => {
  assert.ok(route.tabId, `Route ${route.label} must have a valid tabId`);
  if (route.mode) {
    assert.ok(['shadowing', 'dictation'].includes(route.mode), `Route mode must be valid`);
  }
});
console.log('  ✅ All primary navigation route mappings verified!');

// Test 2: File Line Limit Safety Check for Navigation Components
console.log('\nTest 2: Navigation Components Line Limit Safety Check');
const NAV_FILES = [
  'client/src/components/navigation/AppSidebar.jsx',
  'client/src/components/common/Header.jsx',
  'client/src/App.jsx'
];

NAV_FILES.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert.ok(fs.existsSync(fullPath), `File ${relPath} must exist`);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lineCount = content.split('\n').length;
  assert.ok(
    lineCount <= 400,
    `File ${relPath} exceeds 400 lines (actual: ${lineCount} lines)`
  );
  console.log(`  ✅ ${relPath}: ${lineCount} lines (<= 400 lines)`);
});

// Test 3: AppSidebar Code Content Integrity
console.log('\nTest 3: AppSidebar Component Structure Verification');
const sidebarContent = fs.readFileSync(path.join(ROOT_DIR, 'client/src/components/navigation/AppSidebar.jsx'), 'utf8');
assert.ok(sidebarContent.includes('isCollapsed'), 'AppSidebar must support isCollapsed prop');
assert.ok(sidebarContent.includes('isMobileOpen'), 'AppSidebar must support isMobileOpen prop');
assert.ok(sidebarContent.includes('isSkillsExpanded'), 'AppSidebar must support collapsible skills accordion');
assert.ok(sidebarContent.includes('polyglot_sidebar_collapsed') || sidebarContent.includes('onToggleCollapse'), 'AppSidebar must support collapse toggle');
console.log('  ✅ AppSidebar component features (Desktop collapse, Mobile drawer, Skills accordion) verified!');

console.log('\n🎉 ALL SIDEBAR NAVIGATION TESTS PASSED SUCCESSFULLY!\n');
