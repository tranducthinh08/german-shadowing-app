import React from 'react';
import { Award } from 'lucide-react';

export default function ShadowingScoreCard({ recognizedText, speechScore }) {
  if (!recognizedText && !speechScore) return null;

  return (
    <div className="p-3.5 rounded-xl bg-surface-container-high border border-outline-variant/40 shadow-md flex flex-col gap-2.5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-tertiary" />
          <span className="font-headline font-bold text-xs text-on-surface">Đánh giá độ khớp toàn câu:</span>
        </div>
        {speechScore && (
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30 font-headline font-bold text-xs">
            Độ khớp: {speechScore.score}%
          </span>
        )}
      </div>

      {recognizedText && (
        <div className="p-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface font-transcription border border-outline-variant/20">
          <span className="text-outline block text-[10px] mb-0.5">Văn bản AI ghi nhận được từ giọng bạn:</span>
          <p className="text-xs sm:text-sm text-secondary font-medium">„{recognizedText}“</p>
        </div>
      )}

      {speechScore?.tokens && speechScore.tokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {speechScore.tokens.map((token, tIdx) => (
            <span
              key={tIdx}
              className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                token.status === 'correct'
                  ? 'bg-secondary/15 text-secondary border-secondary/30'
                  : token.status === 'typo'
                  ? 'bg-tertiary-container/30 text-tertiary border-tertiary/40'
                  : 'bg-error/20 text-error border-error/30'
              }`}
            >
              {token.word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
