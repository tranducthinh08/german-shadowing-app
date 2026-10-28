import React from 'react';
import StudioLessonHeader from './StudioLessonHeader';
import StudioStarterView from './StudioStarterView';
import YouTubePlayer from '../player/YouTubePlayer';
import DictationWorkspace from '../dictation/DictationWorkspace';
import ShadowingWorkspace from '../shadowing/ShadowingWorkspace';
import TranscriptList from '../transcript/TranscriptList';

export default function StudioWorkspace({
  currentVideo,
  currentLanguage,
  activeSegmentIndex,
  completedSentenceIds,
  studyMode,
  onChangeMode,
  onResetLesson,
  onSelectEpisode,
  onOpenPlaylistView,
  playerRef,
  activeSegment,
  isLooping,
  playbackSpeed,
  setPlaybackSpeed,
  handleNextSegment,
  handlePrevSegment,
  handleReplaySegment,
  handleReplaySlow,
  setIsLooping,
  resetTrigger,
  userSettings,
  handleToggleStrictGerman,
  handleToggleLiveCheck,
  handleCompleteSentence,
  isLoading,
  studyHistory,
  onOpenLessons,
  handleLoadVideo,
  onOpenHistory,
  handleSelectSegment,
  setSelectedWord,
  handleToggleBlur,
  handleToggleGenderColors,
  isFocusMode = false,
  onToggleFocusMode
}) {
  return (
    <>
      <StudioLessonHeader
        currentVideo={currentVideo}
        currentLanguage={currentLanguage}
        activeSegmentIndex={activeSegmentIndex}
        completedSentenceCount={completedSentenceIds.size}
        studyMode={studyMode}
        onChangeMode={onChangeMode}
        onResetLesson={onResetLesson}
        onSelectEpisode={onSelectEpisode}
        onOpenPlaylistView={onOpenPlaylistView}
        completedSentenceIds={completedSentenceIds}
        onSelectSegmentIndex={(idx) => {
          if (currentVideo?.sentences?.[idx]) {
            handleSelectSegment(currentVideo.sentences[idx]);
          }
        }}
        isFocusMode={isFocusMode}
        onToggleFocusMode={onToggleFocusMode}
      />

      <div className={`grid grid-cols-1 ${isFocusMode ? 'max-w-4xl mx-auto' : 'lg:grid-cols-12'} gap-6 transition-all duration-300`}>
        <div className={`${isFocusMode ? 'w-full' : 'lg:col-span-7'} space-y-4`}>
          {currentVideo ? (
            <>
              <YouTubePlayer
                ref={playerRef}
                videoId={currentVideo.videoId}
                activeSegment={activeSegment}
                isLooping={isLooping}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={setPlaybackSpeed}
                autoPauseAtSegmentEnd={!isLooping}
                onNextSegment={handleNextSegment}
                onPrevSegment={handlePrevSegment}
                language={currentLanguage}
              />

              {studyMode === 'dictation' ? (
                <DictationWorkspace
                  key={`dict-${currentVideo?.videoId || 'vid'}-${activeSegment?.id || activeSegmentIndex}-${resetTrigger}`}
                  activeSegment={activeSegment}
                  segmentIndex={activeSegmentIndex}
                  totalSegments={currentVideo.sentences?.length || 0}
                  onNextSegment={handleNextSegment}
                  onPrevSegment={handlePrevSegment}
                  onReplaySegment={handleReplaySegment}
                  onReplaySlow={handleReplaySlow}
                  isLooping={isLooping}
                  onToggleLoop={() => setIsLooping(!isLooping)}
                  language={currentLanguage}
                  onCompleteSentence={handleCompleteSentence}
                  strictGerman={userSettings.strictNounCapitalization !== undefined ? userSettings.strictNounCapitalization : true}
                  onToggleStrictGerman={handleToggleStrictGerman}
                  isLiveCheck={userSettings.isLiveCheck !== undefined ? userSettings.isLiveCheck : true}
                  onToggleLiveCheck={handleToggleLiveCheck}
                  soundEffectsEnabled={userSettings?.soundEffectsEnabled !== false}
                />
              ) : (
                <ShadowingWorkspace
                  key={`shad-${currentVideo?.videoId || 'vid'}-${activeSegment?.id || activeSegmentIndex}-${resetTrigger}`}
                  activeSegment={activeSegment}
                  segmentIndex={activeSegmentIndex}
                  totalSegments={currentVideo.sentences?.length || 0}
                  onNextSegment={handleNextSegment}
                  onPrevSegment={handlePrevSegment}
                  onReplaySegment={handleReplaySegment}
                  language={currentLanguage}
                  onCompleteSentence={handleCompleteSentence}
                />
              )}
            </>
          ) : (
            <StudioStarterView
              isLoading={isLoading}
              hasHistory={studyHistory.length > 0}
              historyCount={studyHistory.length}
              onOpenLessons={onOpenLessons}
              onLoadVideo={handleLoadVideo}
              onOpenHistory={onOpenHistory}
            />
          )}
        </div>

        {isFocusMode ? (
          <div className="w-full text-center py-2">
            <button
              type="button"
              onClick={onToggleFocusMode}
              className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-bright text-xs text-outline hover:text-on-surface border border-outline-variant/30 transition-all cursor-pointer inline-flex items-center gap-1.5 focus-ring"
            >
              <span>🎯 Đang bật Chế độ Tập trung (Focus Mode). Nhấn để mở lại danh sách phụ đề</span>
            </button>
          </div>
        ) : (
          <div className="lg:col-span-5">
            <TranscriptList
              sentences={currentVideo?.sentences || []}
              activeSegmentId={activeSegment?.id}
              onSelectSegment={handleSelectSegment}
              onWordClick={(word) => setSelectedWord({ word, context: activeSegment?.text || '' })}
              completedSentenceIds={completedSentenceIds}
              language={currentLanguage}
              onResetLesson={onResetLesson}
              isBlurScript={userSettings.isBlurScript}
              onToggleBlur={handleToggleBlur}
              showGenderColors={userSettings.showGenderColors}
              onToggleGenderColors={handleToggleGenderColors}
            />
          </div>
        )}
      </div>
    </>
  );
}
