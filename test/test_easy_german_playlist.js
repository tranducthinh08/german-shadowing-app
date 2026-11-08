import assert from 'assert';
import { EASY_GERMAN_PLAYLIST, EASY_GERMAN_EPISODES_MAP } from '../server/src/data/easyGermanPlaylist.js';
import { ALL_EPISODES_MAP, getEpisodeByVideoId, getCurriculumByVideoId } from '../server/src/data/curriculumRegistry.js';
import { getVideoData, extractVideoId } from '../server/src/services/youtube.service.js';

console.log('🧪 Starting Automated Tests for Easy German A1 Playlist & Curriculum...\n');

// 1. Test Playlist Metadata and Structure Integrity
console.log('Test 1: Playlist Metadata Integrity');
assert.strictEqual(EASY_GERMAN_PLAYLIST.playlistId, 'PLk1fjOl39-50kWobutO8NVFzbw9PHtbbg', 'Playlist ID mismatch');
assert.strictEqual(EASY_GERMAN_PLAYLIST.author, 'Easy German', 'Author mismatch');
assert.strictEqual(EASY_GERMAN_PLAYLIST.level, 'A1', 'Level mismatch');
assert.strictEqual(EASY_GERMAN_PLAYLIST.episodes.length, 10, `Expected 10 episodes in batch 1, got ${EASY_GERMAN_PLAYLIST.episodes.length}`);
assert(EASY_GERMAN_PLAYLIST.totalSentences >= 2000, `Expected >= 2000 sentences, got ${EASY_GERMAN_PLAYLIST.totalSentences}`);
console.log(`  ✅ Easy German playlist verified with ${EASY_GERMAN_PLAYLIST.episodes.length} episodes and ${EASY_GERMAN_PLAYLIST.totalSentences} sentences!`);

// 2. Test Episodes Map & Sentence Segments
console.log('\nTest 2: Episode Video IDs and Sentence Validation');
const expectedIds = [
  'huwi-cjPPXU', 'aRlakaPVrEw', 'eKLtI48rvtw', 'LQiHX6OY_BI', 'hAkxKMlYUI4',
  'r8HiWsBe5ko', 'D91icSuPYQ4', 'Yaelm87PTvg', '9h8p08qziG0', 'o7cMNtORT4I'
];

for (const id of expectedIds) {
  const ep = EASY_GERMAN_EPISODES_MAP[id];
  assert(ep, `Episode not found in map: ${id}`);
  assert.strictEqual(ep.videoId.length, 11, `Invalid videoId length: ${ep.videoId}`);
  assert(ep.sentences && ep.sentences.length > 0, `No sentences for episode: ${id}`);
  assert.strictEqual(ep.author, 'Easy German');
  
  for (const s of ep.sentences.slice(0, 20)) {
    assert(typeof s.id === 'number', 'Invalid sentence id');
    assert(typeof s.start === 'number' && s.start >= 0, `Invalid sentence start: ${s.start}`);
    assert(typeof s.end === 'number' && s.end >= s.start, `Invalid sentence end: ${s.end}`);
    assert(typeof s.text === 'string' && s.text.length > 0, 'Empty sentence text');
    // First character must be uppercase
    const firstChar = s.text.trim()[0];
    assert.strictEqual(firstChar, firstChar.toUpperCase(), `Sentence does not start with uppercase: ${s.text}`);
  }
}
console.log(`  ✅ All 10 episodes verified with valid millisecond timestamps and clean German sentences!`);

// 3. Test Curriculum Registry Resolver
console.log('\nTest 3: Curriculum Registry Resolution');
for (const id of expectedIds) {
  const resolvedEp = getEpisodeByVideoId(id);
  assert(resolvedEp, `Registry failed to resolve: ${id}`);
  assert.strictEqual(resolvedEp.videoId, id);

  const curr = getCurriculumByVideoId(id);
  assert(curr, `Curriculum failed to resolve: ${id}`);
  assert.strictEqual(curr.id, 'easy_german');
  assert.strictEqual(curr.playlistId, 'PLk1fjOl39-50kWobutO8NVFzbw9PHtbbg');
}
console.log('  ✅ Curriculum Registry resolves Easy German episodes seamlessly!');

// 4. Test YouTube Service Pre-indexed Resolver
console.log('\nTest 4: YouTube Service Instant Pre-indexed Resolver');
async function testService() {
  // Test by full URL with playlist parameter
  const testUrl = 'https://www.youtube.com/watch?v=huwi-cjPPXU&list=PLk1fjOl39-50kWobutO8NVFzbw9PHtbbg';
  const resUrl = await getVideoData(testUrl, 'de');
  assert.strictEqual(resUrl.videoId, 'huwi-cjPPXU');
  assert.strictEqual(resUrl.isSample, true);
  assert.strictEqual(resUrl.author, 'Easy German');
  assert(resUrl.sentences.length > 100, 'Expected >100 sentences for Episode 1');
  assert.strictEqual(resUrl.playlistInfo.playlistId, 'PLk1fjOl39-50kWobutO8NVFzbw9PHtbbg');
  assert.strictEqual(resUrl.playlistInfo.episodeNumber, 1);

  // Test by direct video ID
  const resDirect = await getVideoData('o7cMNtORT4I', 'de');
  assert.strictEqual(resDirect.videoId, 'o7cMNtORT4I');
  assert.strictEqual(resDirect.isSample, true);
  assert.strictEqual(resDirect.playlistInfo.episodeNumber, 10);
  assert(resDirect.sentences.length > 0);

  console.log('  ✅ YouTube Service pre-indexes Easy German URLs with zero network latency!');
  console.log('\n🎉 ALL EASY GERMAN PLAYLIST TESTS PASSED SUCCESSFULLY!\n');
}

testService().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
