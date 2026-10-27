import React from 'react';
import { Volume2, X, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { speakWord } from '../../utils/pronunciationGuide';

export default function SpeakingWordModal({ wordEval, onClose }) {
  if (!wordEval) return null;

  const { original, clean, status, score, feedback, phoneticTip } = wordEval;

  const handleSpeak = (speed = 0.85) => {
    speakWord(clean || original, 'de', speed);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'correct':
        return {
          icon: CheckCircle,
          label: 'Phát âm chuẩn xác (100%)',
          color: 'text-secondary bg-secondary/15 border-secondary/30'
        };
      case 'partial':
        return {
          icon: AlertTriangle,
          label: `Gần đúng (${score}%)`,
          color: 'text-tertiary bg-tertiary/15 border-tertiary/30'
        };
      default:
        return {
          icon: Info,
          label: 'Cần luyện thêm (0%)',
          color: 'text-error bg-error/15 border-error/30'
        };
    }
  };

  const badge = getStatusBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-on-surface"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold uppercase tracking-wider text-outline">
              Chi tiết âm vị từng từ
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Word Display & Audio */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-outline-variant/30">
          <div>
            <div className="text-2xl font-bold tracking-tight text-on-surface">
              {original}
            </div>
            {phoneticTip?.sound && (
              <span className="text-xs font-mono text-secondary mt-0.5 block">
                IPA: {phoneticTip.sound}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSpeak(0.85)}
              className="p-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md"
              title="Nghe từ này"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe</span>
            </button>
            <button
              type="button"
              onClick={() => handleSpeak(0.65)}
              className="p-2 rounded-xl bg-surface-container-highest text-on-surface-variant hover:text-on-surface text-xs font-bold cursor-pointer transition-colors"
              title="Nghe tốc độ chậm"
            >
              🐢
            </button>
          </div>
        </div>

        {/* Status & Feedback */}
        <div className="flex flex-col gap-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold w-fit ${badge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{badge.label}</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {feedback}
          </p>
        </div>

        {/* Mouth Posture & Phonetic Tip */}
        {phoneticTip && (
          <div className="p-3.5 rounded-xl bg-secondary-container/15 border border-secondary/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-secondary">
              <span>👄</span>
              <span>Hướng dẫn khẩu hình & vị trí lưỡi ({phoneticTip.label})</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed font-medium">
              {phoneticTip.mouthTip}
            </p>
          </div>
        )}

        {/* Footer Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-xs font-bold text-on-surface transition-colors cursor-pointer"
        >
          Đã hiểu, quay lại
        </button>
      </div>
    </div>
  );
}
