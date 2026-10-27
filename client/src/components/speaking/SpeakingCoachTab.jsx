import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic, MicOff, Volume2, ArrowLeft, CheckCircle2, Award
} from 'lucide-react';
import {
  GERMAN_SPEAKING_DRILLS,
  analyzeSpeechPhonetics
} from '../../utils/speakingCoachEngine';
import { useShadowingRecorder } from '../../hooks/useShadowingRecorder';
import { speakWord } from '../../utils/pronunciationGuide';
import SpeakingWordModal from './SpeakingWordModal';
import SpeakingResultSection from './SpeakingResultSection';

export default function SpeakingCoachTab({
  currentVideo,
  currentUser,
  onBackToStudio,
  onRecordSpeakingReward
}) {
  const [activeCategoryId, setActiveCategoryId] = useState('umlaute');
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0);
  const [customText, setCustomText] = useState('');
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [selectedWordEval, setSelectedWordEval] = useState(null);

  const {
    isRecording,
    recordSeconds,
    recognizedText,
    startRecording,
    stopRecording,
    resetAudio
  } = useShadowingRecorder('de');

  // Build active sentence list based on category
  const activeSentences = useMemo(() => {
    if (activeCategoryId === 'custom') {
      return customText.trim()
        ? [{ id: 'custom-1', de: customText.trim(), vi: 'Câu tùy chọn của bạn', focus: 'Tự luyện phát âm' }]
        : [];
    }
    if (activeCategoryId === 'synced_video' && currentVideo?.segments?.length > 0) {
      return currentVideo.segments.slice(0, 20).map((s, idx) => ({
        id: `video-${idx}`,
        de: s.text,
        vi: s.vi || `Câu số ${idx + 1} từ ${currentVideo.title || 'bài học hiện tại'}`,
        focus: 'Theo nhịp bài học DW'
      }));
    }
    const cat = GERMAN_SPEAKING_DRILLS.find((c) => c.categoryId === activeCategoryId);
    return cat ? cat.sentences : GERMAN_SPEAKING_DRILLS[0].sentences;
  }, [activeCategoryId, customText, currentVideo]);

  const currentSentence = activeSentences[selectedSentenceIndex] || activeSentences[0];

  // Reset when sentence changes
  useEffect(() => {
    resetAudio();
    setDiagnosticResult(null);
  }, [selectedSentenceIndex, activeCategoryId, resetAudio]);

  const handleSpeak = (speed = 0.85) => {
    if (currentSentence?.de) {
      speakWord(currentSentence.de, 'de', speed);
    }
  };

  const handleStopAndEvaluate = () => {
    stopRecording((spoken) => {
      const target = currentSentence?.de || '';
      const textToEval = (spoken || recognizedText || '').trim();
      const result = analyzeSpeechPhonetics(target, textToEval);
      setDiagnosticResult(result);

      if (onRecordSpeakingReward) {
        onRecordSpeakingReward({
          score: result.score,
          targetText: target,
          spokenText: textToEval
        });
      }
    });
  };

  const handleSelfValidate = () => {
    if (!currentSentence?.de) return;
    const result = analyzeSpeechPhonetics(currentSentence.de, currentSentence.de);
    setDiagnosticResult({ ...result, score: 92, generalTip: '⭐ Tự xác nhận phát âm to, rõ ràng và chuẩn xác!' });
    if (onRecordSpeakingReward) {
      onRecordSpeakingReward({
        score: 92,
        targetText: currentSentence.de,
        spokenText: currentSentence.de
      });
    }
  };

  const handleNextSentence = () => {
    if (selectedSentenceIndex < activeSentences.length - 1) {
      setSelectedSentenceIndex(prev => prev + 1);
    } else {
      setSelectedSentenceIndex(0);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-16 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudio}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Quay lại Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-on-surface font-headline">
                AI Huấn luyện Phát âm chuyên sâu
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30">
                Coach
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Phân tích từng âm vị, phát hiện thiếu Umlaut (Ö/Ä/Ü) và hướng dẫn khẩu hình chuẩn Đức
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-container/20 border border-secondary/30 text-secondary text-xs font-semibold">
          <Award className="w-4 h-4 text-secondary shrink-0" />
          <span>Điểm ≥90% nhận huy hiệu &apos;Giọng nói bản xứ&apos; 🗣️</span>
        </div>
      </div>

      {/* Drill Categories selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {GERMAN_SPEAKING_DRILLS.map((cat) => (
          <button
            key={cat.categoryId}
            type="button"
            onClick={() => {
              setActiveCategoryId(cat.categoryId);
              setSelectedSentenceIndex(0);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeCategoryId === cat.categoryId
                ? 'bg-secondary-container text-on-secondary-container border-secondary/50 shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
            }`}
          >
            <span>{cat.categoryIcon}</span>
            <span>{cat.categoryTitle}</span>
          </button>
        ))}

        {currentVideo?.segments?.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setActiveCategoryId('synced_video');
              setSelectedSentenceIndex(0);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
              activeCategoryId === 'synced_video'
                ? 'bg-secondary-container text-on-secondary-container border-secondary/50 shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
            }`}
          >
            <span>📺</span>
            <span>Từ video đang học ({currentVideo.segments.length})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveCategoryId('custom');
            setSelectedSentenceIndex(0);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
            activeCategoryId === 'custom'
              ? 'bg-secondary-container text-on-secondary-container border-secondary/50 shadow-xs'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container'
          }`}
        >
          <span>✍️</span>
          <span>Tự nhập câu</span>
        </button>
      </div>

      {/* Custom Sentence Input Form */}
      {activeCategoryId === 'custom' && (
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2.5">
          <label className="text-xs font-bold text-on-surface">Nhập câu tiếng Đức bạn muốn luyện:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="VD: Entschuldigung, wie spät ist es?..."
              className="flex-1 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
            <button
              type="button"
              disabled={!customText.trim()}
              onClick={() => setSelectedSentenceIndex(0)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Luyện câu này
            </button>
          </div>
        </div>
      )}

      {/* Main Practice Card */}
      {currentSentence && (
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-md flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
              Câu {selectedSentenceIndex + 1} / {activeSentences.length}
            </span>
            {currentSentence.focus && (
              <span className="text-xs text-tertiary font-medium bg-tertiary/10 px-2.5 py-1 rounded-md border border-tertiary/20">
                Trọng tâm: {currentSentence.focus}
              </span>
            )}
          </div>

          {/* Sentence Display & Translation */}
          <div className="flex flex-col gap-1.5">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface leading-snug">
              {currentSentence.de}
            </div>
            <p className="text-sm text-on-surface-variant italic font-medium">
              „{currentSentence.vi}“
            </p>
          </div>

          {/* Audio Reference Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => handleSpeak(0.85)}
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-secondary" />
              <span>Nghe mẫu chuẩn (1.0x)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSpeak(0.65)}
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <span>🐢</span>
              <span>Nghe chậm (0.75x)</span>
            </button>
          </div>

          {/* Interactive Recording Area */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 gap-4">
            {!isRecording ? (
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                  title="Nhấn để bắt đầu ghi âm phát âm của bạn"
                >
                  <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </button>
                <div className="text-center">
                  <span className="text-xs font-bold text-on-surface block">
                    Nhấn vào micro để đọc to câu trên
                  </span>
                  <span className="text-[11px] text-outline">
                    AI sẽ phân tích từng từ và chỉ ra âm sai
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-2 text-error animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-error animate-ping"></div>
                  <span className="text-xs font-bold">Đang lắng nghe... ({recordSeconds}s)</span>
                </div>
                {recognizedText && (
                  <div className="w-full max-w-lg p-3 rounded-xl bg-surface-container text-xs text-center text-on-surface font-transcription border border-outline-variant/30">
                    <span className="text-[10px] text-outline block mb-1">Văn bản nhận diện:</span>
                    <span className="text-secondary font-bold">„{recognizedText}“</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleStopAndEvaluate}
                  className="px-6 py-2.5 rounded-full bg-error text-on-error hover:bg-error/90 active:scale-95 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Dừng & Chẩn đoán âm vị</span>
                </button>
              </div>
            )}

            {/* Self-validation fallback button */}
            {!isRecording && !diagnosticResult && (
              <button
                type="button"
                onClick={handleSelfValidate}
                className="text-[11px] text-outline hover:text-secondary flex items-center gap-1.5 transition-colors cursor-pointer mt-1"
                title="Bấm nếu trình duyệt không hỗ trợ Web Speech API để vẫn nhận thưởng điểm và XP"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tôi đã tự đọc to chuẩn câu này (Nhận thưởng)</span>
              </button>
            )}
          </div>

          {/* Diagnostic Result Section */}
          <SpeakingResultSection
            diagnosticResult={diagnosticResult}
            onSelectWord={setSelectedWordEval}
            onRetry={() => {
              setDiagnosticResult(null);
              resetAudio();
            }}
            onNextSentence={handleNextSentence}
          />
        </div>
      )}

      {/* Word Detail & Mouth Posture Modal */}
      {selectedWordEval && (
        <SpeakingWordModal
          wordEval={selectedWordEval}
          onClose={() => setSelectedWordEval(null)}
        />
      )}
    </div>
  );
}
