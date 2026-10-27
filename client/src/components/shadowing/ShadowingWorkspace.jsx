import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Radio
} from 'lucide-react';
import { compareSentence } from '../../utils/textDiff';
import { useShadowingRecorder } from '../../hooks/useShadowingRecorder';
import GrammarAnalysisModal from '../grammar/GrammarAnalysisModal';
import ShadowingControls from './ShadowingControls';
import ShadowingScoreCard from './ShadowingScoreCard';
import WordPronunciationDrawer from './WordPronunciationDrawer';

export default function ShadowingWorkspace({
  activeSegment,
  segmentIndex,
  totalSegments,
  onNextSegment,
  onPrevSegment,
  onReplaySegment,
  language = 'de',
  onCompleteSentence
}) {
  const [speechScore, setSpeechScore] = useState(null);
  const [isPlayingDual, setIsPlayingDual] = useState(false);
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [showAllWordsGuide, setShowAllWordsGuide] = useState(false);

  // Single-word targeted practice state
  const [practicingWord, setPracticingWord] = useState(null);
  const [isPracticingMic, setIsPracticingMic] = useState(false);
  const [practiceResults, setPracticeResults] = useState({});

  const singleWordRecognitionRef = useRef(null);
  const userAudioPlayerRef = useRef(null);

  const {
    isRecording,
    audioUrl,
    recordSeconds,
    recognizedText,
    startRecording,
    stopRecording,
    resetAudio
  } = useShadowingRecorder(language);

  const isSpeechStandardMet = Boolean(speechScore && speechScore.score >= 80);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (showGrammarModal) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        onReplaySegment();
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isSpeechStandardMet && segmentIndex < totalSegments - 1) {
          e.preventDefault();
          onNextSegment();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [onReplaySegment, isSpeechStandardMet, segmentIndex, totalSegments, onNextSegment, showGrammarModal]);

  // Reset when segment changes
  useEffect(() => {
    resetAudio();
    setSpeechScore(null);
    setPracticeResults({});
    setPracticingWord(null);
    setShowAllWordsGuide(false);
  }, [activeSegment?.id, resetAudio]);

  // Clean up single-word recognition on unmount
  useEffect(() => {
    return () => {
      if (singleWordRecognitionRef.current) {
        try { singleWordRecognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const evaluatePronunciation = (spokenText) => {
    if (!activeSegment) return;
    const recognized = (spokenText || recognizedText).trim();
    if (!recognized) {
      setSpeechScore({
        score: 65,
        tokens: [],
        note: 'Đã ghi âm giọng nói thành công!'
      });
      if (onCompleteSentence) onCompleteSentence(activeSegment.id, 65);
      return;
    }

    const diff = compareSentence(recognized, activeSegment.text, {
      strictCase: false,
      strictGermanUmlauts: true
    });

    setSpeechScore(diff);
    if (onCompleteSentence) {
      onCompleteSentence(activeSegment.id, Math.max(diff.score, 60));
    }
  };

  const handleStopRecording = () => {
    stopRecording((spoken) => {
      evaluatePronunciation(spoken);
    });
  };

  const handleDualPlayback = () => {
    if (isPlayingDual) return;
    setIsPlayingDual(true);
    onReplaySegment();

    const segmentDuration = Math.max((activeSegment.end - activeSegment.start) * 1000, 1000);
    setTimeout(() => {
      if (userAudioPlayerRef.current) {
        userAudioPlayerRef.current.currentTime = 0;
        userAudioPlayerRef.current.play();
        userAudioPlayerRef.current.onended = () => {
          setIsPlayingDual(false);
        };
      } else {
        setIsPlayingDual(false);
      }
    }, segmentDuration + 300);
  };

  const startPracticeWord = (targetWord) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ Web Speech API.');
      return;
    }

    if (singleWordRecognitionRef.current) {
      try {
        singleWordRecognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.lang = language === 'de' ? 'de-DE' : 'en-US';

    setPracticingWord(targetWord);
    setIsPracticingMic(true);

    recognition.onresult = (event) => {
      const results = Array.from(event.results[0]).map((r) => r.transcript.trim());
      const spoken = results[0] || '';
      
      const cleanTarget = targetWord.toLowerCase().replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '');
      const isMatch = results.some((trans) => {
        const cleanSpoken = trans.toLowerCase().replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, '');
        return cleanSpoken === cleanTarget || cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken);
      });

      setPracticeResults((prev) => ({
        ...prev,
        [targetWord]: {
          success: isMatch,
          recognized: spoken
        }
      }));
      setIsPracticingMic(false);
      setPracticingWord(null);
    };

    recognition.onerror = (event) => {
      console.warn('Single word practice error:', event.error);
      setIsPracticingMic(false);
      setPracticingWord(null);
    };

    recognition.onend = () => {
      setIsPracticingMic(false);
      setPracticingWord(null);
    };

    singleWordRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setIsPracticingMic(false);
      setPracticingWord(null);
    }
  };

  if (!activeSegment) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-surface-container/70 border border-outline-variant/30 rounded-2xl text-center text-outline">
        <Sparkles className="w-8 h-8 text-secondary mb-2 animate-pulse" />
        <h3 className="text-base font-headline font-semibold text-on-surface">Chưa chọn câu học</h3>
        <p className="text-xs mt-1">Chọn một câu từ danh sách phụ đề để bắt đầu luyện nói đuổi (Shadowing).</p>
      </div>
    );
  }

  const mispronouncedTokens = speechScore?.tokens
    ? speechScore.tokens.filter((t) => t.status === 'typo' || t.status === 'missing')
    : [];

  const allSentenceWords = activeSegment.text
    .split(/\s+/)
    .map((w) => w.replace(/^[.,!?;:"'„“”»«()]+|[.,!?;:"'„“”»«()]+$/g, ''))
    .filter(Boolean);

  const wordsToDisplay = showAllWordsGuide
    ? allSentenceWords.map((word) => {
        const existingToken = speechScore?.tokens?.find((t) => t.word.toLowerCase() === word.toLowerCase());
        return {
          word,
          status: existingToken ? existingToken.status : 'neutral',
          userInput: existingToken ? existingToken.userInput : null
        };
      })
    : mispronouncedTokens;

  return (
    <div className="flex flex-col rounded-2xl bg-surface-container/80 backdrop-blur-xl border border-outline-variant/30 p-4 sm:p-5 shadow-xl transition-all gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30 font-headline font-bold text-xs shadow-xs flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Nói đuổi: Câu {segmentIndex + 1} / {totalSegments}</span>
          </span>
          <span className="text-xs text-outline font-mono">
            {activeSegment.start.toFixed(1)}s - {activeSegment.end.toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrammarModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container text-primary border border-outline-variant/30 hover:bg-surface-bright transition-all cursor-pointer"
            title="Xem phân tích ngữ pháp câu này"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Ngữ pháp</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={segmentIndex === 0}
              onClick={onPrevSegment}
              className="p-1.5 rounded-full bg-surface-container text-outline hover:text-on-surface hover:bg-surface-bright disabled:opacity-30 transition-all border border-outline-variant/30 cursor-pointer"
              title="Câu trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={segmentIndex === totalSegments - 1}
              onClick={onNextSegment}
              className="p-1.5 rounded-full bg-surface-container text-outline hover:text-on-surface hover:bg-surface-bright disabled:opacity-30 transition-all border border-outline-variant/30 cursor-pointer"
              title="Câu tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Target Sentence Display Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-inner flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-outline">
          <span className="font-semibold text-secondary text-xs">
            Câu mẫu luyện nói:
          </span>
          <span className="text-[11px] font-mono text-outline">Tab: nghe lại</span>
        </div>
        <p className="text-base sm:text-xl font-headline font-bold text-on-surface leading-relaxed tracking-wide">
          „{activeSegment.text}“
        </p>
      </div>

      {/* Clean 3-Step Interactive Shadowing Controls */}
      <ShadowingControls
        onReplaySegment={onReplaySegment}
        isRecording={isRecording}
        recordSeconds={recordSeconds}
        startRecording={startRecording}
        stopRecording={handleStopRecording}
        audioUrl={audioUrl}
        isPlayingDual={isPlayingDual}
        handleDualPlayback={handleDualPlayback}
      />

      {/* Speech-to-Text Recognition Feedback & Overall Score */}
      <ShadowingScoreCard
        recognizedText={recognizedText}
        speechScore={speechScore}
        targetSentence={activeSegment?.text}
        language={language}
      />

      {/* Word-by-Word Pronunciation Correction & Practice Drawer */}
      <WordPronunciationDrawer
        wordsToDisplay={wordsToDisplay}
        language={language}
        practiceResults={practiceResults}
        isPracticingMic={isPracticingMic}
        practicingWord={practicingWord}
        startPracticeWord={startPracticeWord}
        showAllWordsGuide={showAllWordsGuide}
        setShowAllWordsGuide={setShowAllWordsGuide}
        allSentenceWords={allSentenceWords}
        mispronouncedTokens={mispronouncedTokens}
      />

      {/* Hidden User Audio Player */}
      {audioUrl && (
        <audio ref={userAudioPlayerRef} src={audioUrl} className="hidden" preload="auto" />
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
