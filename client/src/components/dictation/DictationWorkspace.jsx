import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, RotateCcw, CheckCircle2, ChevronRight, HelpCircle, Eye, Sparkles } from 'lucide-react';
import { insertCharToInput } from '../../utils/germanUtils';
import { compareSentence, computeLiveStream } from '../../utils/textDiff';
import { extractProperNouns } from '../../utils/properNouns';
import GrammarAnalysisModal from '../grammar/GrammarAnalysisModal';
import SpecialCharToolbar from './SpecialCharToolbar';
import DictationFeedbackView from './DictationFeedbackView';

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
  onToggleStrictGerman,
  isLiveCheck: propIsLiveCheck,
  onToggleLiveCheck
}) {
  const [userInput, setUserInput] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [localStrictGerman, setLocalStrictGerman] = useState(true);
  const strictGerman = propStrictGerman !== undefined ? propStrictGerman : localStrictGerman;
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [localLiveCheck, setLocalLiveCheck] = useState(true);
  const isLiveCheck = propIsLiveCheck !== undefined ? propIsLiveCheck : localLiveCheck;
  const inputRef = useRef(null);

  const handleToggleStrict = (val) => {
    if (onToggleStrictGerman) {
      onToggleStrictGerman(val);
    } else {
      setLocalStrictGerman(val);
    }
  };

  const handleToggleLiveCheck = (val) => {
    if (onToggleLiveCheck) {
      onToggleLiveCheck(val);
    } else {
      setLocalLiveCheck(val);
    }
  };

  // Reset states when moving to a new sentence
  useEffect(() => {
    setUserInput('');
    setDiffResult(null);
    setShowHint(false);
    setShowSolution(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [segmentIndex, activeSegment]);

  // Extract proper nouns for helper chips
  const properNouns = useMemo(() => {
    if (!activeSegment || !activeSegment.text) return [];
    return extractProperNouns(activeSegment.text);
  }, [activeSegment]);

  // Real-time live check stream
  const liveStream = useMemo(() => {
    if (!isLiveCheck || !activeSegment || !activeSegment.text) return null;
    return computeLiveStream(userInput, activeSegment.text, { strictGerman });
  }, [isLiveCheck, userInput, activeSegment, strictGerman]);

  const handleInsertChar = (char) => {
    if (!inputRef.current) return;
    const { newText, newCursorPos } = insertCharToInput(
      userInput,
      inputRef.current.selectionStart,
      inputRef.current.selectionEnd,
      char
    );
    setUserInput(newText);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleInsertProperNoun = (name) => {
    if (!inputRef.current) return;
    const current = userInput.trimEnd();
    const newText = current ? `${current} ${name} ` : `${name} `;
    setUserInput(newText);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newText.length, newText.length);
      }
    }, 0);
  };

  const handleCheckAnswer = () => {
    if (!activeSegment || !userInput.trim()) return;

    const result = compareSentence(userInput, activeSegment.text, {
      language,
      strictGerman,
      caseSensitive: strictGerman
    });

    setDiffResult(result);

    if (result.score >= 80 && onCompleteSentence) {
      onCompleteSentence(segmentIndex, result.score);
    }
  };

  const handleAdvance = () => {
    if (segmentIndex < totalSegments - 1) {
      onNextSegment();
    } else if (onCompleteSentence) {
      onCompleteSentence(segmentIndex, diffResult?.score || 100);
    }
  };

  const isStandardMet = useMemo(() => {
    if (diffResult && diffResult.score >= 80) return true;
    if (isLiveCheck && liveStream && liveStream.isComplete && liveStream.score >= 80) return true;
    return false;
  }, [diffResult, isLiveCheck, liveStream]);

  // Global Hotkey Tab -> Replay segment
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (onReplaySegment) {
          onReplaySegment();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onReplaySegment]);

  // Handle Enter key inside textarea
  const handleKeyDown = (e) => {
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

      {/* German Special Characters Virtual Keyboard & Toggles */}
      <SpecialCharToolbar
        language={language}
        properNouns={properNouns}
        onInsertChar={handleInsertChar}
        onInsertProperNoun={handleInsertProperNoun}
        isLiveCheck={isLiveCheck}
        onToggleLiveCheck={handleToggleLiveCheck}
        strictGerman={strictGerman}
        onToggleStrict={handleToggleStrict}
      />

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

      {/* Diff Result Breakdown Card and Live Stream Badges */}
      <DictationFeedbackView
        isLiveCheck={isLiveCheck}
        liveStream={liveStream}
        diffResult={diffResult}
        onOpenGrammar={() => setShowGrammarModal(true)}
        onAdvance={handleAdvance}
        segmentIndex={segmentIndex}
        totalSegments={totalSegments}
        isStandardMet={isStandardMet}
      />

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
