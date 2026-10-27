import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Volume2,
  Star,
  Sparkles,
  Flame,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Mic,
  MicOff,
  X,
  Info,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { GERMAN_ALPHABET, MINIMAL_PAIRS } from '../../data/germanAlphabetData';
import { speakWord, stopCurrentAudio } from '../../utils/pronunciationGuide';
import DailyReviewDrill from './DailyReviewDrill';

export default function AlphabetTab({
  hardLetters = [],
  onToggleHardLetter,
  alphabetReviewProgress = {},
  onCompleteDailyReview,
  currentUser
}) {
  const safeHardLetters = Array.isArray(hardLetters) ? hardLetters : [];
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'standard' | 'umlaut' | 'cluster' | 'difficult' | 'starred'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Audio playing indicator state
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Auto-play all letters state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  const autoPlayTimerRef = useRef(null);

  // Micro voice test state in detail modal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingWord, setRecordingWord] = useState(null);
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const recognitionRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const isReviewedToday = alphabetReviewProgress?.lastReviewDate === today;
  const reviewStreak = alphabetReviewProgress?.reviewStreak || 0;

  // Filtered letters list
  const filteredLetters = useMemo(() => {
    return GERMAN_ALPHABET.filter((item) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchLetter = item.letter.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchVi = item.viApprox.toLowerCase().includes(q);
        const matchExamples = item.examples?.some(
          ex => ex.de.toLowerCase().includes(q) || ex.vi.toLowerCase().includes(q)
        );
        if (!matchLetter && !matchName && !matchVi && !matchExamples) {
          return false;
        }
      }

      // 2. Tab filter
      if (activeFilter === 'standard') return item.category === 'standard';
      if (activeFilter === 'umlaut') return item.category === 'umlaut';
      if (activeFilter === 'cluster') return item.category === 'cluster';
      if (activeFilter === 'difficult') return item.isDifficult;
      if (activeFilter === 'starred') return safeHardLetters.includes(item.id);

      return true; // 'all'
    });
  }, [activeFilter, searchQuery, safeHardLetters]);

  // Clean up auto-play timer and audio on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      stopCurrentAudio();
    };
  }, []);

  // Handle Auto-play sequential reading
  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      stopCurrentAudio();
      setIsAutoPlaying(false);
      setPlayingAudioId(null);
      return;
    }

    setIsAutoPlaying(true);
    let idx = 0;
    const playList = filteredLetters.length > 0 ? filteredLetters : GERMAN_ALPHABET;

    const playNext = async () => {
      if (idx >= playList.length) {
        setIsAutoPlaying(false);
        setPlayingAudioId(null);
        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
        return;
      }
      const item = playList[idx];
      setAutoPlayIndex(idx);
      setPlayingAudioId(item.id);
      await speakWord(item.ttsLetter || item.name, 'de', 0.85);
      idx++;
    };

    playNext();
    autoPlayTimerRef.current = setInterval(playNext, 1800);
  };

  // Play audio for a single item
  const handlePlayLetter = async (e, item) => {
    e?.stopPropagation();
    setPlayingAudioId(item.id);
    try {
      await speakWord(item.ttsLetter || item.name, 'de', 0.85);
    } finally {
      setTimeout(() => setPlayingAudioId(null), 300);
    }
  };

  // Play audio for an example word
  const handlePlayWord = async (e, word) => {
    e?.stopPropagation();
    setPlayingAudioId(word);
    try {
      await speakWord(word, 'de', 0.85);
    } finally {
      setTimeout(() => setPlayingAudioId(null), 300);
    }
  };

  // Toggle hard letter star
  const handleToggleStar = (e, letterId) => {
    e?.stopPropagation();
    if (onToggleHardLetter) {
      onToggleHardLetter(letterId);
    }
  };

  // Single word speech testing in detail modal
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Daily Review Drill Modal / Overlay */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            stopCurrentAudio();
            setIsReviewModalOpen(false);
          }}
        >
          <div className="w-full max-w-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <DailyReviewDrill
              userStarredIds={safeHardLetters}
              currentUser={currentUser}
              onClose={() => {
                stopCurrentAudio();
                setIsReviewModalOpen(false);
              }}
              onComplete={(results) => {
                stopCurrentAudio();
                if (onCompleteDailyReview) {
                  onCompleteDailyReview(results);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Top Banner: Stats & Call-To-Action */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container-high/90 via-surface-container/70 to-surface-container-high/90 border border-outline-variant/30 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center gap-1.5 border border-secondary/20">
                <span>🇩🇪</span>
                <span>Bảng chữ cái tiếng Đức • Deutsches Alphabet</span>
              </span>
              {reviewStreak > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{reviewStreak} ngày streak</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-headline text-on-surface tracking-tight mb-2">
              Làm chủ 26 Chữ cái & Các Cặp Âm Khó Tiếng Đức
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Bấm vào từng chữ để nghe phát âm chuẩn, xem mẹo khẩu hình miệng và các lỗi người Việt hay gặp nhất. Đánh dấu <Star className="w-3.5 h-3.5 inline text-amber-400 fill-amber-400" /> các chữ khó để đưa vào bài ôn tập hàng ngày!
            </p>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20">
                Tổng cộng: <strong className="text-on-surface">{GERMAN_ALPHABET.length}</strong> âm vị
              </span>
              <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20">
                Đã lưu cần ôn: <strong className="text-amber-400">{hardLetters.length}</strong> chữ
              </span>
              <span className="px-3 py-1 rounded-lg bg-surface-container-low text-on-surface-variant border border-outline-variant/20 flex items-center gap-1.5">
                {isReviewedToday ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Hôm nay đã hoàn thành ôn tập</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-semibold">Chưa ôn tập hôm nay</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={handleToggleAutoPlay}
              className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isAutoPlaying
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-surface-container-low border-outline-variant/40 hover:bg-surface-container-high text-on-surface'
              }`}
              title="Nghe tự động lần lượt các chữ cái"
            >
              {isAutoPlaying ? <Pause className="w-4 h-4 text-rose-400" /> : <Play className="w-4 h-4 text-secondary" />}
              <span>{isAutoPlaying ? 'Dừng đọc tự động' : 'Đọc tự động A - Z'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>{isReviewedToday ? 'Ôn tập thêm (+XP)' : 'Ôn tập mỗi ngày (2p)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-primary-container text-on-primary-container shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            Tất cả ({GERMAN_ALPHABET.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'standard'
                ? 'bg-primary-container text-on-primary-container shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            26 Chữ cái A-Z
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('umlaut')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'umlaut'
                ? 'bg-primary-container text-on-primary-container shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            Umlaute & Eszett (Ä, Ö, Ü, ß)
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('cluster')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'cluster'
                ? 'bg-primary-container text-on-primary-container shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            Cặp âm ghép (ei, ie, ch...)
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('difficult')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              activeFilter === 'difficult'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Chữ khó 🔥</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('starred')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              activeFilter === 'starred'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low border border-outline-variant/20'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Đã gắn sao ({hardLetters.length})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm chữ, IPA hoặc từ mẫu..."
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alphabet Matrix Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredLetters.map((item, idx) => {
          const isStarred = hardLetters.includes(item.id);
          const isCurrentlyPlaying = isAutoPlaying && autoPlayIndex === idx;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedLetter(item);
                setVoiceFeedback(null);
              }}
              className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                isCurrentlyPlaying
                  ? 'bg-secondary/20 border-secondary ring-2 ring-secondary/40 scale-102 shadow-lg shadow-secondary/10'
                  : 'bg-surface-container-low/90 hover:bg-surface-container-high border-outline-variant/30 hover:border-outline-variant/60 shadow-xs'
              }`}
            >
              {/* Top Row: Difficulty Tag & Star */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate ${
                  item.isDifficult
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-surface-container-high text-outline'
                }`}>
                  {item.category === 'umlaut' ? 'Umlaut' : item.category === 'cluster' ? 'Cụm âm' : item.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleToggleStar(e, item.id)}
                  className={`p-1 rounded-lg transition-transform hover:scale-120 cursor-pointer ${
                    isStarred
                      ? 'text-amber-400'
                      : 'text-outline-variant hover:text-amber-400'
                  }`}
                  title={isStarred ? 'Bỏ đánh dấu chữ khó' : 'Đánh dấu cần ôn tập'}
                >
                  <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Big Letter Display */}
              <div className="text-center my-1">
                <div className="text-2xl sm:text-3xl font-black font-headline text-on-surface group-hover:text-secondary transition-colors">
                  {item.letter}
                </div>
                <div className="text-xs font-semibold text-secondary mt-0.5">
                  {item.ipa}
                </div>
                <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                  ({item.viApprox})
                </div>
              </div>

              {/* Bottom Quick Play Button & Difficulty Alert */}
              <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between">
                <div className="text-[10px] text-outline truncate max-w-[85px]">
                  {item.examples?.[0]?.de || ''}
                </div>

                <button
                  type="button"
                  onClick={(e) => handlePlayLetter(e, item)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    playingAudioId === item.id
                      ? 'bg-secondary text-on-secondary ring-2 ring-secondary/50 scale-110 shadow-sm'
                      : 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-on-surface-variant'
                  }`}
                  title="Nghe phát âm"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === item.id ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLetters.length === 0 && (
        <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 my-6">
          <BookOpen className="w-10 h-10 text-outline mx-auto mb-3" />
          <h4 className="text-base font-bold text-on-surface mb-1">
            Không tìm thấy chữ cái phù hợp
          </h4>
          <p className="text-xs text-on-surface-variant">
            {activeFilter === 'starred'
              ? 'Bạn chưa gắn sao chữ cái nào. Hãy bấm biểu tượng ngôi sao ⭐ trên các chữ bạn muốn ôn tập!'
              : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc sang "Tất cả".'}
          </p>
        </div>
      )}

      {/* Detail Drawer / Modal for Selected Letter */}
      {selectedLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            stopCurrentAudio();
            setSelectedLetter(null);
            setVoiceFeedback(null);
          }}
        >
          <div
            className="bg-[#0b1120] text-on-surface rounded-2xl border border-outline-variant/40 p-6 max-w-xl w-full my-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopCurrentAudio();
                setSelectedLetter(null);
                setVoiceFeedback(null);
              }}
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

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-headline text-on-surface">
                    Chữ "{selectedLetter.letter}"
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(e, selectedLetter.id)}
                    className="cursor-pointer"
                    title={safeHardLetters.includes(selectedLetter.id) ? 'Bỏ gắn sao' : 'Gắn sao cần ôn'}
                  >
                    <Star className={`w-5 h-5 ${safeHardLetters.includes(selectedLetter.id) ? 'fill-amber-400 text-amber-400' : 'text-outline hover:text-amber-400'}`} />
                  </button>
                </div>

                <div className="text-xs text-secondary font-semibold mt-0.5">
                  Tên chữ cái: "{selectedLetter.name}" • IPA: {selectedLetter.ipa}
                </div>
                <div className="text-xs text-on-surface-variant">
                  Phát âm tương đương: <strong>{selectedLetter.viApprox}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handlePlayLetter(e, selectedLetter)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md cursor-pointer shrink-0 transition-all ${
                  playingAudioId === selectedLetter.id
                    ? 'bg-secondary ring-4 ring-secondary/40 scale-105 text-on-secondary'
                    : 'bg-secondary text-on-secondary hover:brightness-110'
                }`}
                title="Nghe phát âm tên chữ cái"
              >
                <Volume2 className={`w-5 h-5 ${playingAudioId === selectedLetter.id ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            {/* Mouth Position Guidance (Mẹo khẩu hình) */}
            <div className="mb-4 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary mb-1">
                <Lightbulb className="w-4 h-4 text-secondary shrink-0" />
                <span>Mẹo khẩu hình miệng chuẩn:</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {selectedLetter.mouthTip}
              </p>
            </div>

            {/* Common Mistakes (Lỗi hay gặp) */}
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

            {/* Sample Words (Từ vựng ví dụ thực tế) */}
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
                        onClick={(e) => handlePlayWord(e, ex.de)}
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

            {/* Voice feedback message with friendly self-validation option */}
            {voiceFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold mb-3 ${
                voiceFeedback.status === 'correct'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : voiceFeedback.status === 'listening'
                    ? 'bg-primary/20 text-on-primary-container border border-primary/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}>
                <div>{voiceFeedback.message}</div>
                {voiceFeedback.status !== 'correct' && voiceFeedback.status !== 'listening' && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-outline font-normal">Trình duyệt khó nhận diện giọng nói?</span>
                    <button
                      type="button"
                      onClick={() => setVoiceFeedback({
                        status: 'correct',
                        message: `Tuyệt vời! Bạn đã tự luyện đọc to chuẩn từ "${voiceFeedback.targetWord || ''}". Hãy duy trì luyện tập! 🎉`
                      })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold hover:bg-emerald-500/30 cursor-pointer"
                    >
                      ✓ Tôi đã tự đọc to chuẩn từ này
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={(e) => handleToggleStar(e, selectedLetter.id)}
                className="px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-surface-container-high flex items-center gap-1.5 cursor-pointer"
              >
                <Star className={`w-4 h-4 ${safeHardLetters.includes(selectedLetter.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{safeHardLetters.includes(selectedLetter.id) ? 'Bỏ đánh dấu chữ khó' : 'Lưu vào bài ôn tập'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCurrentAudio();
                  setSelectedLetter(null);
                  setIsReviewModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
              >
                Vào ôn tập ngay (2p)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
