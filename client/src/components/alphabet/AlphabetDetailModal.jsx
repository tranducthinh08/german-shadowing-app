import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Star,
  Sparkles,
  CheckCircle2,
  Mic,
  X,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { stopCurrentAudio } from '../../utils/pronunciationGuide';
import ModalVoiceTester from './ModalVoiceTester';

export default function AlphabetDetailModal({
  selectedLetter,
  onClose,
  safeHardLetters = [],
  onToggleStar,
  featured5Sounds = [],
  daily5Progress = {},
  onToggleSoundCompleted,
  playingAudioId,
  onPlayLetter,
  onPlayPhonics,
  onPlayWord,
  onOpenReview
}) {
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingWord, setRecordingWord] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  if (!selectedLetter) return null;

  const handleTestVoice = (targetWord) => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setVoiceFeedback({
        status: 'unsupported',
        targetWord,
        message: 'Trình duyệt của bạn hiện chưa hỗ trợ Web Speech API nhận diện giọng nói. Bạn có thể bấm nút bên dưới để tự xác nhận đã đọc to.'
      });
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      setRecordingWord(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingWord(targetWord);
        setVoiceFeedback({ status: 'listening', targetWord, message: `🎙️ Đang nghe... Hãy đọc to từ "${targetWord}"!` });
      };

      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript.toLowerCase().trim();
        const target = targetWord.toLowerCase().trim();
        const isMatch = spoken.includes(target) || target.includes(spoken);

        if (isMatch) {
          setVoiceFeedback({
            status: 'correct',
            targetWord,
            message: `Xuất sắc! Bạn đã đọc "${spoken}" chuẩn xác! 🎉`
          });
        } else {
          setVoiceFeedback({
            status: 'wrong',
            targetWord,
            message: `Trình duyệt nghe thấy: "${spoken}". Hãy bấm loa nghe lại rồi thử lại nhé!`
          });
        }
      };

      recognition.onerror = (e) => {
        setIsRecording(false);
        setRecordingWord(null);
        if (e.error === 'not-allowed') {
          setVoiceFeedback({
            status: 'blocked',
            targetWord,
            message: 'Micro đang bị chặn bởi trình duyệt. Vui lòng cho phép quyền truy cập Micro trên thanh địa chỉ, hoặc bấm nút tự xác nhận bên dưới.'
          });
        } else {
          setVoiceFeedback({
            status: 'wrong',
            targetWord,
            message: 'Không thu được âm thanh rõ ràng. Bạn có thể thử lại ở nơi yên tĩnh hơn hoặc bấm tự xác nhận.'
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setRecordingWord(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setRecordingWord(null);
      setVoiceFeedback({
        status: 'wrong',
        targetWord,
        message: 'Không thể khởi động micro lúc này. Bạn có thể tự đọc to từ mẫu.'
      });
    }
  };

  const handleModalClose = () => {
    stopCurrentAudio();
    setVoiceFeedback(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={handleModalClose}
    >
      <div
        className="bg-[#0b1120] text-on-surface rounded-2xl border border-outline-variant/40 p-6 max-w-xl w-full my-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header: Letter, IPA, Star */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-outline-variant/30">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="text-2xl font-black text-on-primary">
              {selectedLetter.letter.split(' ')[0]}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-8 sm:pr-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold font-headline text-on-surface">
                Chữ "{selectedLetter.letter}"
              </h3>
              <button
                type="button"
                onClick={(e) => onToggleStar(e, selectedLetter.id)}
                className="cursor-pointer"
                title={safeHardLetters.includes(selectedLetter.id) ? 'Bỏ gắn sao' : 'Gắn sao cần ôn'}
              >
                <Star className={`w-5 h-5 ${safeHardLetters.includes(selectedLetter.id) ? 'fill-amber-400 text-amber-400' : 'text-outline hover:text-amber-400'}`} />
              </button>

              {featured5Sounds.some(f => f.id === selectedLetter.id) && (
                <button
                  type="button"
                  onClick={(e) => onToggleSoundCompleted(e, selectedLetter.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    daily5Progress.completedSoundIds?.includes(selectedLetter.id)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-surface-container-high hover:bg-emerald-500/15 text-outline hover:text-emerald-300 border border-outline-variant/30'
                  }`}
                  title={daily5Progress.completedSoundIds?.includes(selectedLetter.id) ? 'Đã hoàn thành âm này hôm nay' : 'Đánh dấu đã hoàn thành'}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${daily5Progress.completedSoundIds?.includes(selectedLetter.id) ? 'text-emerald-400' : 'text-outline'}`} />
                  <span>{daily5Progress.completedSoundIds?.includes(selectedLetter.id) ? 'Đã ôn ✓' : 'Đánh dấu ôn'}</span>
                </button>
              )}
            </div>

            <div className="text-xs text-secondary font-semibold mt-0.5">
              Tên chữ cái: "{selectedLetter.name}" • IPA: {selectedLetter.ipa}
            </div>
            <div className="text-xs text-on-surface-variant">
              Phát âm tương đương: <strong>{selectedLetter.viApprox}</strong>
            </div>
          </div>
        </div>

        {/* Dual Audio Pronunciation Modes: Letter Name vs Phonics Sound */}
        <div className="mb-4 p-3 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Button 1: Spelling Name */}
          <button
            type="button"
            onClick={(e) => onPlayLetter(e, selectedLetter)}
            className={`flex-1 p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
              playingAudioId === selectedLetter.id
                ? 'bg-secondary/20 border-secondary ring-2 ring-secondary/40 shadow-sm'
                : 'bg-surface-container-low border-outline-variant/30 hover:border-secondary/50 hover:bg-surface-container-high'
            }`}
            title="Nghe phát âm tên chữ cái khi đánh vần (VD: A, B, C, Ypsilon, Vau...)"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-on-surface flex items-center gap-1.5">
                <Volume2 className={`w-3.5 h-3.5 text-secondary shrink-0 ${playingAudioId === selectedLetter.id ? 'animate-pulse' : ''}`} />
                <span className="truncate">Tên chữ: "{selectedLetter.name}"</span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                Đánh vần bảng chữ cái
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/20 shrink-0">
              {selectedLetter.ipa}
            </span>
          </button>

          {/* Button 2: Phonics Sound */}
          <button
            type="button"
            onClick={(e) => onPlayPhonics(e, selectedLetter)}
            className={`flex-1 p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
              playingAudioId === `phonics_${selectedLetter.id}`
                ? 'bg-primary/20 border-primary ring-2 ring-primary/40 shadow-sm'
                : 'bg-surface-container-low border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high'
            }`}
            title="Nghe âm vị khi ghép vào từ vựng tiếng Đức (Phonics)"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-on-surface flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 text-primary shrink-0 ${playingAudioId === `phonics_${selectedLetter.id}` ? 'animate-pulse' : ''}`} />
                <span className="truncate">Âm vị: {selectedLetter.phonicsSound || selectedLetter.ipa}</span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                Khi đọc từ ({selectedLetter.phonicsViApprox || selectedLetter.viApprox})
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary-200 border border-primary/20 shrink-0">
              Phonics
            </span>
          </button>
        </div>

        {/* Phonics Pedagogical Note */}
        {selectedLetter.phonicsNote && (
          <div className="mb-4 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-1">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Phân biệt Tên chữ & Âm vị khi đọc từ:</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedLetter.phonicsNote}
            </p>
          </div>
        )}

        {/* Mouth Position Guidance */}
        <div className="mb-4 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary mb-1">
            <Lightbulb className="w-4 h-4 text-secondary shrink-0" />
            <span>Mẹo khẩu hình miệng chuẩn:</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {selectedLetter.mouthTip}
          </p>
        </div>

        {/* Common Mistakes */}
        {selectedLetter.commonMistake && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lỗi người học hay gặp:</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {selectedLetter.commonMistake}
            </p>
          </div>
        )}

        {/* Sample Words */}
        <div className="mb-4">
          <div className="text-xs font-bold text-on-surface mb-2">
            Từ vựng ví dụ thực tế:
          </div>
          <div className="space-y-2">
            {selectedLetter.examples?.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-outline-variant/50 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface">{ex.de}</span>
                    <span className="text-xs text-outline">{ex.ipa}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {ex.vi} • <span className="text-secondary italic">"{ex.phonetic}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => onPlayWord(e, ex.de)}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      playingAudioId === ex.de
                        ? 'bg-secondary text-on-secondary ring-2 ring-secondary/40 scale-105'
                        : 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface-variant'
                    }`}
                    title="Nghe từ này"
                  >
                    <Volume2 className={`w-4 h-4 ${playingAudioId === ex.de ? 'animate-pulse' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestVoice(ex.de)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isRecording && recordingWord === ex.de
                        ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                        : 'bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant'
                    }`}
                    title="Bấm để đọc thử từ này qua micro"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{isRecording && recordingWord === ex.de ? 'Đang nghe...' : 'Đọc thử'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice feedback message with self-validation option */}
        <ModalVoiceTester
          voiceFeedback={voiceFeedback}
          setVoiceFeedback={setVoiceFeedback}
        />

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={(e) => onToggleStar(e, selectedLetter.id)}
            className="px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer"
          >
            <Star className={`w-4 h-4 ${safeHardLetters.includes(selectedLetter.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{safeHardLetters.includes(selectedLetter.id) ? 'Bỏ đánh dấu chữ khó' : 'Lưu vào bài ôn tập'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleModalClose();
              onOpenReview();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
          >
            Vào ôn tập ngay (2p)
          </button>
        </div>
      </div>
    </div>
  );
}
