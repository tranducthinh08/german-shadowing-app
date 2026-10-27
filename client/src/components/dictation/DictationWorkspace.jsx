import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, CheckCircle2, ChevronRight, HelpCircle, Eye, Sparkles, Tag, AlertTriangle, BookOpen, Check, X, Zap } from 'lucide-react';
import { GERMAN_SPECIAL_CHARS, insertCharToInput } from '../../utils/germanUtils';
import { compareSentence, computeLiveStream } from '../../utils/textDiff';
import { extractProperNouns } from '../../utils/properNouns';
import GrammarAnalysisModal from '../grammar/GrammarAnalysisModal';

export default function DictationWorkspace({
  activeSegment,
  segmentIndex,
  totalSegments,
  onNextSegment,
  onPrevSegment,
  onReplaySegment,
  onReplaySlow,
  isLooping,
  onToggleLoop,
  language = 'de',
  onCompleteSentence,
  strictGerman: propStrictGerman,
  onToggleStrictGerman
}) {
  const [userInput, setUserInput] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [localStrictGerman, setLocalStrictGerman] = useState(true);
  const strictGerman = propStrictGerman !== undefined ? propStrictGerman : localStrictGerman;
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [isLiveCheck, setIsLiveCheck] = useState(() => {
    try {
      const saved = localStorage.getItem('polyglot_dictation_live_check');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const inputRef = useRef(null);

  const handleToggleStrict = (val) => {
    if (onToggleStrictGerman) {
      onToggleStrictGerman(val);
    } else {
      setLocalStrictGerman(val);
    }
  };

  const handleToggleLiveCheck = (val) => {
    setIsLiveCheck(val);
    try {
      localStorage.setItem('polyglot_dictation_live_check', JSON.stringify(val));
    } catch (e) {}
  };

  // Compute live word-by-word streaming validation against ground truth
  const liveStream = useMemo(() => {
    if (!isLiveCheck || !activeSegment?.text) return null;
    return computeLiveStream(userInput, activeSegment.text, {
      strictCase: language === 'de' && strictGerman,
      strictGermanUmlauts: strictGerman
    });
  }, [userInput, activeSegment?.text, isLiveCheck, language, strictGerman]);

  // Determine if the answer has met standard (100% or passing score >= 80, or 100% on live check)
  const isStandardMet = Boolean(
    (diffResult && (diffResult.score === 100 || diffResult.isPerfect || diffResult.score >= 80)) ||
    (isLiveCheck && liveStream && liveStream.isComplete)
  );

  // Auto-record completion when liveStream hits 100%
  useEffect(() => {
    if (isLiveCheck && liveStream?.isComplete && onCompleteSentence && activeSegment?.id) {
      onCompleteSentence(activeSegment.id, 100);
    }
  }, [liveStream?.isComplete, isLiveCheck, activeSegment?.id, onCompleteSentence]);

  const handleAdvance = () => {
    if (segmentIndex < totalSegments - 1) {
      onNextSegment();
    }
  };

  // Check answer
  const handleCheckAnswer = (e) => {
    if (e) e.preventDefault();
    if (!activeSegment || !userInput.trim()) return;

    const result = compareSentence(userInput, activeSegment.text, {
      strictCase: language === 'de' && strictGerman,
      strictGermanUmlauts: strictGerman
    });

    setDiffResult(result);

    if ((result.isPerfect || result.score === 100) && onCompleteSentence) {
      onCompleteSentence(activeSegment.id, result.score);
    }

    // Keep textarea focused so user can press Enter immediately to advance or edit
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Global hotkeys listener:
  // - Tab: Replay current segment
  // - Enter: If standard is met (100% or >=80), automatically jump to next segment!
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (showGrammarModal) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        onReplaySegment();
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isStandardMet) {
          e.preventDefault();
          handleAdvance();
          return;
        }

        // If user is focused elsewhere and there is unsubmitted text
        if (document.activeElement !== inputRef.current && userInput.trim() && !diffResult) {
          e.preventDefault();
          handleCheckAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isStandardMet, showGrammarModal, onReplaySegment, segmentIndex, totalSegments, userInput, diffResult]);

  // Extract proper nouns for hint bar
  const properNouns = activeSegment ? extractProperNouns(activeSegment.text, language) : [];

  // Handle German special character insertion
  const handleInsertChar = (char) => {
    insertCharToInput(inputRef.current, char, userInput, setUserInput);
  };

  // Handle proper noun insertion
  const handleInsertProperNoun = (noun) => {
    insertCharToInput(inputRef.current, noun + ' ', userInput, setUserInput);
  };

  // Keyboard shortcut listener in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onReplaySegment();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStandardMet) {
        handleAdvance();
      } else {
        handleCheckAnswer();
      }
    }
  };

  if (!activeSegment) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-surface-container/70 border border-outline-variant/30 rounded-2xl text-center text-outline">
        <Sparkles className="w-8 h-8 text-secondary mb-2 animate-pulse" />
        <h3 className="text-base font-headline font-semibold text-on-surface">Chưa chọn câu học</h3>
        <p className="text-xs mt-1">Chọn một câu từ danh sách phụ đề hoặc phát video để bắt đầu nghe chép chính tả.</p>
      </div>
    );
  }

  // Generate masked hint (e.g. "H____! I__ b__ N___.")
  const getHintText = () => {
    return activeSegment.text
      .split(' ')
      .map((word) => {
        if (word.length <= 1) return word;
        return word[0] + '_'.repeat(word.length - 1);
      })
      .join(' ');
  };

  return (
    <div className="flex flex-col rounded-2xl bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 p-4 sm:p-5 shadow-xl transition-all gap-3.5">
      
      {/* Top Header: Progress & Audio Replay Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-headline font-bold text-xs shadow-xs">
            Câu {segmentIndex + 1} / {totalSegments}
          </span>
          <span className="text-xs text-outline font-mono">
            {activeSegment.start.toFixed(1)}s - {activeSegment.end.toFixed(1)}s
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onReplaySegment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Nhấn phím Tab hoặc click để nghe lại câu"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Nghe lại</span>
            <kbd className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">Tab</kbd>
          </button>

          <button
            type="button"
            onClick={onReplaySlow}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-bright text-xs font-semibold transition-all cursor-pointer border border-outline-variant/30"
            title="Nghe chậm 0.75x"
          >
            <RotateCcw className="w-3 h-3 text-secondary" />
            <span>0.75x</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-bright text-xs font-medium transition-all cursor-pointer border border-outline-variant/30"
            title="Gợi ý chữ cái đầu"
          >
            <HelpCircle className="w-3 h-3 text-secondary" />
            <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container text-outline hover:text-on-surface hover:bg-surface-bright text-xs font-medium transition-all cursor-pointer border border-outline-variant/30"
            title="Xem đáp án câu gốc"
          >
            <Eye className="w-3 h-3 text-tertiary" />
            <span>{showSolution ? 'Ẩn đáp án' : 'Đáp án'}</span>
          </button>
        </div>
      </div>

      {/* Hint Banner if toggled */}
      {showHint && (
        <div className="p-3 bg-secondary-container/15 border border-secondary/30 rounded-xl text-secondary text-xs font-mono tracking-wider shadow-xs">
          💡 Gợi ý chữ cái đầu: {getHintText()}
        </div>
      )}

      {/* Solution Banner if toggled */}
      {showSolution && (
        <div className="p-3 bg-tertiary-container/20 border border-tertiary/40 rounded-xl text-tertiary-fixed text-xs font-medium shadow-xs">
          📖 Đáp án gốc: <strong className="text-on-surface font-semibold">{activeSegment.text}</strong>
        </div>
      )}

      {/* Proper Nouns Hint Bar */}
      {properNouns.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs">
          <span className="font-semibold text-secondary flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-secondary" />
            <span>Tên riêng:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {properNouns.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleInsertProperNoun(name)}
                className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-xs flex items-center gap-1 cursor-pointer border border-outline-variant/30"
                title={`Nhấn để chèn "${name}"`}
              >
                <span>{name}</span>
                <span className="text-[10px] text-secondary font-bold">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* German Special Characters Virtual Keyboard & Toggles */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {language === 'de' && (
          <>
            <span className="text-outline text-xs mr-0.5">Ký tự Đức:</span>
            {GERMAN_SPECIAL_CHARS.map(({ char, label }) => (
              <button
                key={char}
                type="button"
                onClick={() => handleInsertChar(char)}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-headline font-bold text-xs flex items-center justify-center transition-all shadow-xs cursor-pointer border border-outline-variant/30 active:scale-95"
                title={`Chèn ký tự ${char}`}
              >
                {label}
              </button>
            ))}
            <span className="text-outline-variant mx-1">|</span>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* Live Check Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-outline cursor-pointer select-none hover:text-on-surface transition-colors" title="Bật/tắt kiểm tra từ Xanh/Đỏ ngay khi gõ">
            <input
              type="checkbox"
              checked={isLiveCheck}
              onChange={(e) => handleToggleLiveCheck(e.target.checked)}
              className="rounded bg-surface-container border-outline-variant text-secondary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-secondary" />
              <span>Kiểm tra tức thì (Xanh/Đỏ)</span>
            </span>
          </label>

          {language === 'de' && (
            <label className="flex items-center gap-1.5 text-xs text-outline cursor-pointer select-none hover:text-on-surface transition-colors">
              <input
                type="checkbox"
                checked={strictGerman}
                onChange={(e) => handleToggleStrict(e.target.checked)}
                className="rounded bg-surface-container border-outline-variant text-secondary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Bắt buộc viết hoa danh từ</span>
            </label>
          )}
        </div>
      </div>

      {/* Transcription Textarea Card */}
      <div className="rounded-xl bg-surface-container p-3.5 shadow-sm border border-outline-variant/40 focus-within:border-secondary transition-all flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-outline text-xs">
          <span className="text-secondary font-medium">
            Khung chép chính tả (Nghe và gõ tiếng {language === 'de' ? 'Đức' : 'Anh'})
          </span>
          <span className="font-mono">{userInput.length} ký tự</span>
        </div>

        <textarea
          ref={inputRef}
          rows={3}
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            // Clear diffResult when user edits so they can re-check their new input
            if (diffResult) {
              setDiffResult(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            language === 'de'
              ? "Nghe và gõ lại câu bạn nghe được... (Tab: nghe lại, Enter: nộp bài)"
              : "Type the exact English sentence you heard... (Tab: replay, Enter: submit)"
          }
          className="w-full min-h-[85px] bg-surface-container-lowest/80 rounded-lg p-3 text-on-surface font-transcription text-sm sm:text-base leading-relaxed outline-none border border-outline-variant/20 focus:border-secondary/40 transition-all resize-none shadow-inner"
        />

        {/* Live Word-by-Word Validation Stream */}
        {isLiveCheck && liveStream && liveStream.tokens.length > 0 && (
          <div className="p-3 rounded-lg bg-surface-container-lowest/90 border border-outline-variant/30 flex flex-col gap-2 transition-all">
            <div className="flex items-center justify-between text-xs text-outline">
              <span className="flex items-center gap-1.5 font-semibold text-secondary">
                <Zap className="w-3.5 h-3.5 text-secondary animate-pulse" />
                <span>Kiểm tra tức thì:</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className={liveStream.matchedCount === liveStream.totalCount ? 'text-emerald-400 font-bold' : 'text-on-surface'}>
                  {liveStream.matchedCount} / {liveStream.totalCount} từ đúng
                </span>
                <span className="text-outline-variant">•</span>
                <span className="font-bold text-secondary">{liveStream.score}%</span>
              </div>
            </div>

            {/* Live Token Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {liveStream.tokens.map((token, idx) => {
                if (token.status === 'correct') {
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/50 shadow-xs transition-all"
                      title="Đúng"
                    >
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{token.typedWord}</span>
                    </span>
                  );
                }

                if (token.status === 'typing') {
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-950/40 text-sky-300 border border-sky-500/50 animate-pulse shadow-xs transition-all"
                      title="Đang gõ..."
                    >
                      <span>{token.typedWord}</span>
                      <span className="text-[10px] text-sky-400 opacity-60">…</span>
                    </span>
                  );
                }

                if (token.status === 'typo') {
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/50 shadow-xs transition-all"
                      title="Sai"
                    >
                      <X className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{token.typedWord}</span>
                    </span>
                  );
                }

                if (token.status === 'wrong') {
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/50 shadow-xs transition-all"
                      title="Sai"
                    >
                      <X className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{token.typedWord}</span>
                    </span>
                  );
                }

                if (token.status === 'extra') {
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/30 text-rose-400 border border-dashed border-rose-500/40"
                      title="Từ thừa"
                    >
                      <X className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{token.typedWord} (thừa)</span>
                    </span>
                  );
                }

                // pending token
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-md text-xs text-outline/50 bg-surface-container/40 border border-dashed border-outline-variant/30 select-none"
                    title="Từ tiếp theo"
                  >
                    •••
                  </span>
                );
              })}
            </div>

            {/* Quick mini-progress bar */}
            <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all duration-300 ${
                  liveStream.isComplete ? 'bg-emerald-400' : 'bg-secondary'
                }`}
                style={{ width: `${Math.min(100, liveStream.score)}%` }}
              />
            </div>
          </div>
        )}

        {/* Input Bar Control Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="text-xs">
            {isStandardMet ? (
              <span className="text-secondary font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>
                  {liveStream?.isComplete || diffResult?.score === 100 || diffResult?.isPerfect
                    ? 'Đạt chuẩn 100%! Nhấn Enter để sang câu kế tiếp ↵'
                    : `Đạt chuẩn (${diffResult?.score || liveStream?.score}%)! Nhấn Enter để sang câu kế tiếp ↵`}
                </span>
              </span>
            ) : (
              <span className="text-outline text-[11px]">
                Nhấn <kbd className="px-1 py-0.2 rounded bg-surface-container-high text-on-surface font-mono text-[10px]">Tab</kbd> nghe lại • <kbd className="px-1 py-0.2 rounded bg-surface-container-high text-on-surface font-mono text-[10px]">Enter</kbd> nộp bài
              </span>
            )}
          </div>

          {isStandardMet ? (
            <button
              type="button"
              onClick={handleAdvance}
              className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 font-headline font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-primary/40 animate-pulse"
              title="Nhấn phím Enter hoặc click để chuyển sang câu kế tiếp"
            >
              <span>{segmentIndex < totalSegments - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài'}</span>
              <ChevronRight className="w-4 h-4" />
              <kbd className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">Enter ↵</kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={!userInput.trim()}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-inverse-primary to-secondary-container text-on-primary font-headline font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{diffResult ? 'Kiểm tra lại' : 'Nộp bài kiểm tra'}</span>
              <kbd className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">Enter ↵</kbd>
            </button>
          )}
        </div>
      </div>

      {/* Diff Result Breakdown Card */}
      {diffResult && (
        <div className="p-4 rounded-xl bg-surface-container-high/90 border border-outline-variant/40 shadow-lg flex flex-col gap-3 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline font-bold text-xs shadow-xs ${
                diffResult.score >= 90
                  ? 'bg-secondary/20 text-secondary border border-secondary/40'
                  : diffResult.score >= 70
                  ? 'bg-tertiary-container/30 text-tertiary border border-tertiary/40'
                  : 'bg-error/20 text-error border border-error/40'
              }`}>
                {diffResult.score}%
              </div>
              <div>
                <h4 className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                  {diffResult.isPerfect ? 'Hoàn hảo 100%!' : diffResult.score >= 80 ? 'Xuất sắc! Gần đúng tuyệt đối.' : 'Cần chú ý một số từ bên dưới!'}
                </h4>
                <p className="text-[11px] text-outline">
                  Đúng {diffResult.correctCount} / {diffResult.totalCount} từ • {diffResult.score >= 80 ? 'Đạt điểm chuẩn' : 'Hãy nghe lại và thử lại'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGrammarModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-primary border border-outline-variant/30 hover:bg-surface-bright transition-all cursor-pointer"
                title="Xem phân tích ngữ pháp câu này"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Ngữ pháp</span>
              </button>

              {segmentIndex < totalSegments - 1 && (
                <button
                  type="button"
                  onClick={handleAdvance}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary-container font-headline font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Nhấn phím Enter hoặc click để sang câu kế"
                >
                  <span>Câu kế</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  {isStandardMet && (
                    <kbd className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">Enter ↵</kbd>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Token-by-Token Match Visualizer (Color-Coded Feedback) */}
          <div className="p-3 rounded-lg bg-surface-container-lowest flex flex-wrap items-center gap-1.5 font-transcription text-xs sm:text-sm border border-outline-variant/20">
            {diffResult.tokens.map((token, idx) => {
              if (token.status === 'correct') {
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary font-semibold border border-secondary/30"
                    title="Chính xác"
                  >
                    {token.word}
                  </span>
                );
              }
              if (token.status === 'typo') {
                return (
                  <span
                    key={idx}
                    className="relative group/tooltip px-2 py-0.5 rounded-md bg-tertiary-container/30 text-tertiary font-bold border border-tertiary/40 flex items-center gap-1 cursor-help"
                  >
                    <span className="line-through opacity-70">{token.userInput}</span>
                    <span>➔ {token.word}</span>
                    <AlertTriangle className="w-3 h-3 text-tertiary" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/tooltip:block px-2 py-1 rounded-md bg-surface-container-highest text-on-surface text-[11px] whitespace-nowrap shadow-xl border border-outline-variant/40 z-20">
                      {token.note || 'Lưu ý chính tả hoặc quy tắc viết hoa danh từ!'}
                    </span>
                  </span>
                );
              }
              if (token.status === 'missing') {
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-error/20 text-error font-medium border border-error/30"
                    title="Từ bị bỏ sót"
                  >
                    [{token.word}]
                  </span>
                );
              }
              if (token.status === 'extra') {
                return (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-surface-container text-outline line-through border border-outline-variant/30"
                    title="Từ gõ thừa"
                  >
                    {token.userInput}
                  </span>
                );
              }
              return null;
            })}
          </div>

        </div>
      )}

      {/* Grammar Analysis Modal */}
      {showGrammarModal && activeSegment && (
        <GrammarAnalysisModal
          sentenceText={activeSegment.text}
          language={language}
          onClose={() => setShowGrammarModal(false)}
        />
      )}

    </div>
  );
}
