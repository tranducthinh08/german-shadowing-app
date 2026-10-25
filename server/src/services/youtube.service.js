import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import { segmentSentences, parseVTT } from './subtitle.parser.js';
import { SAMPLE_VIDEOS } from '../data/mockData.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

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
 * Extract subtitles using yt-dlp (bypasses PoToken and YouTube anti-bot checks)
 */
async function fetchSubtitlesWithYtDlp(videoId, requestedLang = 'de') {
  const tmpPrefix = path.join(os.tmpdir(), `polyglot_sub_${videoId}_${Date.now()}`);
  const langArg = requestedLang === 'de' ? 'de,de-DE,de-AT,de-CH' : 'en,en-US,en-GB,en-CA';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Execute yt-dlp with ignore-errors so one language issue does not block parsing
  const cmd = `python3 -m yt_dlp --no-check-certificate --skip-download --ignore-errors --no-warnings --write-sub --write-auto-sub --sub-lang "${langArg}" --sub-format vtt -o "${tmpPrefix}.%(ext)s" "${videoUrl}"`;

  try {
    await execAsync(cmd, { timeout: 30000 });
  } catch (err) {
    console.warn(`yt-dlp execution note for ${videoId}:`, err.message);
  }

  const dir = os.tmpdir();
  const baseName = path.basename(tmpPrefix);
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(f => f.startsWith(baseName) && f.endsWith('.vtt'));
  } catch (e) {
    return null;
  }

  // If no files found with specific language, try general search
  if (files.length === 0) {
    const fallbackCmd = `python3 -m yt_dlp --no-check-certificate --skip-download --ignore-errors --no-warnings --write-sub --write-auto-sub --sub-lang ".*" --sub-format vtt -o "${tmpPrefix}.%(ext)s" "${videoUrl}"`;
    try {
      await execAsync(fallbackCmd, { timeout: 30000 });
      files = fs.readdirSync(dir).filter(f => f.startsWith(baseName) && f.endsWith('.vtt'));
    } catch (e) {}
  }

  if (files.length === 0) {
    return null;
  }

  // Prioritize file matching requested language
  let selectedFile = files.find(f => f.includes(`.${requestedLang}.`)) ||
                     files.find(f => f.includes(`.${requestedLang}-`)) ||
                     files.find(f => f.includes('.de')) ||
                     files.find(f => f.includes('.en')) ||
                     files[0];

  const fullPath = path.join(dir, selectedFile);
  const vttContent = fs.readFileSync(fullPath, 'utf8');

  // Detect language tag from filename (e.g. prefix.de-DE.vtt)
  const langMatch = selectedFile.match(/\.([a-zA-Z]{2}(?:-[a-zA-Z]{2,4})?)\.vtt$/);
  const detectedLang = langMatch ? (langMatch[1].startsWith('de') ? 'de' : langMatch[1].startsWith('en') ? 'en' : langMatch[1]) : requestedLang;

  // Cleanup temp files
  files.forEach(f => {
    try { fs.unlinkSync(path.join(dir, f)); } catch (e) {}
  });

  const rawCaptions = parseVTT(vttContent);
  if (rawCaptions.length === 0) return null;

  return {
    rawCaptions,
    detectedLang
  };
}

/**
 * Fetch captions using YouTube watch page parsing (Fallback)
 */
async function fetchDirectCaptions(videoId, lang = 'de') {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': `${lang},en;q=0.9`
      },
      timeout: 8000
    });

    const html = response.data;
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) return null;

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
      return null;
    }

    let selectedTrack = captionTracks.find(t => t.languageCode === lang) ||
                        captionTracks.find(t => t.languageCode.startsWith(lang)) ||
                        captionTracks.find(t => t.languageCode === 'de' || t.languageCode === 'en') ||
                        captionTracks[0];

    if (!selectedTrack?.baseUrl) return null;

    const transcriptUrl = `${selectedTrack.baseUrl}&fmt=json3`;
    const transcriptRes = await axios.get(transcriptUrl, { timeout: 8000 });

    if (transcriptRes.data?.events) {
      const rawEvents = transcriptRes.data.events
        .filter(e => e.segs && e.segs.length > 0)
        .map(e => ({
          text: e.segs.map(s => s.utf8).join(''),
          start: (e.tStartMs || 0) / 1000,
          duration: (e.dDurationMs || 0) / 1000
        }));

      return {
        language: selectedTrack.languageCode,
        rawCaptions: rawEvents
      };
    }
  } catch (err) {
    console.warn(`Direct caption extraction note:`, err.message);
  }
  return null;
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

  // Fetch metadata in parallel
  const meta = await getVideoMetadata(videoId);
  let rawCaptions = null;
  let detectedLang = requestedLang;

  // 1. Primary Engine: yt-dlp (Bypasses YouTube PoToken / Bot challenges)
  console.log(`[YouTube Service] Fetching subtitles via yt-dlp for ${videoId}...`);
  const ytDlpResult = await fetchSubtitlesWithYtDlp(videoId, requestedLang);
  if (ytDlpResult && ytDlpResult.rawCaptions.length > 0) {
    rawCaptions = ytDlpResult.rawCaptions;
    detectedLang = ytDlpResult.detectedLang;
    console.log(`[YouTube Service] yt-dlp succeeded! Got ${rawCaptions.length} caption cues [${detectedLang}].`);
  }

  // 2. Secondary Engine: YoutubeTranscript library fallback
  if (!rawCaptions || rawCaptions.length === 0) {
    try {
      console.log(`[YouTube Service] Trying YoutubeTranscript fallback...`);
      const list = await YoutubeTranscript.fetchTranscript(videoId, { lang: requestedLang });
      if (list && list.length > 0) {
        rawCaptions = list.map(item => ({
          text: item.text,
          start: item.offset / 1000,
          duration: item.duration / 1000
        }));
      }
    } catch (e1) {
      try {
        const listFallback = await YoutubeTranscript.fetchTranscript(videoId);
        if (listFallback && listFallback.length > 0) {
          rawCaptions = listFallback.map(item => ({
            text: item.text,
            start: item.offset / 1000,
            duration: item.duration / 1000
          }));
        }
      } catch (e2) {}
    }
  }

  // 3. Tertiary Engine: Direct HTML scraping fallback
  if (!rawCaptions || rawCaptions.length === 0) {
    console.log(`[YouTube Service] Trying direct HTML watch page fallback...`);
    const directRes = await fetchDirectCaptions(videoId, requestedLang);
    if (directRes && directRes.rawCaptions.length > 0) {
      rawCaptions = directRes.rawCaptions;
      detectedLang = directRes.language;
    }
  }

  if (!rawCaptions || rawCaptions.length === 0) {
    throw new Error(
      `Không thể lấy phụ đề cho video này (video có thể không có phụ đề CC hoặc người đăng đã tắt phụ đề). Bạn hãy thử một video khác có phụ đề tiếng Đức/Anh, hoặc chọn một bài học có sẵn trong mục "Bài mẫu"!`
    );
  }

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
    language: detectedLang.startsWith('de') ? 'de' : 'en',
    sentences,
    totalSentences: sentences.length
  };
}
