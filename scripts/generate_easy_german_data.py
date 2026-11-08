import os
import re
import json

# Extract German noun dictionary keys for automatic capitalization
def extract_nouns():
    nouns = set()
    dict_path = os.path.join(os.path.dirname(__file__), '../client/src/data/germanNounDictionary.js')
    if os.path.exists(dict_path):
        with open(dict_path, 'r', encoding='utf-8') as f:
            for line in f:
                m = re.search(r"['\"]([a-zäöüß]+)['\"]\s*:", line)
                if m:
                    nouns.add(m.group(1).lower())
    return nouns

KNOWN_NOUNS = extract_nouns()

PROPER_NAMES = {
    'manuel', 'cari', 'janusz', 'isi', 'erik', 'pauline', 'leon', 'loen', 'esti', 'chris',
    'sami', 'kari', 'justin', 'berlin', 'deutschland', 'deutsch', 'deutsche', 'deutscher',
    'hamburg', 'münchen', 'köln', 'münster', 'frankreich', 'polen', 'iran', 'teheran', 'terran',
    'amerika', 'usa', 'syrien', 'srien', 'texas', 'florida', 'indiana', 'england', 'brandenburg',
    'panko', 'damaskus', 'badenwürtemberg', 'aachen', 'freiburg', 'youtube', 'easy', 'german',
    'dw', 'a1', 'a2', 'b1', 'b2', 'sorusch', 'jay', 'karina', 'schmidt'
}

COMMON_GERMAN_NOUNS = {
    'jahr', 'jahre', 'jahren', 'name', 'tag', 'tage', 'morgen', 'abend', 'nacht', 'hallo',
    'tschüss', 'auf', 'wiedersehen', 'uhr', 'zeit', 'minuten', 'stunden', 'deutsch', 'sprache',
    'wort', 'wörter', 'supermarkt', 'laden', 'einkauf', 'kaffee', 'tee', 'wasser', 'brot',
    'brötchen', 'gemüse', 'obst', 'apfel', 'banane', 'bier', 'wein', 'essen', 'frühstück',
    'mittagessen', 'abendessen', 'hund', 'katze', 'haustier', 'haustiere', 'familie', 'eltern',
    'vater', 'mutter', 'bruder', 'brüder', 'schwester', 'kind', 'kinder', 'freund', 'freundin',
    'freunde', 'mann', 'frau', 'herr', 'dame', 'buch', 'tisch', 'stuhl', 'handy', 'computer',
    'stadt', 'land', 'straße', 'wohnung', 'haus', 'zimmer', 'beruf', 'arbeit', 'musik', 'hobby',
    'hobbys', 'sport', 'urlaub', 'reise', 'fahrrad', 'auto', 'zug', 'bahn', 'bahnhof'
}

SUFFIX_NOUNS = ('ung', 'heit', 'keit', 'schaft', 'ion', 'tät', 'chen', 'lein', 'ismus')

STARTERS = {"ich", "mein", "meine", "wir", "wie", "was", "wo", "woher", "wohin", "wann", "warum"}
DANGLING_ENDS = {"und", "oder", "ist", "bin", "wie", "heißt", "auf", "in", "an", "zu", "für", "mit", "los", "sehr", "ein", "eine", "der", "die", "das"}

def is_noun(word):
    w = word.lower().strip(",.!?\"'()[]")
    if not w:
        return False
    if w in PROPER_NAMES or w in COMMON_GERMAN_NOUNS or w in KNOWN_NOUNS:
        return True
    for s in SUFFIX_NOUNS:
        if w.endswith(s) and len(w) > len(s) + 2:
            return True
    return False

def format_word(word, is_first=False, prev_word=None):
    clean = word.strip()
    if not clean:
        return ""
    
    # Polite Sie / Ihnen / Ihr
    low = clean.lower()
    if low in ('sie', 'ihnen', 'ihr', 'ihre', 'ihren', 'ihrem', 'ihres') and prev_word and prev_word.lower() in ('wie', 'können', 'haben', 'sind', 'sprechen', 'heißen', 'wohnen', 'kommen', 'arbeiten', 'verstehen', 'kann'):
        return clean.capitalize()
    
    # Capitalize nouns
    if is_noun(clean) or is_first:
        return clean.capitalize()
    
    return clean

