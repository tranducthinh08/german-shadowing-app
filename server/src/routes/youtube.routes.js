import express from 'express';
import axios from 'axios';
import { getVideoData, extractVideoId } from '../services/youtube.service.js';
import { SAMPLE_VIDEOS } from '../data/mockData.js';
import { NICOS_WEG_PLAYLIST } from '../data/nicosWegPlaylist.js';

const router = express.Router();

/**
 * GET /api/youtube/debug
 * Diagnoses YouTube InnerTube connectivity on Vercel
 */
router.get('/debug', async (req, res) => {
  try {
    const { videoId = 'dC6ZGLzdaTs' } = req.query;
    const postUrl = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
    const ytRes = await axios.post(
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
    const playability = ytRes.data?.playabilityStatus;
    const tracks = ytRes.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    let subData = null;
    let subError = null;
    if (tracks.length > 0) {
      try {
        const subRes = await axios.get(tracks[0].baseUrl, { timeout: 9000 });
        subData = { length: subRes.data?.length, preview: String(subRes.data).slice(0, 200) };
      } catch (err) {
        subError = err.message;
      }
    }
    return res.json({
      playability,
      tracksCount: tracks.length,
      tracks: tracks.map(t => ({ lang: t.languageCode, url: t.baseUrl?.slice(0, 80) + '...' })),
      subData,
      subError
    });
  } catch (err) {
    return res.json({ error: err.message, response: err.response?.data });
  }
});

/**
 * GET /api/youtube/samples
 * Returns list of curated sample lessons
 */
router.get('/samples', (req, res) => {
  return res.json({
    success: true,
    data: SAMPLE_VIDEOS.map(v => ({
      videoId: v.videoId,
      title: v.title,
      author: v.author,
      language: v.language,
      thumbnail: v.thumbnail,
      sentenceCount: v.sentences.length
    }))
  });
});

/**
 * GET /api/youtube/playlist/nicos-weg
 * Returns full DW Deutsch lernen Nicos Weg A1 curriculum
 */
router.get('/playlist/nicos-weg', (req, res) => {
  return res.json({
    success: true,
    data: {
      playlistId: NICOS_WEG_PLAYLIST.playlistId,
      title: NICOS_WEG_PLAYLIST.title,
      author: NICOS_WEG_PLAYLIST.author,
      description: NICOS_WEG_PLAYLIST.description,
      totalEpisodes: NICOS_WEG_PLAYLIST.totalEpisodes,
      totalSentences: NICOS_WEG_PLAYLIST.totalSentences,
      episodes: NICOS_WEG_PLAYLIST.episodes.map(e => ({
        id: e.id,
        episodeNumber: e.episodeNumber,
        title: e.title,
        fullTitle: e.fullTitle,
        category: e.category,
        videoId: e.videoId,
        thumbnail: e.thumbnail,
        sentenceCount: e.sentenceCount
      }))
    }
  });
});

/**
 * GET /api/youtube/load
 * Allows browser GET testing or ?url=... query parameter
 */
router.get('/load', async (req, res) => {
  try {
    const { url, lang = 'de' } = req.query;
    if (!url) {
      return res.json({
        success: true,
        status: 'online',
        message: 'Endpoint /api/youtube/load đang hoạt động bình thường. Hãy mở trang chủ ứng dụng để học, hoặc truyền tham số ?url=<link_youtube>&lang=de để xem dữ liệu.'
      });
    }

    const data = await getVideoData(url, lang);
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi tải thông tin và phụ đề video'
    });
  }
});

/**
 * POST /api/youtube/load
 * Body: { url: string, lang: 'de' | 'en' }
 */
router.post('/load', async (req, res) => {
  try {
    const { url, lang = 'de' } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp link hoặc ID video YouTube'
      });
    }

    const data = await getVideoData(url, lang);
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in /api/youtube/load:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi tải thông tin và phụ đề video'
    });
  }
});

export default router;
