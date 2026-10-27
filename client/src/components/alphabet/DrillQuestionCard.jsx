import React from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export default function DrillQuestionCard({
  currentQ,
  playCurrentAudio,
  handleToggleVoice,
  isRecording = false,
  voiceResultText = '',
  voiceStatus = null,
  isAnswered = false,
  handleSelfValidateVoice,
  handleSkipVoice,
  selectedOptionId = null,
  handleSelectOption,
  handleNext,
  currentIndex = 0,
  totalQuestions = 0
}) {
  return (
    <>
      {/* Voice Challenge UI */}
      {currentQ?.type === 'voice_challenge' && (
        <div className="my-6 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
          <div className="text-3xl font-black text-secondary tracking-wide mb-1">
            "{currentQ.targetWord}"
          </div>
          <div className="text-xs text-outline mb-4">
            Chữ "{currentQ.targetLetter}"
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => playCurrentAudio && playCurrentAudio(0.85)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-on-surface"
            >
              <Volume2 className="w-4 h-4 text-secondary" />
              <span>Nghe mẫu</span>
            </button>

            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-primary text-on-primary hover:brightness-110'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Đang ghi âm (Bấm dừng)' : 'Nhấn để đọc thử'}</span>
            </button>
          </div>

          {voiceResultText && (
            <div className={`p-3 rounded-xl text-xs font-medium mb-3 ${
              voiceStatus === 'matched'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : voiceStatus === 'unmatched'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {voiceResultText}
              {voiceStatus === 'matched' && ' — Phát âm rất chuẩn! 🎉'}
            </div>
          )}

          {!isAnswered && (
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
              <button
                type="button"
                onClick={handleSelfValidateVoice}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
              >
                ✓ Tôi đã tự đọc to chuẩn (+Điểm)
              </button>
              <button
                type="button"
                onClick={handleSkipVoice}
                className="text-xs text-outline hover:text-on-surface underline cursor-pointer"
              >
                Bỏ qua câu này
              </button>
            </div>
          )}
        </div>
      )}

      {/* Multiple Choice Options Grid */}
      {currentQ?.type !== 'voice_challenge' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {currentQ?.options?.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let btnClass = 'bg-surface-container-low hover:bg-surface-container-high border-outline-variant/30 text-on-surface';

            if (isAnswered) {
              if (option.isCorrect) {
                btnClass = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20';
              } else if (isSelected && !option.isCorrect) {
                btnClass = 'bg-rose-500/20 border-rose-500/60 text-rose-300';
              } else {
                btnClass = 'opacity-40 bg-surface-container-low border-outline-variant/20 text-outline';
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption && handleSelectOption(option)}
                disabled={isAnswered}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${btnClass}`}
              >
                <div>
                  <div className="text-sm font-bold">{option.text}</div>
                  {option.subtext && (
                    <div className="text-xs text-outline mt-0.5">{option.subtext}</div>
                  )}
                </div>

                {isAnswered && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {isAnswered && isSelected && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation Box when Answered */}
      {isAnswered && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 mb-6 text-left animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-secondary font-bold text-xs mb-1.5">
            <Lightbulb className="w-4 h-4 text-secondary" />
            <span>Giải thích phát âm & Mẹo khẩu hình:</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {currentQ?.explanation}
          </p>
        </div>
      )}

      {/* Bottom Action: Next Button */}
      {isAnswered && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{currentIndex + 1 < totalQuestions ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
