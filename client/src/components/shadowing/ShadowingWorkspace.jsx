import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Mic,
  Square,
  Volume2,
  Volume1,
  CheckCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Radio,
  Check,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  ListFilter
} from 'lucide-react';
import { compareSentence } from '../../utils/textDiff';
import { getWordPronunciationGuide, speakWord } from '../../utils/pronunciationGuide';
import GrammarAnalysisModal from '../grammar/GrammarAnalysisModal';

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
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechScore, setSpeechScore] = useState(null);
  const [isPlayingDual, setIsPlayingDual] = useState(false);
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [showAllWordsGuide, setShowAllWordsGuide] = useState(false);

  // Single-word targeted practice state
  const [practicingWord, setPracticingWord] = useState(null);
  const [isPracticingMic, setIsPracticingMic] = useState(false);
  const [practiceResults, setPracticeResults] = useState({});

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const singleWordRecognitionRef = useRef(null);
  const userAudioPlayerRef = useRef(null);

  // Ref to track whether user is currently recording (prevents early cutoff)
  const isRecordingRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');

  // Global Tab key to replay native sentence
  useEffect(() => {
    const handleGlobalTab = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onReplaySegment();
      }
    };
    window.addEventListener('keydown', handleGlobalTab);
    return () => window.removeEventListener('keydown', handleGlobalTab);
  }, [onReplaySegment]);

  // Reset when segment changes
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecognizedText('');
    setSpeechScore(null);
    setIsRecording(false);
    isRecordingRef.current = false;
    accumulatedTranscriptRef.current = '';
    setRecordSeconds(0);
    setPracticeResults({});
    setPracticingWord(null);
    setShowAllWordsGuide(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeSegment?.id]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (singleWordRecognitionRef.current) {
        try { singleWordRecognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Initialize Speech Recognition with continuous=true & auto-recovery
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // KEEP LISTENING through pauses!
    recognition.interimResults = true; // Capture real-time interim speech
    recognition.maxAlternatives = 1;
    recognition.lang = language === 'de' ? 'de-DE' : 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const combined = (finalTranscript + interimTranscript).trim();
      if (combined) {
        accumulatedTranscriptRef.current = combined;
        setRecognizedText(combined);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition status:', event.error);
      // If recognition paused due to momentary silence while user is still recording, auto-resume
      if (event.error === 'no-speech' && isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognition.onend = () => {
      // Auto-restart recognition if browser closed it early while recording is still active
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
  }, [language]);

  // Start recording sentence
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      isRecordingRef.current = true;
      accumulatedTranscriptRef.current = '';
      setRecognizedText('');
      setSpeechScore(null);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already running
        }
      }
    } catch (err) {
      alert('Không thể truy cập Microphone! Vui lòng kiểm tra quyền truy cập micro trong trình duyệt.');
      console.error(err);
    }
  };

  // Stop recording sentence
  const stopRecording = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      // Small delay to ensure all audio chunks and final speech recognition tokens settle
      setTimeout(() => {
        evaluatePronunciation();
      }, 400);
    }
  };

  // Evaluate pronunciation score
  const evaluatePronunciation = () => {
    if (!activeSegment) return;
    const recognized = (accumulatedTranscriptRef.current || recognizedText).trim();
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

  // Dual Playback: Native segment followed by user audio
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

  // Targeted Single-Word Practice
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

  // Filter words that were mispronounced or skipped
  const mispronouncedTokens = speechScore?.tokens
    ? speechScore.tokens.filter((t) => t.status === 'typo' || t.status === 'missing')
    : [];

  // All clean words in sentence for the comprehensive guide toggle
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

      {/* Clean 3-Step Interactive Shadowing Lab */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* STEP 1: Nghe bản ngữ */}
        <div className="p-3.5 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-surface-container text-secondary flex items-center justify-center text-[11px] font-bold">1</span>
                <span>Nghe bản ngữ</span>
              </span>
              <kbd className="px-1.5 py-0.2 rounded bg-surface-container-lowest text-[10px] text-outline font-mono">Tab</kbd>
            </div>
            <p className="text-[11px] text-outline mt-1 leading-snug">Lắng nghe ngữ điệu và trọng âm câu gốc.</p>
          </div>

          <button
            type="button"
            onClick={onReplaySegment}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-surface-container hover:bg-surface-bright border border-outline-variant/30 text-on-surface text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5 text-secondary" />
            <span>Phát câu gốc</span>
          </button>
        </div>

        {/* STEP 2: Thu âm nhại giọng */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all shadow-xs ${
          isRecording
            ? 'bg-surface-container-high border-secondary shadow-md'
            : 'bg-surface-container-high/80 border-outline-variant/30'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[11px] font-bold">2</span>
                <span>Thu âm nhại giọng</span>
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  {recordSeconds}s Đang thu...
                </span>
              )}
            </div>
            <p className="text-[11px] text-outline mt-1 leading-snug">
              Bấm mic và nói toàn bộ câu (hệ thống sẽ thu liên tục qua quãng ngắt).
            </p>
          </div>

          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-gradient-to-r from-inverse-primary to-secondary-container text-on-primary text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Bắt đầu thu âm</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-error-container text-on-error-container text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng thu & Chấm điểm</span>
            </button>
          )}
        </div>

        {/* STEP 3: Đối chiếu 2 chiều */}
        <div className="p-3.5 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-surface-container text-primary flex items-center justify-center text-[11px] font-bold">3</span>
                <span>Đối chiếu 2 chiều</span>
              </span>
              {audioUrl && (
                <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3 text-secondary" />
                  Đã có bản thu
                </span>
              )}
            </div>
            <p className="text-[11px] text-outline mt-1 leading-snug">Nghe tuần tự: Bản ngữ ➔ Giọng của bạn.</p>
          </div>

          <button
            type="button"
            disabled={!audioUrl || isPlayingDual}
            onClick={handleDualPlayback}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-full bg-surface-container hover:bg-surface-bright disabled:opacity-30 border border-outline-variant/30 text-on-surface text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-secondary font-bold">Bản ngữ</span>
            <span className="text-outline">➔</span>
            <span className="text-primary font-bold">Bạn</span>
          </button>
        </div>

      </div>

      {/* Speech-to-Text Recognition Feedback & Overall Score */}
      {(recognizedText || speechScore) && (
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
      )}

      {/* PHẦN SỬA PHÁT ÂM TỪNG TỪ RÕ RÀNG + CÁCH ĐỌC TIẾNG VIỆT + IPA + GỢI Ý KHẨU HÌNH */}
      {(mispronouncedTokens.length > 0 || showAllWordsGuide) && (
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
                      {/* Normal audio button */}
                      <button
                        type="button"
                        onClick={() => speakWord(token.word, language, 0.85)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-secondary border border-outline-variant/30 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Nghe người bản ngữ phát âm từ này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe chuẩn</span>
                      </button>

                      {/* Slow audio button 0.6x */}
                      <button
                        type="button"
                        onClick={() => speakWord(token.word, language, 0.6)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-outline hover:text-on-surface border border-outline-variant/30 text-xs font-medium transition-all cursor-pointer shadow-xs"
                        title="Nghe phát âm chậm 0.6x để bắt rõ khẩu hình"
                      >
                        <Volume1 className="w-3.5 h-3.5 text-secondary" />
                        <span>0.6x</span>
                      </button>

                      {/* Single word practice mic */}
                      <button
                        type="button"
                        onClick={() => startPracticeWord(token.word)}
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

                  {/* Comparison Note: What the user said vs Target */}
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
                            onClick={() => startPracticeWord(token.word)}
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
      )}

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
