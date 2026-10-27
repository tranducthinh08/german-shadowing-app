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
  setCurrentTime,
  handleNextSegment,
  handlePrevSegment,
  handleReplaySegment,
  handleReplaySlow,
  setIsLooping,
  resetTrigger,
  userSettings,
  handleToggleStrictGerman,
  handleCompleteSentence,
  isLoading,
  studyHistory,
  onOpenLessons,
  handleLoadVideo,
  onOpenHistory,
  handleSelectSegment,
  setSelectedWord,
  currentTime,
  handleToggleBlur,
  handleToggleGenderColors
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
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {currentVideo ? (
            <>
              <YouTubePlayer
                ref={playerRef}
                videoId={currentVideo.videoId}
                activeSegment={activeSegment}
                isLooping={isLooping}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={setPlaybackSpeed}
                onTimeUpdate={setCurrentTime}
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

        <div className="lg:col-span-5">
          <TranscriptList
            sentences={currentVideo?.sentences || []}
            activeSegmentId={activeSegment?.id}
            onSelectSegment={handleSelectSegment}
            onWordClick={(word) => setSelectedWord({ word, context: activeSegment?.text || '' })}
            completedSentenceIds={completedSentenceIds}
            currentTime={currentTime}
            language={currentLanguage}
            onResetLesson={onResetLesson}
            isBlurScript={userSettings.isBlurScript}
            onToggleBlur={handleToggleBlur}
            showGenderColors={userSettings.showGenderColors}
            onToggleGenderColors={handleToggleGenderColors}
          />
        </div>
      </div>
    </>
  );
}
