import React, { useState } from 'react';
import { X, Flame, Target, Trophy, Award, Calendar, CheckCircle2, Zap, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { calculateLevel, ALL_BADGES, updateDailyGoalTarget } from '../../utils/gamification';

export default function GamificationModal({
  isOpen,
  onClose,
  gamificationData,
  onUpdateData,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('streak'); // 'streak' | 'goals' | 'badges'

  if (!isOpen || !gamificationData) return null;

  const { streak, dailyGoal, xp, unlockedBadges = [] } = gamificationData;
  const levelInfo = calculateLevel(xp.totalXp);

  // Generate current week days (Mon-Sun)
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // 0: Mon, 6: Sun
  const weekDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  const weekDays = weekDayNames.map((name, idx) => {
    const isToday = idx === currentDayIndex;
    const isPast = idx < currentDayIndex;
    const dayOffset = idx - currentDayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];
    const isCompleted = streak.activityDates?.includes(dateStr);

    return {
      name,
      isToday,
      isCompleted,
      isPast
    };
  });

  const handleSelectGoal = (target) => {
    const updated = updateDailyGoalTarget(target, currentUser?.username);
    if (onUpdateData) onUpdateData(updated);
  };

  const goalProgressPct = Math.min(100, Math.round((dailyGoal.completedToday / dailyGoal.targetSentences) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col my-auto transition-all">
        
        {/* Ambient Glow Behind Modal Header */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-tertiary-container/30 via-secondary-container/15 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-tertiary shadow-inner border border-outline-variant/30">
              <Trophy className="w-5 h-5 text-tertiary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-outline">Gamification Center</span>
                <span className="px-2 py-0.2 rounded-full bg-tertiary/10 text-tertiary text-[11px] font-bold border border-tertiary/20">
                  Level {levelInfo.level} ({levelInfo.title})
                </span>
              </div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface tracking-tight">
                Trung tâm Thói quen & Thành tích
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Highlight Strip: Streak, XP & Goals (Google Stitch Spec) */}
        <div className="relative z-10 px-6 sm:px-8 py-4 mx-6 sm:mx-8 mt-5 rounded-2xl bg-surface-container/90 border border-outline-variant/30 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-tertiary-container/20 border border-tertiary-container/40 shadow-[0_0_24px_rgba(236,106,6,0.35)]">
              <Flame className="w-6 h-6 text-tertiary fill-tertiary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-base sm:text-lg text-tertiary">
                  {streak.currentStreak} Ngày liên tiếp
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary text-[11px] font-bold border border-outline-variant/30">
                  <ShieldCheck className="w-3 h-3 mr-1 text-secondary" /> Chuỗi đang cháy
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">
                Học ít nhất 5 câu mỗi ngày để duy trì ngọn lửa phản xạ!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="px-4 py-2 rounded-xl bg-surface-container-low/90 border border-outline-variant/30 flex flex-col items-end">
              <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Tổng điểm tích lũy</span>
              <div className="flex items-center gap-1 text-primary">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="font-headline font-bold text-sm sm:text-base">{xp.totalXp} XP</span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-surface-container-low/90 border border-outline-variant/30 flex flex-col items-end">
              <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Mục tiêu hôm nay</span>
              <div className="flex items-center gap-1 text-secondary">
                <Target className="w-3.5 h-3.5" />
                <span className="font-headline font-bold text-sm sm:text-base">{goalProgressPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Google Stitch Segmented Bar) */}
        <div className="relative z-10 px-6 sm:px-8 mt-6">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/30 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('streak')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'streak'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>1. Chuỗi học tập (Streak)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('goals')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>2. Mục tiêu câu / ngày</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'badges'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Bộ sưu tập Huy hiệu</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative z-10 px-6 sm:px-8 py-6 overflow-y-auto max-h-[50vh]">
          
          {/* TAB 1: STREAK CALENDAR */}
          {activeTab === 'streak' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">Lịch hoạt động tuần này</h3>
                  <p className="text-xs text-outline">Mỗi ngày hoàn thành ít nhất 5 câu để đánh dấu tích xanh</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-secondary border border-outline-variant/30">
                  Kỷ lục: {streak.longestStreak || 1} ngày
                </span>
              </div>

              {/* 7-Day Visual Calendar Cards */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                      day.isCompleted
                        ? 'bg-tertiary-container/15 border-tertiary/40 shadow-[0_0_12px_rgba(236,106,6,0.2)]'
                        : day.isToday
                        ? 'bg-surface-container-high border-secondary/50 ring-2 ring-secondary/30'
                        : 'bg-surface-container/60 border-outline-variant/20 opacity-70'
                    }`}
                  >
                    <span className="text-xs font-bold text-on-surface-variant">{day.name}</span>
                    <div className="my-2">
                      {day.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-tertiary" />
                      ) : day.isToday ? (
                        <Flame className="w-6 h-6 text-secondary animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-dashed border-outline-variant/60" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-outline">
                      {day.isCompleted ? 'Hoàn thành' : day.isToday ? 'Hôm nay' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DAILY GOALS */}
          {activeTab === 'goals' && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="font-headline font-bold text-sm text-on-surface">Chọn mục tiêu câu mỗi ngày</h3>
                <p className="text-xs text-outline">Tùy biến nhịp độ học tập phù hợp với quỹ thời gian của bạn</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { target: 5, label: 'Khởi động', desc: '5 câu / ngày (~5 phút)' },
                  { target: 10, label: 'Tiêu chuẩn', desc: '10 câu / ngày (~10 phút)' },
                  { target: 20, label: 'Cường độ cao', desc: '20 câu / ngày (~20 phút)' }
                ].map(({ target, label, desc }) => {
                  const isSelected = dailyGoal.targetSentences === target;
                  return (
                    <button
                      key={target}
                      type="button"
                      onClick={() => handleSelectGoal(target)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-secondary-container/20 border-secondary shadow-lg shadow-secondary/10'
                          : 'bg-surface-container/60 border-outline-variant/30 hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline font-bold text-xs text-on-surface">{label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-secondary" />}
                      </div>
                      <p className="text-xs text-outline">{desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant">Tiến độ hôm nay ({dailyGoal.completedToday} / {dailyGoal.targetSentences} câu)</span>
                  <span className="text-secondary font-bold">{goalProgressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div
                    style={{ width: `${goalProgressPct}%` }}
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACHIEVEMENT BADGES */}
          {activeTab === 'badges' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-headline font-bold text-sm text-on-surface">Bộ sưu tập 8 Huy hiệu Thành tích</h3>
                <p className="text-xs text-outline">Đã mở khóa: {unlockedBadges.length} / {ALL_BADGES.length} huy hiệu</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_BADGES.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                        isUnlocked
                          ? 'bg-surface-container/90 border-secondary/40 shadow-sm'
                          : 'bg-surface-container/40 border-outline-variant/20 opacity-60'
                      }`}
                    >
                      <div className="text-2xl shrink-0 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-inner">
                        {badge.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-headline font-bold text-xs text-on-surface truncate">{badge.title}</h4>
                          {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-outline mt-0.5 leading-snug">{badge.description}</p>
                        <span className="text-[10px] text-tertiary font-bold mt-1 block">
                          {isUnlocked ? '✓ Đã đạt được' : `+${badge.xpReward || 50} XP khi mở khóa`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
