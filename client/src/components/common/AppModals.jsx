import React from 'react';
import UserProfileModal from '../user/UserProfileModal';
import WordPopover from '../vocab/WordPopover';
import VocabNotebookModal from '../vocab/VocabNotebookModal';
import ShortcutsModal from './ShortcutsModal';
import CustomTranscriptModal from './CustomTranscriptModal';
import GamificationModal from '../gamification/GamificationModal';
import RewardToast from '../gamification/RewardToast';

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
    <>
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={onCloseUserModal}
        currentUser={currentUser}
        onSelectUser={onSelectUser}
        canClose={Boolean(currentUser)}
      />

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
      <VocabNotebookModal
        isOpen={isVocabOpen}
        onClose={onCloseVocab}
        savedWords={savedWords}
        onRemoveWord={onRemoveWord}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={onCloseShortcuts}
      />

      {/* Custom Transcript Modal */}
      <CustomTranscriptModal
        isOpen={isCustomTranscriptOpen}
        onClose={onCloseCustomTranscript}
        onApplyCustomLesson={onApplyCustomLesson}
        currentLanguage={currentLanguage}
      />

      {/* Gamification Dashboard Modal */}
      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={onCloseGamification}
        gamificationData={gamificationData}
        onUpdateData={onUpdateGamificationData}
        currentUser={currentUser}
      />

      {/* Floating Reward Notification Toast */}
      {activeReward && (
        <RewardToast
          reward={activeReward}
          onDismiss={onDismissReward}
        />
      )}
    </>
  );
}
