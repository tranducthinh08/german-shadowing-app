import { useState, useCallback } from 'react';
import { getGamificationData, recordLearningAction } from '../utils/gamification';
import { calculateReviewProgressUpdate } from '../utils/alphabetReviewEngine';

export function useGamificationSession(currentUser) {
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [activeReward, setActiveReward] = useState(null);
  const [gamificationData, setGamificationData] = useState(
    () => getGamificationData(currentUser?.username)
  );

  const reloadGamification = useCallback((username) => {
    setGamificationData(getGamificationData(username));
  }, []);

  const handleCompleteSentenceReward = useCallback((score, mode, username = currentUser?.username) => {
    let action = 'COMPLETE_DICTATION';
    if (mode === 'dictation' && score === 100) action = 'PERFECT_DICTATION';
    if (mode === 'shadowing') action = 'COMPLETE_SHADOWING';

    const result = recordLearningAction(action, { score }, username);
    setGamificationData(result.updatedData);

    if (result.leveledUp) {
      setActiveReward({
        icon: '👑',
        title: `Lên Level ${result.newLevel.level}!`,
        message: `Chúc mừng bạn đã đạt danh hiệu "${result.newLevel.title}"!`,
        xpGained: result.xpGained
      });
    } else if (result.goalReached) {
      setActiveReward({
        icon: '🎯',
        title: 'Mục tiêu hoàn thành!',
        message: 'Bạn đã đạt 100% mục tiêu học hôm nay (+30 XP thưởng)!',
        xpGained: result.xpGained
      });
    } else if (result.newBadges?.length > 0) {
      setActiveReward({
        icon: '🏆',
        title: 'Mở khóa Huy hiệu mới!',
        message: 'Bạn vừa đạt được huy hiệu thành tích mới!',
        xpGained: result.xpGained
      });
    } else if (result.xpGained > 0) {
      setActiveReward({
        icon: score === 100 ? '🎯' : '⚡',
        title: score === 100 ? 'Chính xác 100%!' : 'Hoàn thành câu!',
        message: `Bạn được cộng +${result.xpGained} XP kinh nghiệm`,
        xpGained: result.xpGained
      });
    }
  }, [currentUser?.username]);

  const handleCompleteDailyReview = useCallback(
    ({ correctCount, totalQuestions, xpEarned = 30, isDaily5 = false }, setAlphabetProgress) => {
      if (setAlphabetProgress) {
        setAlphabetProgress((prev) => calculateReviewProgressUpdate(prev, correctCount, totalQuestions));
      }

      if (currentUser?.username) {
        const actionType = isDaily5 ? 'DAILY_5_COMPLETED' : 'ALPHABET_REVIEW';
        const { updatedData, reward } = recordLearningAction(currentUser.username, actionType, {
          xp: xpEarned,
          correctCount,
          totalQuestions
        });
        setGamificationData(updatedData);
        if (reward) {
          setActiveReward(reward);
        } else {
          setActiveReward({
            icon: isDaily5 ? '🎯' : '🔤',
            title: isDaily5 ? 'Hoàn thành 5 Âm Tiêu Điểm!' : 'Hoàn thành Ôn tập Chữ cái!',
            message: `Chính xác ${correctCount}/${totalQuestions} câu. Bạn nhận được +${xpEarned} XP!`,
            xpGained: xpEarned
          });
        }
      }
    },
    [currentUser?.username]
  );

  const handleCompleteDaily5Checkoff = useCallback(
    (xpEarned = 25) => {
      if (currentUser?.username) {
        const { updatedData, reward } = recordLearningAction(currentUser.username, 'DAILY_5_COMPLETED', {
          xp: xpEarned
        });
        setGamificationData(updatedData);
        if (reward) {
          setActiveReward(reward);
        } else {
          setActiveReward({
            icon: '🎯',
            title: 'Xuất sắc! Đã ôn xong 5 Âm Tiêu Điểm!',
            message: `Bạn vừa hoàn thành luyện tập 5 âm vị hôm nay và nhận được +${xpEarned} XP!`,
            xpGained: xpEarned
          });
        }
      }
    },
    [currentUser?.username]
  );

  const handleSaveWordReward = useCallback((vocabCount) => {
    const result = recordLearningAction('SAVE_VOCAB', { vocabCount }, currentUser?.username);
    setGamificationData(result.updatedData);
  }, [currentUser?.username]);

  return {
    isGamificationOpen,
    setIsGamificationOpen,
    activeReward,
    setActiveReward,
    gamificationData,
    setGamificationData,
    reloadGamification,
    handleCompleteSentenceReward,
    handleCompleteDailyReview,
    handleCompleteDaily5Checkoff,
    handleSaveWordReward
  };
}
