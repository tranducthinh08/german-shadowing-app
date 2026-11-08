export async function loadVideoApi(url, lang = 'de') {
  const response = await fetch('/api/youtube/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, lang })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Không thể tải video từ máy chủ');
  }
  return data.data;
}

export async function fetchSamplesApi() {
  const response = await fetch('/api/youtube/samples');
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Không thể lấy danh sách bài mẫu');
  }
  return data.data;
}

export async function lookupWordApi(word, lang = 'de') {
  const response = await fetch(`/api/dict/lookup?word=${encodeURIComponent(word)}&lang=${lang}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Không tìm thấy định nghĩa');
  }
  return data.data;
}

export async function translateSentenceApi(text, fromLang = 'auto') {
  try {
    const response = await fetch('/api/dict/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, fromLang })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      return data.translation;
    }
  } catch (e) {
    console.warn('translateSentenceApi error:', e);
  }
  return '';
}

/**
 * Request rich AI translation using Gemini (with automatic fallback to Google Translate)
 */
export async function translateWithAiApi(text, sourceLang = 'de', customApiKey = '') {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (customApiKey && customApiKey.trim()) {
      headers['x-gemini-api-key'] = customApiKey.trim();
    }

    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, sourceLang })
    });

    const resJson = await response.json();
    if (response.ok && resJson.success && resJson.data && resJson.data.translation) {
      return resJson.data;
    }
  } catch (e) {
    console.warn('translateWithAiApi request error, falling back:', e);
  }

  // Client-side fallback to standard translation
  let fallbackText = await translateSentenceApi(text, sourceLang);
  if (!fallbackText) {
    try {
      const q = encodeURIComponent(text.trim());
      const r = await fetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLang}&tl=vi&q=${q}`);
      const data = await r.json();
      if (data && typeof data[0] === 'string') fallbackText = data[0].trim();
    } catch (e) {}
  }

  return {
    translation: fallbackText,
    literal: '',
    terms: [],
    grammarTip: '',
    provider: 'fallback'
  };
}

/**
 * Ask AI to explain grammar or answer a specific question about a sentence
 */
export async function explainGrammarWithAiApi(sentence, question, language = 'de', customApiKey = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (customApiKey && customApiKey.trim()) {
    headers['x-gemini-api-key'] = customApiKey.trim();
  }

  const response = await fetch('/api/ai/explain', {
    method: 'POST',
    headers,
    body: JSON.stringify({ sentence, question, language })
  });

  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    throw new Error(resJson.error || 'Không thể nhận phản hồi giải thích từ AI');
  }
  return resJson.data;
}
