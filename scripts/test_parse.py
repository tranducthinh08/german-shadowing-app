import os
import re
import json

def time_to_sec(timestr):
    # Format: HH:MM:SS.mmm or MM:SS.mmm
    parts = timestr.strip().split(':')
    if len(parts) == 3:
        h, m, s = parts
        return round(int(h) * 3600 + int(m) * 60 + float(s.replace(',', '.')), 2)
    elif len(parts) == 2:
        m, s = parts
        return round(int(m) * 60 + float(s.replace(',', '.')), 2)
    return 0.0

def clean_text(text):
    # Remove HTML tags like <c.S1>, </c>, <v ...>
    text = re.sub(r'<[^>]+>', '', text)
    # Decode entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
    # Replace multiple spaces/newlines
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

        # Find line with timestamp
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

        # Text is all subsequent lines
        text_lines = lines[time_line_idx + 1:]
        raw_text = ' '.join(text_lines)
        cleaned = clean_text(raw_text)

        if not cleaned or cleaned.startswith('NOTE') or cleaned == 'WEBVTT':
            continue

        # Deduplicate consecutive identical text
        if sentences and sentences[-1]['text'] == cleaned:
            # Extend duration of previous sentence
            sentences[-1]['end'] = max(sentences[-1]['end'], end_sec)
            sentences[-1]['duration'] = round(sentences[-1]['end'] - sentences[-1]['start'], 2)
            continue

        duration = round(end_sec - start_sec, 2)
        sentences.append({
            'id': cue_id,
            'start': start_sec,
            'end': end_sec,
            'duration': duration,
            'text': cleaned
        })
        cue_id += 1

    return sentences

# Test on 04_upvuC9FR-xU.de.vtt
sentences = parse_vtt('/tmp/nicos_weg_test/04_upvuC9FR-xU.de.vtt')
print(f"Parsed {len(sentences)} sentences:")
for s in sentences[:5]:
    print(s)
