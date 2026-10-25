import assert from 'assert';
import { calculateLevel, LEVELS, ALL_BADGES } from '../client/src/utils/gamification.js';

console.log('🧪 Starting Tests for Gamification Engine...\n');

// 1. Test Levels & XP Calculation
console.log('Test 1: Level & XP Calculation');
const l1 = calculateLevel(0);
assert.strictEqual(l1.level, 1, 'Initial XP 0 should be Level 1');
assert.strictEqual(l1.title, 'Khởi đầu mới');
console.log('  ✅ Level 1 verified');

const l2 = calculateLevel(60);
assert.strictEqual(l2.level, 2, 'XP 60 should be Level 2');
assert.strictEqual(l2.title, 'Tập sự ngoại ngữ');
console.log('  ✅ Level 2 verified (60 XP)');

const lMax = calculateLevel(4000);
assert.strictEqual(lMax.level, 10, 'XP 4000 should reach Level 10');
assert.strictEqual(lMax.title, 'Huyền thoại PolyGlot');
console.log('  ✅ Level 10 Legend verified');

// 2. Test Badges Definition Integrity
console.log('\nTest 2: Achievement Badges Integrity');
assert(ALL_BADGES.length >= 8, 'Expected at least 8 badges');
assert(ALL_BADGES.some(b => b.id === 'first_sentence'));
assert(ALL_BADGES.some(b => b.id === 'streak_3'));
assert(ALL_BADGES.some(b => b.id === 'perfect_score'));
console.log('  ✅ All achievement badges definitions verified');

console.log('\n🎉 ALL GAMIFICATION TESTS PASSED SUCCESSFULLY!\n');
