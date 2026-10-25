/**
 * Utility to decode basic HTML entities in captions
 */
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

/**
 * Clean caption text: remove sound descriptions like [Musik], speaker dashes (-, –), ellipses (..., …), etc.
 */
export function cleanCaptionText(text) {
  if (!text) return '';
  let cleaned = decodeHtmlEntities(text);
  // Remove HTML / VTT tags like <c.S1>, </c>, <v Speaker>
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  // Remove [Music], [Musik], (Applause), [Lachen], etc.
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
  // Remove musical notes & icons
  cleaned = cleaned.replace(/[♪♫🎵🎶#_]/g, ' ');
  // Remove ellipses (... or … or ..)
  cleaned = cleaned.replace(/\.{2,}/g, '');
  cleaned = cleaned.replace(/…+/g, '');
  // Remove leading speaker dashes or punctuation
  cleaned = cleaned.replace(/^[–—\-\s\.,:;]+/, '');
  // Remove isolated dashes inside text (e.g. " - ")
  cleaned = cleaned.replace(/\s+[–—\-]+\s+/g, ' ');
  // Remove trailing dashes or hyphens
  cleaned = cleaned.replace(/[–—\-\s]+$/, '');
  // Replace newlines and multiple spaces with a single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

/**
 * Parse WebVTT subtitle text into timestamped caption items
 * @param {string} vttText
 * @returns {Array<{text: string, start: number, duration: number}>}
 */
export function parseVTT(vttText) {
  if (!vttText) return [];

  const blocks = vttText.split(/\r?\n\r?\n/);
  const items = [];
  const timeRegex = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})\s+-->\s+(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})/;

  let lastAddedText = '';

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const timeLine = lines.find(l => timeRegex.test(l));
    if (!timeLine) continue;

    const match = timeLine.match(timeRegex);
    if (!match) continue;

    const parseSeconds = (h, m, s, ms) => {
      const hours = parseInt(h || '0', 10);
      const mins = parseInt(m, 10);
      const secs = parseInt(s, 10);
      const millis = parseInt(ms, 10);
      return hours * 3600 + mins * 60 + secs + millis / 1000;
    };

    const start = parseSeconds(match[1], match[2], match[3], match[4]);
    const end = parseSeconds(match[5], match[6], match[7], match[8]);
    const duration = Number((end - start).toFixed(2));

    // Skip micro flash/redraw cues (< 0.1s)
    if (duration < 0.1) continue;

    const timeIdx = lines.indexOf(timeLine);
    const contentLines = lines.slice(timeIdx + 1);

    // In YouTube auto-captions, pick the line containing word timestamps <00:..> if present
    const lineWithTimestamp = contentLines.find(l => /<\d{2}:\d{2}/.test(l));
    let rawText = lineWithTimestamp ? lineWithTimestamp : contentLines.join(' ');
    
    // Clean text using comprehensive cleaner (removes HTML, dashes -, ellipses ..., sounds [Musik])
    rawText = cleanCaptionText(rawText);

    if (!rawText) {
      continue;
    }

    if (rawText && rawText !== lastAddedText) {
      items.push({
        text: rawText,
        start,
        duration
      });
      lastAddedText = rawText;
    }
  }

  return items;
}

/**
 * Intelligently merge raw caption fragments into full sentence segments
 * @param {Array<{text: string, start: number, duration: number}>} rawCaptions
 * @returns {Array<{id: number, start: number, end: number, duration: number, text: string}>}
 */
export function segmentSentences(rawCaptions) {
  if (!Array.isArray(rawCaptions) || rawCaptions.length === 0) {
    return [];
  }

  const sentences = [];
  let currentWords = [];
  let currentStart = null;
  let lastEnd = 0;

  for (let i = 0; i < rawCaptions.length; i++) {
    const item = rawCaptions[i];
    const cleaned = cleanCaptionText(item.text);
    if (!cleaned) continue;

    // Convert start and duration to seconds if they are in ms
    const itemStart = typeof item.start === 'number' ? (item.start > 10000 && item.start % 1 === 0 ? item.start / 1000 : item.start) : parseFloat(item.start) || 0;
    const itemDuration = typeof item.duration === 'number' ? (item.duration > 10000 && item.duration % 1 === 0 ? item.duration / 1000 : item.duration) : parseFloat(item.duration) || 2;
    const itemEnd = itemStart + itemDuration;

    if (currentStart === null) {
      currentStart = itemStart;
    }

    currentWords.push(cleaned);
    lastEnd = itemEnd;

    const fullCurrentText = currentWords.join(' ').trim();
    const isPunctuationEnd = /[.!?…]$/.test(cleaned);
    const hasLongPause = (i < rawCaptions.length - 1) && (rawCaptions[i + 1].start - itemEnd > 1.8);
    const isTooLong = fullCurrentText.length > 120 || fullCurrentText.split(/\s+/).length > 20;
    const isLastItem = (i === rawCaptions.length - 1);

    // If it ends with punctuation, or there's a big pause, or it's getting too long, or it's the last item
    if ((isPunctuationEnd || hasLongPause || isTooLong || isLastItem) && fullCurrentText.length > 0) {
      sentences.push({
        id: sentences.length + 1,
        start: Number(currentStart.toFixed(2)),
        end: Number(lastEnd.toFixed(2)),
        duration: Number((lastEnd - currentStart).toFixed(2)),
        text: fullCurrentText
      });

      currentWords = [];
      currentStart = null;
    }
  }

  // Fallback if anything remains
  if (currentWords.length > 0 && currentStart !== null) {
    sentences.push({
      id: sentences.length + 1,
      start: Number(currentStart.toFixed(2)),
      end: Number(lastEnd.toFixed(2)),
      duration: Number((lastEnd - currentStart).toFixed(2)),
      text: currentWords.join(' ').trim()
    });
  }

  return sentences;
}
