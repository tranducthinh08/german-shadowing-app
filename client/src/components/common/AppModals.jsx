import React, { lazy, Suspense } from 'react';
import RewardToast from '../gamification/RewardToast';

// Lazy-load modals so they don't bloat the initial application bundle
const UserProfileModal = lazy(() => import('../user/UserProfileModal'));
const WordPopover = lazy(() => import('../vocab/WordPopover'));
const VocabNotebookModal = lazy(() => import('../vocab/VocabNotebookModal'));
const ShortcutsModal = lazy(() => import('./ShortcutsModal'));
const CustomTranscriptModal = lazy(() => import('./CustomTranscriptModal'));
const GamificationModal = lazy(() => import('../gamification/GamificationModal'));

export default function AppModals({
  currentUser,
  isUserModalOpen,
  onCloseUserModal,
  onSelectUser,
  selectedWord,
  onCloseWordPopover,
  onSaveWord,
  savedWords,
  currentLanguage,
  isVocabOpen,
  onCloseVocab,
  onRemoveWord,
  isShortcutsOpen,
  onCloseShortcuts,
  isCustomTranscriptOpen,
  onCloseCustomTranscript,
  onApplyCustomLesson,
  isGamificationOpen,
  onCloseGamification,
  gamificationData,
  onUpdateGamificationData,
  activeReward,
  onDismissReward
}) {
  return (
    <Suspense fallback={null}>
      {/* User Profile Modal */}
      {isUserModalOpen && (
        <UserProfileModal
          isOpen={isUserModalOpen}
          onClose={onCloseUserModal}
          currentUser={currentUser}
          onSelectUser={onSelectUser}
          canClose={Boolean(currentUser)}
        />
      )}

      {/* Word Popover */}
      {selectedWord && (
        <WordPopover
          word={selectedWord.word}
          language={currentLanguage}
          contextSentence={selectedWord.context}
          isSaved={savedWords.some((w) => w.word.toLowerCase() === selectedWord.word.toLowerCase())}
          onClose={onCloseWordPopover}
          onSaveWord={onSaveWord}
        />
      )}

      {/* Sổ từ vựng Modal */}
      {isVocabOpen && (
        <VocabNotebookModal
          isOpen={isVocabOpen}
          onClose={onCloseVocab}
          savedWords={savedWords}
          onRemoveWord={onRemoveWord}
        />
      )}

      {/* Shortcuts Modal */}
      {isShortcutsOpen && (
        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={onCloseShortcuts}
        />
      )}

      {/* Custom Transcript Modal */}
      {isCustomTranscriptOpen && (
        <CustomTranscriptModal
          isOpen={isCustomTranscriptOpen}
          onClose={onCloseCustomTranscript}
          onApplyCustomLesson={onApplyCustomLesson}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Gamification Dashboard Modal */}
      {isGamificationOpen && (
        <GamificationModal
          isOpen={isGamificationOpen}
          onClose={onCloseGamification}
          gamificationData={gamificationData}
          onUpdateData={onUpdateGamificationData}
          currentUser={currentUser}
        />
      )}

      {/* Floating Reward Notification Toast */}
      {activeReward && (
        <RewardToast
          reward={activeReward}
          onDismiss={onDismissReward}
        />
      )}
    </Suspense>
  );
}
