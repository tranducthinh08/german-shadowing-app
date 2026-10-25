import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, Sparkles, Youtube } from 'lucide-react';

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

function parseSimpleTime(str) {
  if (!str) return 0;
  const parts = str.trim().split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function parseSrtTime(h, m, s, ms) {
  const hours = h ? parseInt(h.replace(':', ''), 10) : 0;
  const mins = parseInt(m, 10);
  const secs = parseInt(s, 10);
  const msecs = parseInt(ms, 10);
  return +(hours * 3600 + mins * 60 + secs + msecs / 1000).toFixed(2);
}

export function parseCustomTranscript(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const cues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Format 1: SRT Arrow (00:00:10,480 --> 00:00:13,040)
    const srtMatch = line.match(
      /(\d{1,2}:)?(\d{1,2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{1,2}:)?(\d{1,2}):(\d{2})[,.](\d{3})/
    );
    if (srtMatch) {
      const start = parseSrtTime(srtMatch[1], srtMatch[2], srtMatch[3], srtMatch[4]);
      const end = parseSrtTime(srtMatch[5], srtMatch[6], srtMatch[7], srtMatch[8]);
      const textLines = [];
      while (i + 1 < lines.length && !lines[i + 1].includes('-->') && !/^\d+$/.test(lines[i + 1])) {
        i++;
        textLines.push(lines[i]);
      }
      if (textLines.length > 0) {
        cues.push({ start, end, text: textLines.join(' ') });
      }
      continue;
    }

    // Format 2: YouTube timestamp on standalone line (e.g. "0:10") followed by sentence
    const timeAlone = line.match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})$/);
    if (timeAlone && i + 1 < lines.length && !lines[i + 1].match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})$/)) {
      const start = parseSimpleTime(line);
      i++;
      const text = lines[i];
      cues.push({ start, end: start + 4, text });
      continue;
    }

    // Format 3: Timestamp followed by text on same line ("0:10 Guten Morgen")
    const timeInline = line.match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})\s+(.+)$/);
    if (timeInline) {
      const timeStr = timeInline[1] ? `${timeInline[1]}${timeInline[2]}:${timeInline[3]}` : `${timeInline[2]}:${timeInline[3]}`;
      const start = parseSimpleTime(timeStr);
      cues.push({ start, end: start + 4, text: timeInline[4] });
      continue;
    }
  }

  // Adjust cue end timestamps based on next cue's start
  for (let j = 0; j < cues.length; j++) {
    if (j < cues.length - 1 && cues[j + 1].start > cues[j].start) {
      cues[j].end = cues[j + 1].start;
    }
    cues[j].duration = Math.max(0.5, +(cues[j].end - cues[j].start).toFixed(2));
    cues[j].id = j + 1;
  }

  return cues;
}

export default function CustomTranscriptModal({
  isOpen,
  onClose,
  onApplyCustomLesson,
  currentLanguage = 'de'
}) {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleProcess = (e) => {
    e.preventDefault();
    setError(null);

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('Vui lòng nhập đường link hoặc ID video YouTube hợp lệ');
      return;
    }

    const sentences = parseCustomTranscript(transcriptText);
    if (sentences.length === 0) {
      setError(
        'Không thể nhận diện các mốc thời gian phụ đề. Hãy đảm bảo nội dung có dạng "0:15 Câu cần học" hoặc dạng copy từ YouTube "Hiện bản chép lời" (0:15 trên một dòng, câu nói ở dòng tiếp theo).'
      );
      return;
    }

    const lessonData = {
      videoId,
      title: title.trim() || `Bài học YouTube (${videoId})`,
      author: 'YouTube',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      language: currentLanguage,
      sentences,
      totalSentences: sentences.length,
      isCustom: true
    };

    onApplyCustomLesson(lessonData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div 
        className="w-full max-w-xl rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary-container to-primary flex items-center justify-center text-on-primary shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Nhập phụ đề thủ công
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Dán link YouTube + bản chép lời để học ngay mọi video 100% không lo bị chặn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleProcess} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-error-container/30 border border-error/50 flex items-center gap-2 text-error text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              1. Link video YouTube:
            </label>
            <div className="flex items-center bg-surface-container-lowest rounded-xl px-3 py-2 border border-outline-variant/40 focus-within:border-secondary transition-all">
              <Youtube className="w-4 h-4 text-error mr-2 shrink-0" />
              <input
                type="text"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="VD: https://www.youtube.com/watch?v=dC6ZGLzdaTs"
                className="w-full bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              2. Tiêu đề bài học (tùy chọn):
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Nicos Weg Folge 1..."
              className="w-full bg-surface-container-lowest rounded-xl px-3 py-2 border border-outline-variant/40 focus-within:border-secondary transition-all text-xs text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-on-surface">
                3. Dán bản chép lời (Transcript hoặc file SRT):
              </label>
              <span className="text-[11px] text-secondary font-medium">
                Mở YouTube ➔ "Hiện bản chép lời" ➔ Copy & Dán vào đây
              </span>
            </div>
            <textarea
              rows={8}
              required
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Ví dụ dạng copy từ YouTube:&#10;0:10&#10;Guten Morgen, Herr Müller&#10;0:13&#10;Wie geht es Ihnen?&#10;&#10;Hoặc dạng 1 dòng:&#10;0:10 Guten Morgen, Herr Müller&#10;0:13 Wie geht es Ihnen?"
              className="w-full bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/40 focus-within:border-secondary transition-all text-xs text-on-surface placeholder:text-outline focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-outline hover:text-on-surface transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md shadow-primary-container/20 hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo bài học ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}