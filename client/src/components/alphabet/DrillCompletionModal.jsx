import React from 'react';
import { Trophy, Sparkles, Flame, RotateCcw } from 'lucide-react';

export default function DrillCompletionModal({
  drillTitle,
  correctCount,
  totalQuestions,
  rewardXp,
  onRestart,
  onClose
}) {
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="bg-[#0b1120] text-on-surface rounded-2xl border border-outline-variant/30 p-6 md:p-8 shadow-2xl max-w-xl mx-auto my-6 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
        <Trophy className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">
        {drillTitle || 'Xuất sắc! Hoàn thành bài ôn hôm nay!'}
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Bạn vừa duy trì thói quen luyện tai và chuẩn hóa phát âm chữ cái tiếng Đức.
      </p>

      {/* Score & XP Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
          <span className="text-xs text-on-surface-variant font-medium">Độ chính xác</span>
          <div className="text-2xl font-black text-secondary mt-1">
            {correctCount} / {totalQuestions} ({scorePercent}%)
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
          <span className="text-xs text-on-surface-variant font-medium">Thưởng kinh nghiệm</span>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>+{rewardXp || 30} XP</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-6 text-left">
        <div className="flex items-center gap-2 text-secondary font-semibold text-xs mb-1">
          <Flame className="w-4 h-4" />
          <span>Mẹo ghi nhớ lâu dài:</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Hãy duy trì 2 phút ôn tập mỗi ngày để các âm như <strong>Ö, Ü, V (đọc là F), W (đọc là V), Z (bật TS)</strong> in sâu vào phản xạ nghe - nói tự nhiên của bạn!
        </p>
      </div>

      <div className="flex items-center gap-3 justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ôn lại phiên khác</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
        >
          <span>Về Bảng chữ cái</span>
        </button>
      </div>
    </div>
  );
}
