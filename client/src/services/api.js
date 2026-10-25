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