def parse_json3_subtitles(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    events = data.get('events', [])
    words = []
    for ev in events:
        start_ms = ev.get('tStartMs', 0)
        for s in ev.get('segs', []):
            w = s.get('utf8', '')
            if not w or w == '\n':
                continue
            offset = s.get('tOffsetMs', 0)
            t = round((start_ms + offset) / 1000.0, 2)
            words.append((t, w.strip()))
    
    if not words:
        return []
    
    raw_chunks = []
    current = []
    
    for i in range(len(words)):
        t, w = words[i]
        current.append((t, w))
        
        is_last = (i == len(words) - 1)
        if is_last:
            should_split = True
        else:
            next_t, next_w = words[i+1]
            gap = round(next_t - t, 2)
            count = len(current)
            
            should_split = False
            if next_w.lower() in ("ich", "mein", "meine", "wie", "woher", "wo", "was", "wer") and (gap >= 0.5 or count >= 2):
                should_split = True
            elif gap >= 1.15 and count >= 2:
                should_split = True
            elif gap >= 0.75 and count >= 4:
                should_split = True
            elif count >= 9 and gap >= 0.4:
                should_split = True
        
        if should_split and current:
            raw_chunks.append(current)
            current = []
    
    # Merge dangling fragments
    merged_chunks = []
    for chunk in raw_chunks:
        if not merged_chunks:
            merged_chunks.append(chunk)
            continue
        
        prev_chunk = merged_chunks[-1]
        prev_last_word = prev_chunk[-1][1].lower().strip(".,!?")
        chunk_first_word = chunk[0][1].lower().strip(".,!?")
        
        prev_dur = prev_chunk[-1][0] - prev_chunk[0][0]
        
        should_merge = False
        if prev_last_word in DANGLING_ENDS and len(prev_chunk) <= 4:
            should_merge = True
        elif len(chunk) == 1 and chunk_first_word in ("du", "geht's", "alt", "sorusch", "kari", "schmidt") and prev_dur < 4.0:
            should_merge = True
        elif len(prev_chunk) == 2 and prev_last_word == "heiße" and len(chunk) <= 2:
            should_merge = True
        
        if should_merge:
            prev_chunk.extend(chunk)
        else:
            merged_chunks.append(chunk)
    
    # Convert chunks to clean sentence objects
    QUESTION_WORDS = {'wie', 'was', 'wo', 'wer', 'wann', 'warum', 'woher', 'wohin', 'welche', 'welcher', 'welches'}
    sentences = []
    
    for idx, c in enumerate(merged_chunks):
        s_start = c[0][0]
        s_end = round(c[-1][0] + 0.8, 2)
        s_dur = round(s_end - s_start, 2)
        if s_dur <= 0:
            s_dur = 1.0
            s_end = round(s_start + 1.0, 2)
        
        formatted_words = []
        for w_idx, item in enumerate(c):
            prev = c[w_idx-1][1] if w_idx > 0 else None
            formatted_words.append(format_word(item[1], is_first=(w_idx == 0), prev_word=prev))
        
        text = " ".join(fw for fw in formatted_words if fw)
        if not text:
            continue
        
        # Punctuation check
        first_low = text.split()[0].lower()
        if first_low in QUESTION_WORDS or first_low in ('bist', 'hast', 'kannst', 'möchtest', 'haben', 'sind'):
            if not text.endswith('?'):
                text += '?'
        else:
            if not text.endswith(('.', '!', '?')):
                text += '.'
        
        sentences.append({
            'id': len(sentences) + 1,
            'start': s_start,
            'end': s_end,
            'duration': s_dur,
            'text': text
        })
    
    return sentences

# Define the 10 foundation episodes
EPISODES_METADATA = [
    {
        'episodeNumber': 1,
        'videoId': 'huwi-cjPPXU',
        'title': 'Introduce Yourself in Slow German',
        'fullTitle': 'Introduce Yourself in Slow German (for Absolute Beginners)',
        'category': 'Giao tiếp cơ bản'
    },
    {
        'episodeNumber': 2,
        'videoId': 'aRlakaPVrEw',
        'title': 'Basic German Greetings & Farewells',
        'fullTitle': 'Learn Basic German Greetings & Farewells in Slow German',
        'category': 'Giao tiếp cơ bản'
    },
    {
        'episodeNumber': 3,
        'videoId': 'eKLtI48rvtw',
        'title': 'Top 50 Everyday Objects',
        'fullTitle': 'Top 50 Everyday Objects in Slow German',
        'category': 'Từ vựng đời sống'
    },
    {
        'episodeNumber': 4,
        'videoId': 'LQiHX6OY_BI',
        'title': 'Our Morning Routine',
        'fullTitle': 'Our Morning Routine in Slow German',
        'category': 'Từ vựng đời sống'
    },
    {
        'episodeNumber': 5,
        'videoId': 'hAkxKMlYUI4',
        'title': 'German Alphabet & Pronunciation Guide',
        'fullTitle': 'German Alphabet & Pronunciation - Full Guide',
        'category': 'Phát âm & Bảng chữ cái'
    },
    {
        'episodeNumber': 6,
        'videoId': 'r8HiWsBe5ko',
        'title': '100 Essential Words in Germany',
        'fullTitle': '100 Words You Should Know When Coming to Germany',
        'category': 'Từ vựng đời sống'
    },
    {
        'episodeNumber': 7,
        'videoId': 'D91icSuPYQ4',
        'title': 'Supermarket in Slow German',
        'fullTitle': 'Supermarket in Slow German (for Beginners)',
        'category': 'Đời sống & Mua sắm'
    },
    {
        'episodeNumber': 8,
        'videoId': 'Yaelm87PTvg',
        'title': 'Introduce Yourself (Dialogues)',
        'fullTitle': 'Introduce yourself in German (for absolute beginners)',
        'category': 'Giao tiếp cơ bản'
    },
    {
        'episodeNumber': 9,
        'videoId': '9h8p08qziG0',
        'title': 'Regular Verbs: Sagen, Machen, Hören',
        'fullTitle': 'Conjugation of regular verbs: Sagen, Machen, Hören',
        'category': 'Động từ & Ngữ pháp'
    },
    {
        'episodeNumber': 10,
        'videoId': 'o7cMNtORT4I',
        'title': 'German Verbs: Machen',
        'fullTitle': 'German Verbs: Machen (Full Conjugation for Beginners)',
        'category': 'Động từ & Ngữ pháp'
    }
]

episodes = []
subs_dir = '/tmp/easy_german_subs'

for meta in EPISODES_METADATA:
    vid = meta['videoId']
    sub_file = os.path.join(subs_dir, f"{vid}.de.json3")
    sentences = []
    if os.path.exists(sub_file):
        sentences = parse_json3_subtitles(sub_file)
    
    episodes.append({
        'id': f"easy-german-{meta['episodeNumber']:02d}",
        'episodeNumber': meta['episodeNumber'],
        'title': meta['title'],
        'fullTitle': meta['fullTitle'],
        'category': meta['category'],
        'videoId': vid,
        'language': 'de',
        'author': 'Easy German',
        'thumbnail': f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
        'sentenceCount': len(sentences),
        'sentences': sentences
    })
    print(f"Episode {meta['episodeNumber']:2d} [{vid}]: {len(sentences)} sentences")

total_sentences = sum(e['sentenceCount'] for e in episodes)
print(f"Total 10 episodes processed: {len(episodes)} episodes, {total_sentences} sentences.")

# Generate JS files
js_content = f"""/**
 * Easy German A1 - Playlist Data (Batch 1: 10 Foundation Episodes)
 * Source Playlist: PLk1fjOl39-50kWobutO8NVFzbw9PHtbbg (Easy German)
 * Smart timestamp segmentation from official json3 speech timestamps.
 */

export const EASY_GERMAN_PLAYLIST = {{
  playlistId: 'PLk1fjOl39-50kWobutO8NVFzbw9PHtbbg',
  title: 'German A1 | For Absolute Beginners',
  author: 'Easy German',
  language: 'de',
  level: 'A1',
  description: 'Trọn bộ bài học tiếng Đức giao tiếp A1 thực tế ngoài đường phố Berlin từ kênh Easy German. Giọng nói chậm, chuẩn bản ngữ kết hợp từ vựng và ngữ pháp thiết yếu.',
  totalEpisodes: {len(episodes)},
  totalSentences: {total_sentences},
  episodes: {json.dumps(episodes, ensure_ascii=False, indent=2)}
}};

export const EASY_GERMAN_EPISODES_MAP = EASY_GERMAN_PLAYLIST.episodes.reduce((acc, ep) => {{
  acc[ep.videoId] = ep;
  return acc;
}}, {{}});
"""

client_out = os.path.join(os.path.dirname(__file__), '../client/src/data/easyGermanPlaylist.js')
server_out = os.path.join(os.path.dirname(__file__), '../server/src/data/easyGermanPlaylist.js')

with open(client_out, 'w', encoding='utf-8') as f:
    f.write(js_content)

with open(server_out, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated client data: {client_out}")
print(f"Generated server data: {server_out}")
