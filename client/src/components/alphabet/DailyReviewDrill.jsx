import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  RotateCcw,
  Star,
  X
} from 'lucide-react';
import { generateDailyReviewSession, generateTargeted5Quiz } from '../../utils/alphabetReviewEngine';
import { speakWord, stopCurrentAudio } from '../../utils/pronunciationGuide';
import DrillCompletionModal from './DrillCompletionModal';
import DrillQuestionCard from './DrillQuestionCard';

export default function DailyReviewDrill({
  userStarredIds = [],
  onComplete,
  onClose,
  currentUser,
  targetFeaturedSounds = null,
  drillTitle = null,
  rewardXp = 30
}) {
  const safeStarredIds = Array.isArray(userStarredIds) ? userStarredIds : [];
  const [questions, setQuestions] = useState(() => {
    if (targetFeaturedSounds && targetFeaturedSounds.length > 0) {
      return generateTargeted5Quiz(targetFeaturedSounds);
    }
    return generateDailyReviewSession(safeStarredIds, 8);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResultText, setVoiceResultText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState(null);
  const recognitionRef = useRef(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const playCurrentAudio = (speed = 0.85) => {
    if (!currentQ || !currentQ.audioText) return;
    setIsPlayingAudio(true);
    speakWord(currentQ.audioText, currentQ.audioLang || 'de', speed)
      .finally(() => setIsPlayingAudio(false));
  };

  useEffect(() => {
    if (currentQ?.audioText && currentQ?.type !== 'voice_challenge') {
      const timer = setTimeout(() => {
        playCurrentAudio(0.85);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQ]);

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ Web Speech API.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setVoiceResultText(`Bạn vừa nói: "${transcript}"`);

      const cleanWord = currentQ.targetWord.toLowerCase().replace(/[^a-zäöüß]/g, '');
      const cleanTranscript = transcript.toLowerCase().replace(/[^a-zäöüß]/g, '');

      if (cleanTranscript.includes(cleanWord) || cleanWord.includes(cleanTranscript)) {
        setVoiceStatus('matched');
        setIsAnswered(true);
        setCorrectCount(prev => prev + 1);
      } else {
        setVoiceStatus('unmatched');
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setVoiceResultText('Không bắt được giọng nói. Vui lòng thử lại!');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    setVoiceResultText('Đang lắng nghe bạn nói...');
    setVoiceStatus(null);
    try {
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleSelfValidateVoice = () => {
    setIsAnswered(true);
    setVoiceStatus('matched');
    setCorrectCount(prev => prev + 1);
  };

  const handleSkipVoice = () => {
    setIsAnswered(true);
    setVoiceStatus('skipped');
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    setIsAnswered(false);
    setVoiceResultText('');
    setVoiceStatus(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete(correctCount, questions.length);
      }
    }
  };

  const handleRestart = () => {
    const newQuestions = targetFeaturedSounds && targetFeaturedSounds.length > 0
      ? generateTargeted5Quiz(targetFeaturedSounds)
      : generateDailyReviewSession(safeStarredIds, 8);

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsCompleted(false);
    setVoiceResultText('');
    setVoiceStatus(null);
  };

  if (isCompleted) {
    return (
      <DrillCompletionModal
        drillTitle={drillTitle}
        correctCount={correctCount}
        totalQuestions={questions.length}
        rewardXp={rewardXp}
        onRestart={handleRestart}
        onClose={onClose}
      />
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="bg-[#0b1120] text-on-surface rounded-2xl border border-outline-variant/30 p-5 md:p-7 shadow-2xl max-w-xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header: Progress & Close Button */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-secondary text-xs font-bold font-headline">
            {currentQ?.categoryTag || 'Ôn tập'}
          </span>
          <span className="text-xs text-outline font-medium">
            Câu {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Title & Instruction */}
      <div className="text-center mb-6">
        <h4 className="text-lg md:text-xl font-bold font-headline text-on-surface mb-2">
          {currentQ?.title}
        </h4>
        <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto">
          {currentQ?.instruction}
        </p>
      </div>

      {/* Audio Playback Button */}
      {currentQ?.audioText && currentQ?.type !== 'voice_challenge' && (
        <div className="flex flex-col items-center justify-center mb-6">
          <button
            type="button"
            onClick={() => playCurrentAudio(0.85)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isPlayingAudio
                ? 'bg-secondary text-on-secondary ring-4 ring-secondary/30 scale-105'
                : 'bg-surface-container-high hover:bg-secondary/20 hover:text-secondary text-on-surface'
            }`}
          >
            <Volume2 className="w-8 h-8" />
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

      {/* Question Options / Voice Challenge / Explanation */}
      <DrillQuestionCard
        currentQ={currentQ}
        playCurrentAudio={playCurrentAudio}
        handleToggleVoice={handleToggleVoice}
        isRecording={isRecording}
        voiceResultText={voiceResultText}
        voiceStatus={voiceStatus}
        isAnswered={isAnswered}
        handleSelfValidateVoice={handleSelfValidateVoice}
        handleSkipVoice={handleSkipVoice}
        selectedOptionId={selectedOptionId}
        handleSelectOption={handleSelectOption}
        handleNext={handleNext}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
      />
    </div>
  );
}
