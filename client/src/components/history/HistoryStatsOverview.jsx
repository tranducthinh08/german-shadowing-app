import React from 'react';
import { Video, CheckCircle2 } from 'lucide-react';

export default function HistoryStatsOverview({
  historyCount = 0,
  totalCompletedSentences = 0,
  avgCompletion = 0
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
          <Video className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <span className="text-[11px] text-outline font-medium">Tổng số bài học</span>
          <p className="text-base sm:text-lg font-headline font-bold text-on-surface">{historyCount} video</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="text-[11px] text-outline font-medium">Số câu đã hoàn thành</span>
          <p className="text-base sm:text-lg font-headline font-bold text-on-surface">{totalCompletedSentences} câu</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary">
          <span className="font-headline font-bold text-sm text-tertiary">%</span>
        </div>
        <div>
          <span className="text-[11px] text-outline font-medium">Tiến độ trung bình</span>
          <p className="text-base sm:text-lg font-headline font-bold text-on-surface">{avgCompletion}%</p>
        </div>
      </div>
    </div>
  );
}
