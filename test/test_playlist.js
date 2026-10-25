import assert from 'assert';
import { NICOS_WEG_PLAYLIST, NICOS_WEG_EPISODES_MAP } from '../server/src/data/nicosWegPlaylist.js';
import { getVideoData, extractVideoId } from '../server/src/services/youtube.service.js';

console.log('🧪 Starting Automated Tests for Nicos Weg A1 Playlist & Curriculum...\n');

// 1. Test Playlist Structure and Metadata Integrity
console.log('Test 1: Playlist Integrity');
assert.strictEqual(NICOS_WEG_PLAYLIST.playlistId, 'PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix', 'Playlist ID mismatch');
assert.strictEqual(NICOS_WEG_PLAYLIST.episodes.length, 80, `Expected 80 episodes, got ${NICOS_WEG_PLAYLIST.episodes.length}`);
assert(NICOS_WEG_PLAYLIST.totalSentences > 2400, `Expected >2400 sentences, got ${NICOS_WEG_PLAYLIST.totalSentences}`);
console.log(`  ✅ Playlist has ${NICOS_WEG_PLAYLIST.episodes.length} episodes and ${NICOS_WEG_PLAYLIST.totalSentences} sentences!`);

// 2. Test Episodes Map & Video IDs
console.log('\nTest 2: Episode Video IDs and Sentence Validation');
const sampleIds = ['SrcZ2ud4T3o', 'dC6ZGLzdaTs', 'upvuC9FR-xU', 'idFrq0H1Af0', 'bgnox1SRrw8'];

for (const id of sampleIds) {
  const ep = NICOS_WEG_EPISODES_MAP[id];
  assert(ep, `Episode not found in map: ${id}`);
  assert.strictEqual(ep.videoId.length, 11, `Invalid videoId length: ${ep.videoId}`);
  assert(ep.sentences && ep.sentences.length > 0, `No sentences for episode: ${id}`);
  
  for (const s of ep.sentences) {
    assert(typeof s.id === 'number', 'Invalid sentence id');
    assert(typeof s.start === 'number' && s.start >= 0, `Invalid sentence start: ${s.start}`);
    assert(typeof s.end === 'number' && s.end >= s.start, `Invalid sentence end: ${s.end}`);
    assert(typeof s.text === 'string' && s.text.length > 0, 'Empty sentence text');
  }
}
console.log(`  ✅ Sample episodes (${sampleIds.join(', ')}) verified with clean sentence segments!`);

// 3. Test Direct Resolver in YouTube Service
console.log('\nTest 3: YouTube Service Pre-indexed Resolver');
async function testService() {
  // Test by full URL
  const resUrl = await getVideoData('https://www.youtube.com/watch?v=upvuC9FR-xU&list=PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix', 'de');
  assert.strictEqual(resUrl.videoId, 'upvuC9FR-xU');
  assert.strictEqual(resUrl.isSample, true);
  assert(resUrl.sentences.length >= 10, 'Expected at least 10 sentences for Folge 2');
  assert.strictEqual(resUrl.playlistInfo.playlistId, 'PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix');

  // Test by direct video ID
  const resDirect = await getVideoData('SrcZ2ud4T3o', 'de');
  assert.strictEqual(resDirect.videoId, 'SrcZ2ud4T3o');
  assert(resDirect.sentences.length > 0);

  console.log('  ✅ YouTube Service resolves playlist URLs instantly with pre-indexed subtitles!');
  console.log('\n🎉 ALL NICOS WEG PLAYLIST TESTS PASSED SUCCESSFULLY!\n');
}

testService().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
