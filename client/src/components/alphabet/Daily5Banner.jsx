import React from 'react';
import { CheckCircle2, RotateCcw, Trophy } from 'lucide-react';

export default function Daily5Banner({
  today,
  daily5Progress = {},
  onRotateDaily5,
  onOpenDaily5Quiz
}) {
  const completedCount = daily5Progress.completedSoundIds?.length || 0;
  const isAllCompleted = completedCount === 5;
  const progressPercent = Math.min(100, (completedCount / 5) * 100);

  return (
    <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/15 via-surface-container-high/70 to-secondary/15 border border-primary/30 shadow-lg animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-200 text-xs font-bold flex items-center gap-1">
              <span>🎯</span>
              <span>Mục tiêu ngày {today}</span>
            </span>
            {isAllCompleted && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã hoàn thành hôm nay (+25 XP)</span>
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-headline text-on-surface">
            5 Âm Vị Tiêu Điểm Ngày Hôm Nay
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5 max-w-xl">
            Hệ thống tự động chọn cân bằng chữ cái cơ bản và cụm âm khó để bạn ôn sâu mỗi ngày. Bấm tick xanh trên từng thẻ hoặc làm bài trắc nghiệm nhanh để nhận XP!
          </p>

          {/* Progress Bar & Counter */}
          <div className="flex items-center gap-3 mt-3">
            <div className="w-48 sm:w-60 bg-surface-container-low h-2 rounded-full overflow-hidden border border-outline-variant/30">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-secondary">
              Đã ôn: {completedCount} / 5 âm ({Math.round(progressPercent)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onRotateDaily5}
            className="px-3.5 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
            title="Đổi sang 5 âm khác để luyện tập thêm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-secondary" />
            <span>Đổi 5 âm khác</span>
          </button>

          <button
            type="button"
            onClick={onOpenDaily5Quiz}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Luyện tập 5 câu (+25 XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
