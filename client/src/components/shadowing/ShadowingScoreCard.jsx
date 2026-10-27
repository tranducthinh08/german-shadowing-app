import React, { useMemo, useState } from 'react';
import { Award, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeSpeechPhonetics } from '../../utils/speakingCoachEngine';

export default function ShadowingScoreCard({
  recognizedText,
  speechScore,
  targetSentence,
  language = 'de'
}) {
  const [showCoachDetails, setShowCoachDetails] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const phoneticAnalysis = useMemo(() => {
    if (language === 'de' && targetSentence && recognizedText) {
      return analyzeSpeechPhonetics(targetSentence, recognizedText);
    }
    return null;
  }, [language, targetSentence, recognizedText]);

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

      {/* Phonetic Diagnostic from Speaking Coach */}
      {phoneticAnalysis && (phoneticAnalysis.alerts.length > 0 || phoneticAnalysis.words.length > 0) && (
        <div className="mt-1 pt-2 border-t border-outline-variant/30 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowCoachDetails(!showCoachDetails)}
            className="flex items-center justify-between text-xs font-bold text-secondary hover:underline cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chẩn đoán âm vị & khẩu hình AI (Speaking Coach)</span>
              {phoneticAnalysis.alerts.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-tertiary/20 text-tertiary border border-tertiary/30">
                  {phoneticAnalysis.alerts.length} lưu ý
                </span>
              )}
            </div>
            {showCoachDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCoachDetails && (
            <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs animate-in fade-in duration-150">
              {/* Encouragement tip */}
              <p className="text-[11px] text-on-surface-variant font-medium">
                {phoneticAnalysis.generalTip}
              </p>

              {/* Phonetic alerts */}
              {phoneticAnalysis.alerts.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {phoneticAnalysis.alerts.map((alt, aIdx) => (
                    <div key={aIdx} className="p-2 rounded-lg bg-tertiary/10 border border-tertiary/25 text-[11px] text-on-surface flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-tertiary shrink-0 mt-0.5" />
                      <span>{alt.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Clickable word evaluations for mouth tips */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                  Mẹo khẩu hình từng từ (nhấn để xem):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {phoneticAnalysis.words.map((w, wIdx) => (
                    <button
                      key={wIdx}
                      type="button"
                      onClick={() => setSelectedWord(selectedWord?.clean === w.clean ? null : w)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                        w.status === 'correct'
                          ? 'bg-secondary/15 text-secondary border-secondary/30'
                          : w.status === 'partial'
                          ? 'bg-tertiary/20 text-tertiary border-tertiary/40'
                          : 'bg-error/20 text-error border-error/30'
                      }`}
                    >
                      {w.original}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Word Popover */}
              {selectedWord && (
                <div className="p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/40 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-on-surface">
                    <span>Từ: „{selectedWord.original}“</span>
                    <span className="text-secondary">{selectedWord.score}%</span>
                  </div>
                  <p className="text-on-surface-variant">{selectedWord.feedback}</p>
                  {selectedWord.phoneticTip && (
                    <div className="mt-1 pt-1 border-t border-outline-variant/30 text-secondary">
                      <span className="font-bold">👄 Khẩu hình ({selectedWord.phoneticTip.label}): </span>
                      <span className="text-on-surface">{selectedWord.phoneticTip.mouthTip}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
