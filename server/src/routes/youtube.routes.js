import express from 'express';
import { getVideoData, extractVideoId } from '../services/youtube.service.js';
import { SAMPLE_VIDEOS } from '../data/mockData.js';

const router = express.Router();

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
