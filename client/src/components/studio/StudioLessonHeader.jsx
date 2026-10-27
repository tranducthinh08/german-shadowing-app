import React from 'react';
import { PenTool, Mic, RotateCcw } from 'lucide-react';
import EpisodeNavBar from '../playlist/EpisodeNavBar';
import { NICOS_WEG_EPISODES_MAP } from '../../data/nicosWegPlaylist';

export default function StudioLessonHeader({
  currentVideo,
  currentLanguage,
  activeSegmentIndex,
  completedSentenceCount,
  studyMode,
  onChangeMode,
  onResetLesson,
  onSelectEpisode,
  onOpenPlaylistView
}) {
  if (!currentVideo) return null;

  const totalSentences = currentVideo.sentences?.length || 0;
  const progressPercent = totalSentences > 0
    ? Math.round((completedSentenceCount / totalSentences) * 100)
    : 0;

  return (
    <>
      {/* Episode Navigation Bar if video belongs to Nicos Weg */}
      {NICOS_WEG_EPISODES_MAP[currentVideo.videoId] && (
        <EpisodeNavBar
          currentVideoId={currentVideo.videoId}
          onSelectEpisode={onSelectEpisode}
          onOpenPlaylistView={onOpenPlaylistView}
        />
      )}

      {/* Video Lesson Bar */}
      <div className="mb-5 w-full rounded-2xl bg-surface-container/70 backdrop-blur-xl border border-outline-variant/30 px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] px-2 py-0.2 rounded-md font-bold bg-secondary-container/20 text-secondary border border-secondary/30">
              {currentLanguage === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
            </span>
            <span className="text-xs text-outline font-medium truncate">
              {currentVideo.author}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-headline font-semibold text-on-surface truncate" title={currentVideo.title}>
            {currentVideo.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-outline mt-1 font-medium">
            <span>Câu <strong className="text-on-surface">{activeSegmentIndex + 1}</strong> / {totalSentences}</span>
            <span className="text-outline-variant">•</span>
            <span>Đã học: <strong className="text-secondary font-semibold">{completedSentenceCount}</strong></span>
            {totalSentences > 0 && (
              <span className="text-[11px] font-mono text-outline">
                ({progressPercent}%)
              </span>
            )}
          </div>
        </div>

        {/* Actions: Reset button & Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onResetLesson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-error-container/20 text-outline hover:text-error border border-outline-variant/30 hover:border-error/40 rounded-full text-xs font-medium transition-all cursor-pointer shadow-xs"
            title="Làm lại bài học này từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm lại bài</span>
          </button>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-0.5 bg-surface-container-low border border-outline-variant/40 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => onChangeMode('dictation')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                studyMode === 'dictation'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Nghe chép</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeMode('shadowing')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                studyMode === 'shadowing'
                  ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Nói đuổi</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
