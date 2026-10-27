import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  Mic,
  MicOff,
  ArrowRight,
  RotateCcw,
  Star,
  X,
  Flame,
  Award,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { generateDailyReviewSession } from '../../utils/alphabetReviewEngine';
import { speakWord, stopCurrentAudio } from '../../utils/pronunciationGuide';

export default function DailyReviewDrill({
  userStarredIds = [],
  onComplete,
  onClose,
  currentUser
}) {
  const safeStarredIds = Array.isArray(userStarredIds) ? userStarredIds : [];
  const [questions, setQuestions] = useState(() => generateDailyReviewSession(safeStarredIds, 8));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResultText, setVoiceResultText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState(null); // 'matched' | 'unmatched' | null
  const recognitionRef = useRef(null);

  const currentQ = questions[currentIndex];

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  // Auto-play audio when moving to a new question
  useEffect(() => {
    if (!currentQ || isCompleted) return;

    stopCurrentAudio();
    setSelectedOptionId(null);
    setIsAnswered(false);
    setVoiceResultText('');
    setVoiceStatus(null);

    // Auto-play audio after a short delay
    const timer = setTimeout(() => {
      playCurrentAudio();
    }, 350);

    return () => {
      clearTimeout(timer);
      stopCurrentAudio();
    };
  }, [currentIndex, isCompleted]);

  const playCurrentAudio = async (speed = 0.85) => {
    if (!currentQ) return;
    const textToPlay = currentQ.audioText || currentQ.targetWord || currentQ.targetLetter;
    if (textToPlay) {
      setIsPlayingAudio(true);
      try {
        await speakWord(textToPlay, currentQ.audioLang || 'de', speed);
      } finally {
        setIsPlayingAudio(false);
      }
    }
  };

  // Handle Option Select
  const handleSelectOption = (option) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  // Handle Next Question or Finish
  const handleNext = () => {
    stopCurrentAudio();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete({
          correctCount: correctCount + (selectedOptionId && currentQ?.options?.find(o => o.id === selectedOptionId)?.isCorrect ? 1 : 0),
          totalQuestions: questions.length,
          xpEarned: 30
        });
      }
    }
  };

  // Voice recording for voice challenge
  const handleToggleVoice = () => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setVoiceResultText('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Bạn có thể bấm "Tôi đã tự đọc to" để vượt qua câu này.');
      setVoiceStatus('unmatched');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceResultText('🎙️ Đang lắng nghe... Hãy đọc to từ mẫu!');
      };

      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceResultText(`Bạn đã đọc: "${spoken}"`);

        const target = (currentQ.targetWord || '').toLowerCase().trim();
        const isMatch = spoken.includes(target) || target.includes(spoken);

        if (isMatch) {
          setVoiceStatus('matched');
          setIsAnswered(true);
          setSelectedOptionId('voice_success');
          setCorrectCount(prev => prev + 1);
        } else {
          setVoiceStatus('unmatched');
        }
      };

      recognition.onerror = (e) => {
        setIsRecording(false);
        if (e.error === 'not-allowed') {
          setVoiceResultText('Micro đang bị chặn bởi trình duyệt. Vui lòng cho phép quyền Micro hoặc bấm "Tôi đã tự đọc to".');
        } else {
          setVoiceResultText('Chưa thu được âm thanh rõ. Hãy thử lại hoặc bấm "Tôi đã tự đọc to".');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setVoiceResultText('Không thể kích hoạt micro lúc này. Bạn có thể bấm "Tôi đã tự đọc to".');
    }
  };

  const handleSelfValidateVoice = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOptionId('voice_success');
    setVoiceStatus('matched');
    setVoiceResultText('Đã xác nhận tự luyện đọc to chuẩn từ này! 🎉');
    setCorrectCount(prev => prev + 1);
  };

  const handleSkipVoice = () => {
    setIsAnswered(true);
    setSelectedOptionId('voice_success');
    handleNext();
  };

  // Restart session
  const handleRestart = () => {
    stopCurrentAudio();
    setQuestions(generateDailyReviewSession(safeStarredIds, 8));
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsCompleted(false);
    setSelectedOptionId(null);
    setIsAnswered(false);
  };

  // Render Completed View
  if (isCompleted) {
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="bg-[#0b1120] text-on-surface rounded-2xl border border-outline-variant/30 p-6 md:p-8 shadow-2xl max-w-xl mx-auto my-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">
          Xuất sắc! Hoàn thành bài ôn hôm nay!
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Bạn vừa duy trì thói quen luyện tai và chuẩn hóa phát âm chữ cái tiếng Đức.
        </p>

        {/* Score & XP Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant font-medium">Độ chính xác</span>
            <div className="text-2xl font-black text-secondary mt-1">
              {correctCount} / {questions.length} ({scorePercent}%)
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant font-medium">Thưởng kinh nghiệm</span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>+30 XP</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-6 text-left">
          <div className="flex items-center gap-2 text-secondary font-semibold text-xs mb-1">
            <Flame className="w-4 h-4" />
            <span>Mẹo ghi nhớ lâu dài:</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Hãy duy trì 2 phút ôn tập mỗi ngày để các âm như <strong>Ö, Ü, V (đọc là F), W (đọc là V), Z (bật TS)</strong> in sâu vào phản xạ nghe - nói tự nhiên của bạn!
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            onClick={handleRestart}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ôn lại phiên khác</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            <span>Về Bảng chữ cái</span>
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="bg-[#0b1120] text-on-surface rounded-2xl border border-outline-variant/40 p-5 md:p-7 shadow-2xl max-w-2xl mx-auto my-4 relative">
      {/* Top Header: Progress & Close */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-outline font-medium">
            {currentQ?.categoryTag}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
          title="Đóng phiên ôn tập"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-low h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Title & Instruction */}
      <div className="mb-6 text-center">
        <h4 className="text-base sm:text-lg font-bold font-headline text-on-surface mb-1">
          {currentQ?.title}
        </h4>
        <p className="text-xs text-on-surface-variant">
          {currentQ?.instruction}
        </p>
      </div>

      {/* Audio Play Centerpiece */}
      {currentQ?.type !== 'voice_challenge' && (
        <div className="flex flex-col items-center justify-center my-6">
          <button
            type="button"
            onClick={() => playCurrentAudio(0.85)}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
              isPlayingAudio
                ? 'bg-secondary text-on-secondary ring-4 ring-secondary/30 scale-105'
                : 'bg-primary-container text-on-primary-container hover:brightness-110 shadow-primary-container/30'
            }`}
            title="Bấm để nghe phát âm"
          >
            <Volume2 className={`w-9 h-9 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          </button>
          <span className="text-[11px] text-outline mt-2 font-medium">
            Bấm vào loa để nghe lại (hoặc nghe chậm hơn)
          </span>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => playCurrentAudio(0.65)}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-all cursor-pointer"
            >
              Tốc độ 0.65x
            </button>
            <button
              type="button"
              onClick={() => playCurrentAudio(0.85)}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-all cursor-pointer"
            >
              Chuẩn 0.85x
            </button>
          </div>
        </div>
      )}

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
              onClick={() => playCurrentAudio(0.85)}
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
                onClick={() => handleSelectOption(option)}
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
            <span>{currentIndex + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
