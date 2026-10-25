import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Play,
  Search,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  BookOpen,
  Clock,
  ArrowRight,
  Lock,
  ChevronRight,
  Flame,
  Globe2,
  Award
} from 'lucide-react';
import { NICOS_WEG_PLAYLIST } from '../../data/nicosWegPlaylist.js';

export default function LessonsTab({
  onSelectEpisode,
  onSelectLesson,
  completedVideoIds = [],
  currentVideoId = null,
  onBackToStudio
}) {
  // Level selection: 'A1' | 'A2' | 'B1' | 'EN'
  const [activeLevel, setActiveLevel] = useState('A1');

  // Search & Filter state for A1
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');

  // Levels definition
  const levels = [
    {
      id: 'A1',
      title: 'Trình độ A1',
      subtitle: 'Nicos Weg (DW)',
      lang: '🇩🇪 Đức',
      desc: 'Người mới bắt đầu từ con số 0',
      status: 'available',
      badge: '76 tập đầy đủ',
      episodesCount: 80,
      sentencesCount: NICOS_WEG_PLAYLIST.totalSentences
    },
    {
      id: 'A2',
      title: 'Trình độ A2',
      subtitle: 'Nicos Weg (DW)',
      lang: '🇩🇪 Đức',
      desc: 'Giao tiếp đời sống & công việc cơ bản',
      status: 'preview',
      badge: 'Bản xem trước',
      episodesCount: 'Sắp ra mắt'
    },
    {
      id: 'B1',
      title: 'Trình độ B1',
      subtitle: 'Nicos Weg (DW)',
      lang: '🇩🇪 Đức',
      desc: 'Định cư & làm việc tại Đức',
      status: 'upcoming',
      badge: 'Sắp có',
      episodesCount: 'Lộ trình mới'
    },
    {
      id: 'EN',
      title: 'Tiếng Anh',
      subtitle: 'Daily Speaking',
      lang: '🇬🇧 Anh',
      desc: 'Đàm thoại giao tiếp hàng ngày',
      status: 'available',
      badge: 'Bài học mẫu',
      episodesCount: 'Tuyển chọn'
    }
  ];

  // Stage options for A1
  const stageOptions = [
    { id: 'all', label: 'Tất cả (80 tập)', min: 0, max: 999 },
    { id: 'stage1', label: 'Tập 1 – 20: Chào hỏi & Làm quen', min: 1, max: 20 },
    { id: 'stage2', label: 'Tập 21 – 40: Đời sống & Nhà ở', min: 21, max: 40 },
    { id: 'stage3', label: 'Tập 41 – 60: Mua sắm & Ăn uống', min: 41, max: 60 },
    { id: 'stage4', label: 'Tập 61 – 76: Xã hội, Gia đình & Sức khỏe', min: 61, max: 76 },
    { id: 'stage_special', label: 'Bài hát & Tổng kết', special: true }
  ];

  // Filtered A1 episodes
  const filteredA1Episodes = useMemo(() => {
    return NICOS_WEG_PLAYLIST.episodes.filter(ep => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = ep.title.toLowerCase().includes(query);
        const matchFull = ep.fullTitle.toLowerCase().includes(query);
        const matchNum = `tập ${ep.episodeNumber}`.includes(query) || `folge ${ep.episodeNumber}`.includes(query) || `${ep.episodeNumber}` === query;
        if (!matchTitle && !matchFull && !matchNum) return false;
      }

      if (selectedStage === 'all') return true;
      if (selectedStage === 'stage_special') {
        return ep.category !== 'Bài học A1' || ep.episodeNumber === 0;
      }

      const activeOpt = stageOptions.find(s => s.id === selectedStage);
      if (activeOpt && activeOpt.min !== undefined) {
        return ep.episodeNumber >= activeOpt.min && ep.episodeNumber <= activeOpt.max && ep.category === 'Bài học A1';
      }

      return true;
    });
  }, [searchQuery, selectedStage]);

  // A2 Preview lessons data
  const a2PreviewLessons = [
    {
      id: 'a2-preview-1',
      videoId: 'jPvhLhCkhB8',
      title: 'Folge 1: Was gefällt dir an Deutschland? (Berlin)',
      author: 'Easy German & DW',
      level: 'A2',
      sentencesCount: 7,
      description: 'Hỏi và trả lời về sở thích, cảm nhận khi sống tại Đức. Luyện câu ghép với weil và ngữ pháp A2.'
    },
    {
      id: 'a2-preview-2',
      videoId: '4-eDoThe6qo',
      title: 'Folge 2: Alltag und Beruf in Deutschland',
      author: 'DW Deutsch lernen',
      level: 'A2',
      sentencesCount: 8,
      description: 'Giao tiếp nơi công sở, giới thiệu kỹ năng và công việc hàng ngày.'
    }
  ];

  // English daily lessons data
  const englishLessons = [
    {
      id: 'en-1',
      videoId: 'gghSrnzS9kY',
      title: 'Lesson 1: Ordering at a Café & Coffee Shop',
      author: 'English Speaking Success',
      level: 'A2-B1',
      sentencesCount: 8,
      description: 'Cách gọi đồ uống, bánh ngọt, thanh toán thẻ không chạm và đối thoại lịch sự.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low border border-outline-variant/40 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-secondary/20 text-secondary border border-secondary/30">
                <GraduationCap className="w-3.5 h-3.5" />
                Khóa học & Giáo trình chuẩn quốc tế
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                Khung tham chiếu CEFR (A1 - A2 - B1)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Kho bài học tiếng Đức & tiếng Anh
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Chọn trình độ phù hợp với bạn để bắt đầu luyện nghe chép và nói đuổi. Toàn bộ các bài học đã được tích hợp sẵn phụ đề chuẩn, chia câu từng giây và tra cứu từ vựng tức thì.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-outline">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-on-surface">A1, A2, B1</span> lộ trình rõ ràng
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-on-surface">2.443+</span> câu đàm thoại có sẵn
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-on-surface">{completedVideoIds.length}</span> bài đã học
              </div>
            </div>
          </div>

          {onBackToStudio && (
            <button
              type="button"
              onClick={onBackToStudio}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline font-semibold text-xs border border-outline-variant/40 transition-all cursor-pointer shadow-xs hover:scale-105"
            >
              <span>Vào phòng luyện tập</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Level Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {levels.map((lvl) => {
          const isActive = activeLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setActiveLevel(lvl.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group shadow-xs ${
                isActive
                  ? 'bg-secondary-container/25 border-secondary ring-1 ring-secondary shadow-md'
                  : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 hover:border-secondary/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-headline text-on-surface group-hover:text-primary transition-colors">
                    {lvl.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-high text-secondary border border-secondary/20'
                  }`}>
                    {lvl.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-outline font-medium">
                  <span>{lvl.lang}</span>
                  <span>•</span>
                  <span>{lvl.subtitle}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant line-clamp-1 pt-0.5">
                  {lvl.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-outline-variant/20">
                <span className="text-outline font-medium">{lvl.episodesCount}</span>
                <span className={`font-bold flex items-center gap-1 ${
                  isActive ? 'text-secondary' : 'text-outline group-hover:text-on-surface'
                }`}>
                  {isActive ? 'Đang chọn' : 'Xem bài'}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CONTENT FOR LEVEL A1: NICOS WEG FULL 76 EPISODES */}
      {activeLevel === 'A1' && (
        <div className="space-y-5">
          {/* A1 Header info */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/70 border border-outline-variant/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-secondary text-on-secondary">
                  DEUTSCHE WELLE A1
                </span>
                <h2 className="text-sm sm:text-base font-headline font-bold text-on-surface">
                  Nicos Weg – Einfach Deutsch lernen (76 tập đầy đủ)
                </h2>
              </div>
              <p className="text-xs text-outline">
                Đã nạp sẵn 100% phụ đề tiếng Đức chuẩn. Bạn có thể bấm vào bất kỳ tập nào để học ngay lập tức.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const ep1 = NICOS_WEG_PLAYLIST.episodes.find(e => e.episodeNumber === 1);
                if (ep1) onSelectEpisode(ep1);
              }}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-on-primary font-bold text-xs shadow-md shadow-secondary/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Bắt đầu từ Tập 1: Hallo!</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo số tập hoặc tên bài (VD: Hallo, Tập 5, Essen, Wohnung)..."
                  className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-secondary rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="text-xs text-outline font-medium text-right">
                Hiển thị <span className="font-bold text-on-surface">{filteredA1Episodes.length}</span> / {NICOS_WEG_PLAYLIST.episodes.length} tập
              </div>
            </div>

            {/* Stages pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {stageOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedStage(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStage === opt.id
                      ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredA1Episodes.map((ep) => {
              const isCompleted = completedVideoIds.includes(ep.videoId);
              const isCurrent = currentVideoId === ep.videoId;

              return (
                <div
                  key={ep.id}
                  onClick={() => onSelectEpisode(ep)}
                  className={`group relative flex flex-col justify-between rounded-2xl p-3.5 border transition-all cursor-pointer hover:scale-[1.02] shadow-sm hover:shadow-xl ${
                    isCurrent
                      ? 'bg-secondary-container/20 border-secondary ring-1 ring-secondary'
                      : isCompleted
                      ? 'bg-surface-container/80 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 hover:border-secondary/40'
                  }`}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-high mb-3">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${ep.videoId}/0.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                        {ep.episodeNumber > 0 ? `Tập ${ep.episodeNumber}` : 'Special'}
                      </span>
                      {ep.category !== 'Bài học A1' && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-secondary/80 backdrop-blur-md text-white">
                          {ep.category}
                        </span>
                      )}
                    </div>

                    {isCompleted && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã học</span>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-on-secondary flex items-center gap-1 shadow-xs animate-pulse">
                        <span>Đang học</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-secondary" />
                        {ep.sentenceCount} câu
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-secondary backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110">
                        <Play className="w-3 h-3 fill-current text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-headline font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {ep.title}
                      </h3>
                      <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
                        DW Deutsch lernen • A1
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-outline-variant/20">
                      <span className="text-outline">
                        {ep.sentenceCount} câu đàm thoại
                      </span>
                      <span className="font-semibold text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
                        Học tập này
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredA1Episodes.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
              <BookOpen className="w-8 h-8 text-outline mx-auto" />
              <h3 className="text-sm font-semibold text-on-surface">Không tìm thấy tập nào</h3>
              <p className="text-xs text-outline max-w-sm mx-auto">
                Không có tập phim nào khớp với từ khóa "{searchQuery}". Bạn hãy thử tìm với từ khác hoặc xóa bộ lọc.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedStage('all'); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-high text-secondary hover:bg-surface-bright"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONTENT FOR LEVEL A2 */}
      {activeLevel === 'A2' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-secondary/15 via-surface-container-high to-surface-container border border-secondary/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-on-secondary">
                TRÌNH ĐỘ A2
              </span>
              <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
                Nicos Weg A2 – Giao tiếp nâng cao & Công sở
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              Trình độ A2 giúp bạn làm chủ các thì quá khứ (Perfekt, Präteritum), mệnh đề phụ (weil, dass, wenn), so sánh tính từ và hội thoại thường nhật tại Đức. Dưới đây là các bài học mẫu bạn có thể trải nghiệm ngay:
            </p>
          </div>

          {/* A2 Sample Lessons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {a2PreviewLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson({ videoId: lesson.videoId, language: 'de' })}
                className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-secondary/40 transition-all cursor-pointer group shadow-xs hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/20">
                    🇩🇪 A2 Chuẩn
                  </span>
                  <span className="text-xs text-outline font-medium">{lesson.sentencesCount} câu</span>
                </div>
                <h3 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                  {lesson.title}
                </h3>
                <p className="text-xs text-outline leading-relaxed mb-3">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-secondary pt-2 border-t border-outline-variant/20">
                  <span>{lesson.author}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Luyện tập ngay
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Notice */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/50 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-secondary mx-auto" />
            <h4 className="text-xs font-bold text-on-surface">Trọn bộ 76 tập Nicos Weg A2 đang được chuẩn bị</h4>
            <p className="text-[11px] text-outline max-w-md mx-auto">
              Hệ thống sẽ cập nhật đầy đủ toàn bộ 76 video của A2 kèm phụ đề chuẩn trong các bản cập nhật sắp tới!
            </p>
          </div>
        </div>
      )}

      {/* CONTENT FOR LEVEL B1 */}
      {activeLevel === 'B1' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-surface-container-high to-surface-container border border-primary/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                TRÌNH ĐỘ B1
              </span>
              <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
                Nicos Weg B1 & Deutsch im Job
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              Trình độ B1 chuẩn bị cho bạn chứng chỉ Goethe-Zertifikat B1 hoặc telc Deutsch B1 để xin việc, học nghề (Ausbildung) và định cư tại Đức.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-3">
            <Award className="w-10 h-10 text-primary mx-auto opacity-70" />
            <h3 className="text-sm font-bold text-on-surface">Cấp độ B1 đang trong kế hoạch phát hành</h3>
            <p className="text-xs text-outline max-w-md mx-auto">
              Hãy hoàn thành thật tốt 76 tập cấp độ A1 để xây dựng nền tảng từ vựng và ngữ pháp vững chắc trước khi tiến lên B1 nhé!
            </p>
            <button
              type="button"
              onClick={() => setActiveLevel('A1')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-xs hover:scale-105 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Chuyển về học Trình độ A1</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENT FOR ENGLISH */}
      {activeLevel === 'EN' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-surface-container-high to-surface-container border border-primary/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                ENGLISH DAILY
              </span>
              <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
                Luyện nói đuổi & Nghe chép Tiếng Anh thực tế
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
              Các bài học đàm thoại tiếng Anh bản xứ với ngữ điệu chuẩn Anh - Mỹ, phù hợp luyện shadowing và dictation hàng ngày.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {englishLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson({ videoId: lesson.videoId, language: 'en' })}
                className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-xs hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/20">
                    🇬🇧 English Daily
                  </span>
                  <span className="text-xs text-outline font-medium">{lesson.sentencesCount} câu</span>
                </div>
                <h3 className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                  {lesson.title}
                </h3>
                <p className="text-xs text-outline leading-relaxed mb-3">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-primary pt-2 border-t border-outline-variant/20">
                  <span>{lesson.author}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Luyện tập ngay
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
