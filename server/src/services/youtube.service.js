import axios from 'axios';
import { segmentSentences } from './subtitle.parser.js';
import { SAMPLE_VIDEOS } from '../data/mockData.js';
import { NICOS_WEG_EPISODES_MAP } from '../data/nicosWegPlaylist.js';
import { extractCaptionsWithFallbacks } from './captionExtractors.js';

/**
 * Extract YouTube Video ID from any URL format or direct ID
 */
export function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Handle various YouTube URL patterns
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  ];

  for (const regex of patterns) {
    const match = str.match(regex);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
    if (match && match[7] && match[7].length === 11) {
      return match[7];
    }
  }

  return null;
}

/**
 * Fetch video metadata (title, author, thumbnail)
 */
export async function getVideoMetadata(videoId) {
  try {
    const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const res = await axios.get(oembedUrl, { timeout: 6000 });
    if (res.data && res.data.title) {
      return {
        title: res.data.title,
        author: res.data.author_name || 'YouTube Channel',
        thumbnail: res.data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  } catch (err) {
    console.warn(`oEmbed fetch failed for ${videoId}:`, err.message);
  }

  // Fallback metadata
  return {
    title: `YouTube Video (${videoId})`,
    author: 'YouTube',
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
}

/**
 * Main service method to get video info and processed sentences
 */
export async function getVideoData(urlOrId, requestedLang = 'de') {
  const videoId = extractVideoId(urlOrId);
  if (!videoId) {
    throw new Error('Định dạng link hoặc ID YouTube không hợp lệ. Vui lòng kiểm tra lại link!');
  }

  // Check sample videos first
  const sample = SAMPLE_VIDEOS.find(v => v.videoId === videoId);
  if (sample) {
    return {
      videoId: sample.videoId,
      title: sample.title,
      author: sample.author,
      thumbnail: sample.thumbnail,
      language: sample.language,
      sentences: sample.sentences,
      isSample: true
    };
  }

  // Check pre-indexed Nicos Weg A1 curriculum (80 episodes)
  const nicosEpisode = NICOS_WEG_EPISODES_MAP[videoId];
  if (nicosEpisode && nicosEpisode.sentences && nicosEpisode.sentences.length > 0) {
    return {
      videoId: nicosEpisode.videoId,
      title: nicosEpisode.fullTitle || nicosEpisode.title,
      author: nicosEpisode.author,
      thumbnail: nicosEpisode.thumbnail,
      language: nicosEpisode.language,
      sentences: nicosEpisode.sentences,
      isSample: true,
      playlistInfo: {
        playlistId: 'PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix',
        episodeNumber: nicosEpisode.episodeNumber,
        category: nicosEpisode.category,
        title: nicosEpisode.title
      }
    };
  }

  // Fetch metadata in parallel
  const meta = await getVideoMetadata(videoId);

  const captionResult = await extractCaptionsWithFallbacks(videoId, requestedLang);
  if (!captionResult || !captionResult.rawCaptions || captionResult.rawCaptions.length === 0) {
    throw new Error(
      'Video này không có phụ đề CC (hoặc người đăng đã tắt phụ đề). Vui lòng thử một video YouTube khác có bật phụ đề CC (tiếng Đức hoặc tiếng Anh), hoặc chọn một bài học gợi ý có sẵn!'
    );
  }

  const { rawCaptions, detectedLang } = captionResult;

  // Merge into structured sentences
  const sentences = segmentSentences(rawCaptions);

  if (sentences.length === 0) {
    throw new Error('Phụ đề của video rỗng hoặc không chứa nội dung thoại có thể học được.');
  }

  return {
    videoId,
    title: meta.title,
    author: meta.author,
    thumbnail: meta.thumbnail,
    language: detectedLang && detectedLang.startsWith('de') ? 'de' : 'en',
    sentences,
    totalSentences: sentences.length
  };
}
