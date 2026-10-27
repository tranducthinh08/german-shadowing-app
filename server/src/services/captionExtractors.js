import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { parseVTT } from "./subtitle.parser.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

async function fetchInnerTubeCaptions(videoId, requestedLang = 'de') {
  try {
    const postUrl = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
    const res = await axios.post(
      postUrl,
      {
        context: {
          client: {
            clientName: 'ANDROID',
            clientVersion: '20.10.38'
          }
        },
        videoId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'
        },
        timeout: 9000
      }
    );

    const tracks = res.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (!Array.isArray(tracks) || tracks.length === 0) return null;

    // Prioritize language: exact match -> prefix match (e.g. de-DE) -> de/en -> first track
    let track = tracks.find(t => t.languageCode === requestedLang) ||
                tracks.find(t => t.languageCode?.startsWith(requestedLang)) ||
                tracks.find(t => t.languageCode?.startsWith('de') || t.languageCode?.startsWith('en')) ||
                tracks[0];

    if (!track?.baseUrl) return null;

    const subRes = await axios.get(track.baseUrl, { timeout: 9000 });
    const xml = subRes.data;
    if (!xml || typeof xml !== 'string') return null;

    const list = [];
    // Pattern 1: <p t="startMs" d="durMs"...>text</p> (Format 3 / srv3)
    const pRegex = /<p t="(\d+)" d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let pm;
    while ((pm = pRegex.exec(xml)) !== null) {
      const clean = pm[3]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      if (clean) {
        list.push({
          start: parseInt(pm[1], 10) / 1000,
          duration: parseInt(pm[2], 10) / 1000,
          text: clean
        });
      }
    }

    // Pattern 2: <text start="startSec" dur="durSec">text</text> (Standard timedtext XML format)
    if (list.length === 0) {
      const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
      let tm;
      while ((tm = textRegex.exec(xml)) !== null) {
        const clean = tm[3]
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
        if (clean) {
          list.push({
            start: parseFloat(tm[1]) || 0,
            duration: parseFloat(tm[2]) || 0,
            text: clean
          });
        }
      }
    }

    if (list.length === 0) return null;
    const detectedLang = track.languageCode?.startsWith('de') ? 'de' : track.languageCode?.startsWith('en') ? 'en' : requestedLang;

    return { rawCaptions: list, detectedLang };
  } catch (err) {
    console.warn(`InnerTube caption extraction note for ${videoId}:`, err.message);
    return null;
  }
}

/**
 * Fetch with YoutubeTranscript library with intelligent language code fallback
 */
async function fetchWithYoutubeTranscript(videoId, requestedLang = 'de') {
  const candidates = requestedLang === 'de'
    ? ['de', 'de-DE', 'de-AT', 'de-CH']
    : ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU'];

  for (const lang of candidates) {
    try {
      const list = await YoutubeTranscript.fetchTranscript(videoId, { lang });
      if (list && list.length > 0) {
        return {
          rawCaptions: list.map(item => ({
            text: item.text,
            start: item.offset / 1000,
            duration: item.duration / 1000
          })),
          detectedLang: requestedLang
        };
      }
    } catch (e) {
      const msg = e.message || '';
      const match = msg.match(/Available languages:\s*([^\n\r]+)/);
      if (match && match[1]) {
        const available = match[1].split(',').map(s => s.trim());
        const bestLang = available.find(l => l === requestedLang || l.startsWith(requestedLang));
        if (bestLang && !candidates.includes(bestLang)) {
          candidates.push(bestLang);
        }
      }
    }
  }

  // Final fallback without language filter
  try {
    const list = await YoutubeTranscript.fetchTranscript(videoId);
    if (list && list.length > 0) {
      return {
        rawCaptions: list.map(item => ({
          text: item.text,
          start: item.offset / 1000,
          duration: item.duration / 1000
        })),
        detectedLang: requestedLang
      };
    }
  } catch (e) {}

  return null;
}

/**
 * Extract subtitles using yt-dlp (bypasses PoToken and YouTube anti-bot checks)
 */
async function fetchSubtitlesWithYtDlp(videoId, requestedLang = 'de') {
  if (process.env.VERCEL) return null; // Skip yt-dlp on Vercel serverless
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
 * Extract captions using sequential fallbacks:
 * 1. InnerTube API
 * 2. youtube-transcript
 * 3. yt-dlp (local)
 * 4. Direct HTML watch page
 */
export async function extractCaptionsWithFallbacks(videoId, requestedLang = "de") {
  let rawCaptions = null;
  let detectedLang = requestedLang;

  // 1. Primary Engine: YouTube InnerTube Android API
  console.log(`[YouTube Service] Fetching subtitles via InnerTube API for ${videoId}...`);
  const innerTubeResult = await fetchInnerTubeCaptions(videoId, requestedLang);
  if (innerTubeResult && innerTubeResult.rawCaptions.length > 0) {
    return {
      rawCaptions: innerTubeResult.rawCaptions,
      detectedLang: innerTubeResult.detectedLang
    };
  }

  // 2. Secondary Engine: YoutubeTranscript
  console.log(`[YouTube Service] Trying YoutubeTranscript fallback for ${videoId}...`);
  const ytTranscriptResult = await fetchWithYoutubeTranscript(videoId, requestedLang);
  if (ytTranscriptResult && ytTranscriptResult.rawCaptions.length > 0) {
    return {
      rawCaptions: ytTranscriptResult.rawCaptions,
      detectedLang: ytTranscriptResult.detectedLang
    };
  }

  // 3. Tertiary Engine: yt-dlp (local environment)
  if (!process.env.VERCEL) {
    console.log(`[YouTube Service] Trying yt-dlp local fallback for ${videoId}...`);
    const ytDlpResult = await fetchSubtitlesWithYtDlp(videoId, requestedLang);
    if (ytDlpResult && ytDlpResult.rawCaptions.length > 0) {
      return {
        rawCaptions: ytDlpResult.rawCaptions,
        detectedLang: ytDlpResult.detectedLang
      };
    }
  }

  // 4. Quaternary Engine: Direct HTML scraping
  console.log(`[YouTube Service] Trying direct HTML watch page fallback for ${videoId}...`);
  const directRes = await fetchDirectCaptions(videoId, requestedLang);
  if (directRes && directRes.rawCaptions.length > 0) {
    return {
      rawCaptions: directRes.rawCaptions,
      detectedLang: directRes.language
    };
  }

  return null;
}

export {
  fetchInnerTubeCaptions,
  fetchWithYoutubeTranscript,
  fetchSubtitlesWithYtDlp,
  fetchDirectCaptions
};
