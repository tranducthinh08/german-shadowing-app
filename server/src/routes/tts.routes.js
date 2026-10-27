import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * GET /api/tts?text=...&lang=de
 * High-fidelity TTS Audio Streaming Proxy
 * Fetches native MP3 pronunciation without third-party referrer blocking
 */
router.get('/', async (req, res) => {
  try {
    const { text, lang = 'de' } = req.query;
    if (!text) {
      return res.status(400).send('Missing text parameter');
    }

    const cleanText = String(text).replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '').trim();
    if (!cleanText) {
      return res.status(400).send('Empty text');
    }

    const ttsLang = lang === 'en' ? 'en' : 'de';
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const response = await axios.get(googleTtsUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': ''
      },
      timeout: 8000
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('TTS Proxy Error:', error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'TTS audio fetch failed', message: error.message });
    }
  }
});

export default router;
