import os
import re
import json
import glob

def time_to_sec(timestr):
    parts = timestr.strip().split(':')
    if len(parts) == 3:
        h, m, s = parts
        return round(int(h) * 3600 + int(m) * 60 + float(s.replace(',', '.')), 2)
    elif len(parts) == 2:
        m, s = parts
        return round(int(m) * 60 + float(s.replace(',', '.')), 2)
    return 0.0

def clean_text(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
    text = text.replace('–', '-').replace('—', '-')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_vtt(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = content.replace('\r\n', '\n').split('\n\n')
    sentences = []
    cue_id = 1

    time_pattern = re.compile(r'(\d{2}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})')

    for block in blocks:
        lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
        if not lines:
            continue

        time_line_idx = -1
        for idx, line in enumerate(lines):
            if time_pattern.search(line):
                time_line_idx = idx
                break

        if time_line_idx == -1:
            continue

        match = time_pattern.search(lines[time_line_idx])
        start_sec = time_to_sec(match.group(1))
        end_sec = time_to_sec(match.group(2))

        text_lines = lines[time_line_idx + 1:]
        raw_text = ' '.join(text_lines)
        cleaned = clean_text(raw_text)

        if not cleaned or cleaned.startswith('NOTE') or cleaned == 'WEBVTT':
            continue

        # If text is identical to previous, merge
        if sentences and sentences[-1]['text'] == cleaned:
            sentences[-1]['end'] = max(sentences[-1]['end'], end_sec)
            sentences[-1]['duration'] = round(sentences[-1]['end'] - sentences[-1]['start'], 2)
            continue

        # If previous cue ended at same time or overlap and text is consecutive part
        duration = round(end_sec - start_sec, 2)
        if duration <= 0:
            duration = 1.0
            end_sec = round(start_sec + 1.0, 2)

        sentences.append({
            'id': cue_id,
            'start': start_sec,
            'end': end_sec,
            'duration': duration,
            'text': cleaned
        })
        cue_id += 1

    return sentences

# Load playlist info
with open('/tmp/playlist_info.json', 'r', encoding='utf-8') as f:
    playlist_info = json.load(f)

vtt_files = glob.glob('/tmp/nicos_weg_all/*.vtt')
vtt_by_id = {}
for path in vtt_files:
    basename = os.path.basename(path)
    # format: 01_SrcZ2ud4T3o.de.vtt
    m = re.search(r'\d+_(.+?)\.de\.vtt', basename)
    if m:
        vtt_by_id[m.group(1)] = path

episodes = []

for idx, entry in enumerate(playlist_info['entries']):
    video_id = entry['id']
    raw_title = entry['title']

    vtt_path = vtt_by_id.get(video_id)
    sentences = []
    if vtt_path and os.path.exists(vtt_path):
        sentences = parse_vtt(vtt_path)

    # Determine episode number and title
    ep_num_match = re.search(r'(?:Folge|Episode)\s*(\d+)', raw_title, re.IGNORECASE)
    ep_num = int(ep_num_match.group(1)) if ep_num_match else (idx if idx > 0 else 0)

    # Extract clean display title
    display_title = raw_title
    if '|' in raw_title:
        parts = [p.strip() for p in raw_title.split('|')]
        display_title = parts[-1]
    elif '–' in raw_title:
        parts = [p.strip() for p in raw_title.split('–')]
        display_title = parts[-1]

    # Category / tag
    category = "Bài học A1"
    if "Titelsong" in raw_title:
        category = "Bài hát chủ đề"
    elif "Making-Of" in raw_title:
        category = "Hậu trường"
    elif "Rückblick" in raw_title:
        category = "Ôn tập tổng kết"
    elif "Tutorial" in raw_title:
        category = "Hướng dẫn"

    episodes.append({
        'id': f"nicos-weg-{ep_num:02d}",
        'episodeNumber': ep_num,
        'title': display_title,
        'fullTitle': raw_title,
        'category': category,
        'videoId': video_id,
        'language': 'de',
        'author': 'DW Deutsch lernen',
        'thumbnail': f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        'sentenceCount': len(sentences),
        'sentences': sentences
    })

print(f"Processed {len(episodes)} episodes.")
total_sentences = sum(e['sentenceCount'] for e in episodes)
print(f"Total sentences across all episodes: {total_sentences}")

# Write to client data file
client_out_dir = '/Users/vking34/Documents/german_shadowing/client/src/data'
os.makedirs(client_out_dir, exist_ok=True)
client_out_file = os.path.join(client_out_dir, 'nicosWegPlaylist.js')

server_out_dir = '/Users/vking34/Documents/german_shadowing/server/src/data'
os.makedirs(server_out_dir, exist_ok=True)
server_out_file = os.path.join(server_out_dir, 'nicosWegPlaylist.js')

js_content = f"""/**
 * Complete Nicos Weg A1 Playlist Data
 * Extracted from official DW Deutsch lernen playlist: PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix
 * Pre-indexed with exact timestamps and German subtitles for 100% offline & Vercel reliability.
 */

export const NICOS_WEG_PLAYLIST = {{
  playlistId: 'PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix',
  title: 'Nicos Weg – Einfach Deutsch lernen (A1)',
  author: 'DW Deutsch lernen',
  language: 'de',
  level: 'A1',
  description: 'Toàn bộ 76 bài học tiếng Đức A1 chuẩn quốc tế từ Deutsche Welle. Đồng hành cùng Nico từ khi đặt chân tới Đức!',
  totalEpisodes: {len(episodes)},
  totalSentences: {total_sentences},
  episodes: {json.dumps(episodes, ensure_ascii=False, indent=2)}
}};

export const NICOS_WEG_EPISODES_MAP = NICOS_WEG_PLAYLIST.episodes.reduce((acc, ep) => {{
  acc[ep.videoId] = ep;
  return acc;
}}, {{}});
"""

with open(client_out_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

with open(server_out_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Written client data to: {client_out_file}")
print(f"Written server data to: {server_out_file}")
