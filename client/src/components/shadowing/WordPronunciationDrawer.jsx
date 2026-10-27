import React from 'react';
import {
  AlertTriangle,
  ListFilter,
  Volume2,
  Volume1,
  Mic,
  Check
} from 'lucide-react';
import { getWordPronunciationGuide, speakWord } from '../../utils/pronunciationGuide';

export default function WordPronunciationDrawer({
  wordsToDisplay = [],
  language = 'de',
  practiceResults = {},
  isPracticingMic = false,
  practicingWord = null,
  startPracticeWord,
  showAllWordsGuide = false,
  setShowAllWordsGuide,
  allSentenceWords = [],
  mispronouncedTokens = []
}) {
  if (mispronouncedTokens.length === 0 && !showAllWordsGuide) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-high/90 border border-secondary/40 shadow-xl flex flex-col gap-4 animate-fade-in">
      {/* Header of Pronunciation Correction Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface">
              {showAllWordsGuide
                ? `Hướng dẫn cách đọc toàn bộ ${allSentenceWords.length} từ trong câu`
                : `Sửa phát âm chi tiết (${mispronouncedTokens.length} từ phát âm chưa chuẩn)`}
            </h4>
            <p className="text-[11px] text-outline">
              Xem phiên âm Việt hóa, phiên âm quốc tế IPA, quy tắc khẩu hình và bấm mic luyện lại từng từ
            </p>
          </div>
        </div>

        {/* Toggle show all words vs only wrong words */}
        <button
          type="button"
          onClick={() => setShowAllWordsGuide(!showAllWordsGuide)}
          className="text-xs text-secondary hover:text-on-surface hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>{showAllWordsGuide ? 'Chỉ xem từ sai' : 'Xem cách đọc tất cả các từ trong câu'}</span>
        </button>
      </div>

      {/* Cards for each word */}
      <div className="space-y-3">
        {wordsToDisplay.map((token, idx) => {
          const guide = getWordPronunciationGuide(token.word, language);
          const result = practiceResults[token.word];
          const isPracticingThis = isPracticingMic && practicingWord === token.word;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-3 shadow-xs transition-all hover:border-secondary/40"
            >
              {/* Row 1: Word + Spoken comparison + Pronunciation approximation tags */}
              <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
                
                {/* Word and status badge */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-headline font-bold text-base sm:text-lg text-on-surface tracking-wide">
                    „{token.word}“
                  </span>

                  {/* Prominent Vietnamese Phonetic Approximation Tag */}
                  {guide?.vietnamesePhonetic && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/40 font-mono font-bold text-xs sm:text-sm shadow-xs">
                      <span className="text-[10px] text-outline uppercase font-sans font-medium">Đọc là:</span>
                      <span>[{guide.vietnamesePhonetic}]</span>
                    </div>
                  )}

                  {/* IPA Tag */}
                  {guide?.ipa && (
                    <span className="text-xs font-mono text-outline px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/30">
                      {guide.ipa}
                    </span>
                  )}

                  {/* Syllable breakdown */}
                  {guide?.syllables && (
                    <span className="text-[11px] text-outline-variant hidden md:inline">
                      (Âm tiết: <strong className="text-on-surface-variant">{guide.syllables}</strong>)
                    </span>
                  )}
                </div>

                {/* Pronunciation audio and single-word mic practice buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => speakWord(token.word, language, 0.85)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-secondary border border-outline-variant/30 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Nghe người bản ngữ phát âm từ này"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe chuẩn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => speakWord(token.word, language, 0.6)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-outline hover:text-on-surface border border-outline-variant/30 text-xs font-medium transition-all cursor-pointer shadow-xs"
                    title="Nghe phát âm chậm 0.6x để bắt rõ khẩu hình"
                  >
                    <Volume1 className="w-3.5 h-3.5 text-secondary" />
                    <span>0.6x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startPracticeWord && startPracticeWord(token.word)}
                    disabled={isPracticingMic}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isPracticingThis
                        ? 'bg-error-container text-on-error-container animate-pulse'
                        : 'bg-primary-container text-on-primary-container hover:brightness-110'
                    }`}
                    title="Bấm và nói riêng từ này vào micro"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isPracticingThis ? 'Đang nghe từ...' : 'Luyện nói từ này'}</span>
                  </button>
                </div>
              </div>

              {/* Comparison Note */}
              {token.status === 'typo' && token.userInput && (
                <div className="p-2.5 rounded-lg bg-tertiary-container/15 border border-tertiary/30 text-xs flex items-center gap-2">
                  <span className="text-tertiary font-bold">⚠️ Độ lệch âm:</span>
                  <span>Bạn đã nói là <strong className="line-through text-tertiary font-bold">"{token.userInput}"</strong> ➔ Cần phát âm là <strong className="text-secondary font-bold">"{token.word}"</strong>.</span>
                </div>
              )}

              {token.status === 'missing' && (
                <div className="p-2.5 rounded-lg bg-error-container/15 border border-error/30 text-xs flex items-center gap-2">
                  <span className="text-error font-bold">⚠️ Bị bỏ sót:</span>
                  <span>Bạn đã quên không phát âm từ <strong className="text-on-surface font-bold">"{token.word}"</strong> này trong câu. Hãy nghe mẫu và luyện đọc lại.</span>
                </div>
              )}

              {/* Concrete Phonetic Guidance & Tips */}
              <div className="p-3 rounded-lg bg-surface-container/60 border border-outline-variant/20 text-xs space-y-1.5">
                {guide?.customTip && (
                  <p className="text-on-surface leading-relaxed">
                    <strong className="text-secondary">💡 Mẹo chuẩn từ điển: </strong>
                    {guide.customTip}
                  </p>
                )}

                {guide?.matchedRules && guide.matchedRules.length > 0 ? (
                  guide.matchedRules.map((rule, rIdx) => (
                    <div key={rIdx} className="text-outline leading-relaxed flex items-start gap-1.5">
                      <span className="text-secondary font-bold shrink-0">•</span>
                      <div>
                        <span className="font-semibold text-on-surface">{rule.pattern} ({rule.sound}): </span>
                        <span>{rule.tip}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-outline">
                    💡 Chú ý phát âm tròn môi và dứt khoát các phụ âm cuối.
                  </p>
                )}
              </div>

              {/* Single Word Practice Feedback Banner */}
              {result && (
                <div className="pt-0.5">
                  {result.success ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 text-xs font-semibold animate-fade-in">
                      <Check className="w-4 h-4 text-secondary shrink-0" />
                      <span>Xuất sắc! AI đã ghi nhận bạn phát âm chuẩn xác từ „{token.word}“!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-tertiary-container/20 text-tertiary border border-tertiary/40 text-xs animate-fade-in">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          Chưa khớp: AI nghe là <strong>"{result.recognized}"</strong>. Hãy bấm nút <strong>Nghe chậm 0.6x</strong> và bấm mic thử lại nhé!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => startPracticeWord && startPracticeWord(token.word)}
                        className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-bright text-on-surface font-semibold text-[11px] shrink-0 border border-outline-variant/30 cursor-pointer"
                      >
                        Nói lại
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
