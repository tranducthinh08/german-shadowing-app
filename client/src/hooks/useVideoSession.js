import { useState, useRef, useCallback } from 'react';
import { loadVideoApi } from '../services/api';
import { NICOS_WEG_EPISODES_MAP } from '../data/nicosWegPlaylist';

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  const match = str.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function useVideoSession(initialSettings = {}) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState(() => initialSettings.activeMode || 'dictation');
  const [currentLanguage, setCurrentLanguage] = useState(() => initialSettings.selectedLang || 'de');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const playerRef = useRef(null);
  const activeSegment = currentVideo?.sentences?.[activeSegmentIndex] || null;

  // Load episode directly from pre-indexed Nicos Weg curriculum
  const handleSelectEpisode = useCallback(
    (episode, resetProgress = false, onProgressSync) => {
      if (!episode) return;
      const lessonData = {
        videoId: episode.videoId,
        title: episode.fullTitle || episode.title,
        author: episode.author || 'DW Deutsch lernen',
        language: 'de',
        thumbnail: episode.thumbnail,
        sentences: episode.sentences,
        isSample: true,
        playlistInfo: {
          playlistId: 'PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix',
          episodeNumber: episode.episodeNumber,
          category: episode.category
        }
      };

      setCurrentVideo(lessonData);
      setCurrentLanguage('de');
      setActiveSegmentIndex(0);
      setIsLooping(false);
      setResetTrigger((prev) => prev + 1);

      if (onProgressSync) {
        onProgressSync(lessonData, resetProgress);
      }

      setErrorMessage(null);
    },
    []
  );

  // Load video handler
  const handleLoadVideo = useCallback(
    async (urlOrId, lang = currentLanguage, resetProgress = false, onProgressSync) => {
      const rawId = extractVideoId(urlOrId);
      if (rawId && NICOS_WEG_EPISODES_MAP[rawId]) {
        handleSelectEpisode(NICOS_WEG_EPISODES_MAP[rawId], resetProgress, onProgressSync);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await loadVideoApi(urlOrId, lang);
        setCurrentVideo(data);
        setCurrentLanguage(data.language || lang);
        setActiveSegmentIndex(0);
        setIsLooping(false);
        setResetTrigger((prev) => prev + 1);

        if (onProgressSync) {
          onProgressSync(data, resetProgress);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Không thể tải video hoặc phụ đề');
      } finally {
        setIsLoading(false);
      }
    },
    [currentLanguage, handleSelectEpisode]
  );

  // Load custom transcript lesson created manually
  const handleApplyCustomLesson = useCallback((lessonData, onProgressSync) => {
    setCurrentVideo(lessonData);
    setCurrentLanguage(lessonData.language || 'de');
    setActiveSegmentIndex(0);
    setIsLooping(false);
    setResetTrigger((prev) => prev + 1);
    if (onProgressSync) {
      onProgressSync(lessonData, true);
    }
    setErrorMessage(null);
  }, []);

  // Reset current lesson from beginning
  const handleResetLesson = useCallback(
    (confirmed = false, onResetProgress) => {
      if (!currentVideo) return;

      if (!confirmed) {
        const isSure = window.confirm(
          `Bạn có chắc chắn muốn làm lại bài học "${currentVideo.title}" từ đầu không?\n\n• Tiến độ học sẽ được đặt lại về 0\n• Toàn bộ các câu phụ đề sẽ được làm mờ lại\n• Quay trở về câu số 1`
        );
        if (!isSure) return;
      }

      if (onResetProgress) {
        onResetProgress(currentVideo);
      }

      setActiveSegmentIndex(0);
      setIsLooping(false);
      setResetTrigger((prev) => prev + 1);

      if (playerRef.current && currentVideo.sentences?.[0]) {
        playerRef.current.seekTo(currentVideo.sentences[0].start);
        playerRef.current.pause();
      }
    },
    [currentVideo]
  );

  const handleNextSegment = useCallback(() => {
    if (!currentVideo?.sentences) return;
    if (activeSegmentIndex < currentVideo.sentences.length - 1) {
      const nextIdx = activeSegmentIndex + 1;
      setActiveSegmentIndex(nextIdx);
      if (playerRef.current) {
        playerRef.current.seekTo(currentVideo.sentences[nextIdx].start);
        playerRef.current.play();
      }
    }
  }, [activeSegmentIndex, currentVideo?.sentences]);

  const handlePrevSegment = useCallback(() => {
    if (!currentVideo?.sentences) return;
    if (activeSegmentIndex > 0) {
      const prevIdx = activeSegmentIndex - 1;
      setActiveSegmentIndex(prevIdx);
      if (playerRef.current) {
        playerRef.current.seekTo(currentVideo.sentences[prevIdx].start);
        playerRef.current.play();
      }
    }
  }, [activeSegmentIndex, currentVideo?.sentences]);

  const handleSelectSegment = useCallback(
    (segment) => {
      if (!currentVideo?.sentences) return;
      const idx = currentVideo.sentences.findIndex((s) => s.id === segment.id);
      if (idx !== -1) {
        setActiveSegmentIndex(idx);
        if (playerRef.current) {
          playerRef.current.seekTo(segment.start);
          playerRef.current.play();
        }
      }
    },
    [currentVideo?.sentences]
  );

  const handleReplaySegment = useCallback(() => {
    if (playerRef.current && activeSegment) {
      playerRef.current.seekTo(activeSegment.start);
      playerRef.current.play();
    }
  }, [activeSegment]);

  const handleReplaySlow = useCallback(() => {
    if (playerRef.current && activeSegment) {
      setPlaybackSpeed(0.75);
      playerRef.current.seekTo(activeSegment.start);
      playerRef.current.play();
    }
  }, [activeSegment]);

  return {
    currentVideo,
    setCurrentVideo,
    activeSegmentIndex,
    setActiveSegmentIndex,
    studyMode,
    setStudyMode,
    currentLanguage,
    setCurrentLanguage,
    playbackSpeed,
    setPlaybackSpeed,
    isLooping,
    setIsLooping,
    isLoading,
    errorMessage,
    setErrorMessage,
    resetTrigger,
    playerRef,
    activeSegment,
    handleSelectEpisode,
    handleLoadVideo,
    handleApplyCustomLesson,
    handleResetLesson,
    handleNextSegment,
    handlePrevSegment,
    handleSelectSegment,
    handleReplaySegment,
    handleReplaySlow
  };
}
