import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle2, ListFilter, Eye, EyeOff, Sparkles, Palette, RotateCcw, BookOpen, Lock, Radio } from 'lucide-react';
import { formatTime } from '../../utils/timeFormat';
import { translateSentenceApi } from '../../services/api';
import { getGermanNounInfo, getGenderStyles } from '../../utils/germanGrammar';
import GrammarAnalysisModal from '../grammar/GrammarAnalysisModal';

export default function TranscriptList({
  sentences = [],
  activeSegmentId,
  onSelectSegment,
  onWordClick,
  completedSentenceIds = new Set(),
  currentTime = 0,
  language = 'de',
  onResetLesson,
  isBlurScript: propIsBlurScript,
  onToggleBlur,
  showGenderColors: propShowGenderColors,
  onToggleGenderColors
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localBlurScript, setLocalBlurScript] = useState(true);
  const [localGenderColors, setLocalGenderColors] = useState(true);

  const isBlurScript = propIsBlurScript !== undefined ? propIsBlurScript : localBlurScript;
  const showGenderColors = propShowGenderColors !== undefined ? propShowGenderColors : localGenderColors;

  const handleToggleBlur = () => {
    if (onToggleBlur) {
      onToggleBlur(!isBlurScript);
    } else {
      setLocalBlurScript(!localBlurScript);
    }
  };

  const handleToggleGenderColors = () => {
    if (onToggleGenderColors) {
      onToggleGenderColors(!showGenderColors);
    } else {
      setLocalGenderColors(!localGenderColors);
    }
  };

  const [translations, setTranslations] = useState({});
  const [grammarSentenceModal, setGrammarSentenceModal] = useState(null);
  const activeItemRef = useRef(null);

  // Auto-scroll active sentence into view smoothly
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeSegmentId]);

  // When a sentence is completed, auto fetch Vietnamese translation if not already provided
  useEffect(() => {
    completedSentenceIds.forEach((id) => {
      const sentence = sentences.find((s) => s.id === id);
      if (!sentence) return;

      if (sentence.translationVi && !translations[id]) {
        setTranslations((prev) => ({ ...prev, [id]: sentence.translationVi }));
        return;
      }

      if (!sentence.translationVi && !translations[id]) {
        translateSentenceApi(sentence.text, language).then((translated) => {
          if (translated) {
            setTranslations((prev) => ({ ...prev, [id]: translated }));
          }
        });
      }
    });
  }, [completedSentenceIds, sentences, language, translations]);

  const filteredSentences = sentences.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split sentence text into clickable words and punctuation
  const renderInteractiveWords = (sentenceText) => {
    const tokens = sentenceText.split(/([a-zA-ZäöüßÄÖÜ]+)/g);
    let prevWord = '';

    return tokens.map((part, index) => {
      const isWord = /^[a-zA-ZäöüßÄÖÜ]+$/.test(part);
      if (isWord) {
        const nounInfo = language === 'de' && showGenderColors ? getGermanNounInfo(part, prevWord) : null;
        prevWord = part;

        if (nounInfo) {
          const style = getGenderStyles(nounInfo.gender);
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(part);
              }}
              className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm border ${style.pillClass}`}
              title={`${style.label}: ${part} (${nounInfo.vi || nounInfo.reason}) - Click để tra từ`}
            >
              <span className="text-[9px] font-bold opacity-80 mr-1 font-mono uppercase">
                {style.article}
              </span>
              <span>{part}</span>
            </button>
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(part);
            }}
            className="hover:text-secondary hover:underline hover:bg-secondary/10 px-0.5 rounded transition-all cursor-pointer inline-block"
            title={`Tra từ "${part}"`}
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full rounded-3xl bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 overflow-hidden shadow-2xl transition-all">
      
      {/* Header & Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-outline-variant/30 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-sm sm:text-base text-on-surface">Toàn văn hội thoại theo phân đoạn</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary text-xs font-mono font-bold">
                {sentences.length} phân đoạn
              </span>
            </div>

          </div>

          {/* Reset Lesson Button */}
          {onResetLesson && (
            <button
              type="button"
              onClick={onResetLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-outline hover:text-error hover:bg-error-container/20 hover:border-error/30 text-xs font-semibold transition-all cursor-pointer border border-outline-variant/30 shadow-sm"
              title="Làm lại bài học từ đầu (đặt lại tiến độ về câu 1)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại từ đầu</span>
            </button>
          )}
        </div>

        {/* Visual Toggles & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
          {/* Toggles */}
          <div className="flex items-center gap-2">
            {/* Gender Colors Toggle */}
            <button
              type="button"
              onClick={handleToggleGenderColors}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                showGenderColors
                  ? 'bg-secondary-container/20 text-secondary border-secondary/40 shadow-xs'
                  : 'bg-surface-container text-outline border-outline-variant/30'
              }`}
              title="Tô màu danh từ theo giống: der (xanh) / die (hồng) / das (xanh lá)"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tô màu giống</span>
            </button>

            {/* Anti-spoiler Blur Toggle */}
            <button
              type="button"
              onClick={handleToggleBlur}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                isBlurScript
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-xs'
                  : 'bg-surface-container text-outline border-outline-variant/30'
              }`}
              title={isBlurScript ? 'Chế độ mờ: chỉ hiển thị câu đã hoàn thành 100%' : 'Hiện toàn bộ câu'}
            >
              {isBlurScript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isBlurScript ? 'Làm mờ' : 'Hiện hết'}</span>
            </button>
          </div>

          {/* Quick Filter Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-outline pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu thoại..."
              className="w-full pl-8 pr-3 py-1 bg-surface-container-lowest/80 text-on-surface text-xs rounded-full border border-outline-variant/30 focus:border-secondary focus:outline-none transition-all placeholder:text-outline"
            />
          </div>
        </div>
      </div>

      {/* Sentence Cards Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 max-h-[calc(100vh-320px)] min-h-[400px]">
        {filteredSentences.map((sentence, index) => {
          const isActive = sentence.id === activeSegmentId;
          const isCompleted = completedSentenceIds.has(sentence.id);
          const shouldBlur = isBlurScript && !isCompleted;
          const translationVi = translations[sentence.id] || sentence.translationVi;

          return (
            <div
              key={sentence.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => onSelectSegment(sentence)}
              className={`p-4 rounded-2xl transition-all cursor-pointer flex flex-col gap-2 relative border ${
                isActive
                  ? 'bg-surface-container-high ring-2 ring-secondary/50 border-secondary shadow-lg shadow-secondary/10'
                  : isCompleted
                  ? 'bg-surface-container/90 border-secondary/20 hover:bg-surface-container-high shadow-sm'
                  : 'bg-surface-container/60 border-outline-variant/30 hover:bg-surface-container-high/60 shadow-sm'
              }`}
            >
              {/* Card Header: Sentence Number & Time */}
              <div className="flex items-center justify-between text-xs text-outline font-semibold">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-secondary font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                      <span>Câu {String(index + 1).padStart(2, '0')}</span>
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center gap-1 text-primary font-bold">
                      <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span>Câu {String(index + 1).padStart(2, '0')} (Đang làm)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-outline">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Câu {String(index + 1).padStart(2, '0')}</span>
                    </span>
                  )}
                  <span>• {formatTime(sentence.start)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold">
                      100% Khớp
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGrammarSentenceModal(sentence.text);
                    }}
                    className="p-1 rounded-full text-outline hover:text-primary hover:bg-surface-container-highest transition-all"
                    title="Xem phân tích ngữ pháp câu này"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* German Text with Gender Highlights */}
              <div className="relative">
                <p className={`font-headline font-semibold text-sm sm:text-base leading-relaxed tracking-wide transition-all duration-300 ${
                  shouldBlur 
                    ? 'text-on-surface/80 filter blur-sm select-none' 
                    : isActive 
                    ? 'text-on-surface' 
                    : isCompleted 
                    ? 'text-on-surface' 
                    : 'text-on-surface-variant'
                }`}>
                  {renderInteractiveWords(sentence.text)}
                </p>

                {shouldBlur && (
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] text-secondary font-medium pointer-events-none">
                    (Hoàn thành câu để mở khóa)
                  </span>
                )}
              </div>

              {/* Bilingual Vietnamese Translation Reveal (Google Stitch Spec) */}
              {(isCompleted || !isBlurScript) && translationVi && (
                <p className="text-xs text-on-surface-variant pt-1 border-t border-outline-variant/20 font-body leading-normal">
                  🇻🇳 {translationVi}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Grammar Analysis Modal */}
      {grammarSentenceModal && (
        <GrammarAnalysisModal
          sentenceText={grammarSentenceModal}
          language={language}
          onClose={() => setGrammarSentenceModal(null)}
        />
      )}

    </div>
  );
}
