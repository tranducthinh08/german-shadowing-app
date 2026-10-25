import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Volume2, Info, ArrowRight, CheckCircle2, SplitSquareVertical } from 'lucide-react';
import { analyzeSentenceGrammar } from '../../utils/sentenceAnalyzer';
import { getGenderStyles } from '../../utils/germanGrammar';

export default function GrammarAnalysisModal({
  sentenceText = '',
  language = 'de',
  onClose,
  onWordClick
}) {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(null);

  if (!sentenceText) return null;

  const analysis = analyzeSentenceGrammar(sentenceText, language);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const selectedToken = selectedTokenIndex !== null && analysis?.tokens?.[selectedTokenIndex]
    ? analysis.tokens[selectedTokenIndex]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-inner border border-outline-variant/30">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface flex items-center gap-2">
                <span>Phân tích Ngữ pháp & Cấu trúc Câu</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30">
                  {language === 'de' ? '🇩🇪 Tiếng Đức' : '🇬🇧 Tiếng Anh'}
                </span>
              </h3>
              <p className="text-xs text-outline">
                Khám phá trật tự từ (Satzbau), vị trí động từ V2 và giống danh từ (der/die/das)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
            title="Đóng bảng ngữ pháp"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Sentence Interactive Display */}
          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                Câu đang phân tích (Bấm từng từ để xem vai trò cú pháp):
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(sentenceText)}
                className="flex items-center gap-1 text-xs text-secondary hover:underline px-2 py-0.5 rounded-full transition-all cursor-pointer"
                title="Nghe đọc câu này"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe câu</span>
              </button>
            </div>

            {/* Token Badges */}
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              {analysis?.tokens?.map((token, idx) => {
                const isSelected = selectedTokenIndex === idx;
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTokenIndex(isSelected ? null : idx)}
                    className={`inline-flex flex-col items-start px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-secondary-container/20 border-secondary ring-2 ring-secondary/40 text-on-surface'
                        : 'bg-surface-container-high/80 text-on-surface border-outline-variant/30 hover:bg-surface-bright'
                    }`}
                  >
                    <span className="font-headline font-bold text-sm">{token.text}</span>
                    <span className="text-[10px] text-secondary font-mono opacity-80">
                      {token.role.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Token Inspector Card */}
            {selectedToken && (
              <div className="mt-3 p-3.5 rounded-xl bg-surface-container-high border border-secondary/30 text-xs flex flex-col gap-1 animate-fade-in shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-secondary">
                    {selectedToken.text}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                    {selectedToken.role}
                  </span>
                </div>
                <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">
                  {selectedToken.desc}
                </p>
              </div>
            )}
          </div>

          {/* Satzbau (Word Order) Rule Breakdown */}
          {analysis?.satzbauExplanation && (
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-2">
              <div className="flex items-center gap-2 text-secondary font-headline font-bold text-xs uppercase tracking-wider">
                <Info className="w-4 h-4 shrink-0 text-secondary" />
                <span>{analysis.satzbauExplanation.title}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {analysis.satzbauExplanation.rule}
              </p>
            </div>
          )}

          {/* Trennbare Verben Note */}
          {analysis?.trennbarNote && (
            <div className="p-4 rounded-2xl bg-tertiary-container/15 border border-tertiary/40 space-y-2">
              <div className="flex items-center gap-2 text-tertiary font-headline font-bold text-xs uppercase tracking-wider">
                <SplitSquareVertical className="w-4 h-4 shrink-0 text-tertiary" />
                <span>Động từ tách: {analysis.trennbarNote.infinitive}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {analysis.trennbarNote.explanation}
              </p>
            </div>
          )}

          {/* German Noun Table */}
          {language === 'de' && (
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">
                  Bảng Danh từ & Giống trong câu:
                </span>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="text-[#38bdf8]">der (Đực)</span>
                  <span className="text-[#fb7185]">die (Cái)</span>
                  <span className="text-[#34d399]">das (Trung)</span>
                </div>
              </div>

              {analysis?.nounsInSentence?.length === 0 ? (
                <div className="p-4 bg-surface-container-high/40 rounded-xl text-center text-xs text-outline">
                  Câu này không chứa danh từ độc lập hoặc là câu ngắn gồm đại từ và động từ.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-container-high text-outline font-semibold border-b border-outline-variant/30">
                        <th className="p-2.5">Danh từ</th>
                        <th className="p-2.5">Giống & Mạo từ</th>
                        <th className="p-2.5">Dạng số nhiều</th>
                        <th className="p-2.5">Nghĩa tiếng Việt</th>
                        <th className="p-2.5">Quy tắc gợi ý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest/60">
                      {analysis?.nounsInSentence?.map((noun, idx) => {
                        const style = getGenderStyles(noun.gender);
                        return (
                          <tr key={idx} className="hover:bg-surface-container-high/50 transition-colors">
                            <td className="p-2.5 font-bold text-on-surface flex items-center gap-1.5">
                              <span>{noun.word}</span>
                              <button
                                type="button"
                                onClick={() => handleSpeak(`${noun.article} ${noun.word}`)}
                                className="text-secondary hover:underline cursor-pointer"
                                title={`Nghe "${noun.article} ${noun.word}"`}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="p-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.pillClass}`}>
                                {style.article} ({noun.gender})
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-primary">
                              {noun.plural || '-'}
                            </td>
                            <td className="p-2.5 text-on-surface font-medium">
                              {noun.vi || '-'}
                            </td>
                            <td className="p-2.5 text-[11px] text-outline">
                              {noun.reason || 'Từ vựng thông dụng'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-headline font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>

      </div>
    </div>
  );
}
