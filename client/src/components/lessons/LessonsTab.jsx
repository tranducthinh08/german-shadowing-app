import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Play,
  Search,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Languages
} from 'lucide-react';
import { NICOS_WEG_PLAYLIST } from '../../data/nicosWegPlaylist.js';
import LessonLevelSelector from './LessonLevelSelector';
import LessonEpisodeCard from './LessonEpisodeCard';
import OtherLevelsView from './OtherLevelsView';

export default function LessonsTab({
  onSelectEpisode,
  onSelectLesson,
  completedVideoIds = [],
  currentVideoId = null,
  onBackToStudio,
  onOpenAlphabet
}) {
  const [activeLevel, setActiveLevel] = useState('A1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');

  const levels = [
    {
      id: 'A1',
      title: 'Trình độ A1',
      subtitle: 'Nicos Weg (DW)',
      lang: '🇩🇪 Đức',
      desc: 'Người mới bắt đầu từ con số 0',
      status: 'available',
      badge: '76 tập đầy đủ',
      episodesCount: '80 tập',
      sentencesCount: NICOS_WEG_PLAYLIST.totalSentences
    },
    {
      id: 'A2',
      title: 'Trình độ A2',
      subtitle: 'Sơ trung cấp',
      lang: '🇩🇪 Đức',
      desc: 'Giao tiếp hàng ngày & công sở',
      status: 'preview',
      badge: 'Sắp ra mắt',
      episodesCount: '4 bài học mẫu',
      sentencesCount: 120
    },
    {
      id: 'B1',
      title: 'Trình độ B1',
      subtitle: 'Trung cấp B1',
      lang: '🇩🇪 Đức',
      desc: 'Luyện thi chứng chỉ & định cư',
      status: 'coming_soon',
      badge: 'Lộ trình 2025',
      episodesCount: 'Đang biên tập',
      sentencesCount: 0
    },
    {
      id: 'EN',
      title: 'Tiếng Anh',
      subtitle: 'English Daily',
      lang: '🇬🇧 Anh',
      desc: 'Shadowing & Dictation chuẩn',
      status: 'available',
      badge: 'Bổ trợ',
      episodesCount: '4 bài mẫu',
      sentencesCount: 160
    }
  ];

  const stageOptions = [
    { id: 'all', label: 'Tất cả 76 tập' },
    { id: 'stage_1', label: 'Chặng 1: Làm quen & Gặp gỡ (Tập 1 - 18)' },
    { id: 'stage_2', label: 'Chặng 2: Tìm đồ & Cuộc sống (Tập 19 - 36)' },
    { id: 'stage_3', label: 'Chặng 3: Gia đình & Công việc (Tập 37 - 54)' },
    { id: 'stage_4', label: 'Chặng 4: Hội nhập & Tương lai (Tập 55 - 76)' },
    { id: 'special', label: 'Tập đặc biệt' }
  ];

  const a2PreviewLessons = [
    {
      id: 'a2_1',
      title: 'A2 - Bài 1: Đặt bàn và gọi món tại quán ăn Đức',
      description: 'Luyện cấu trúc nhã nhặn "Ich möchte gern...", "Könnten Sie bitte...", các thì quá khứ Perfekt.',
      sentencesCount: 28,
      author: 'PolyGlot Curriculum',
      videoId: 'dC6ZGLzdaTs'
    },
    {
      id: 'a2_2',
      title: 'A2 - Bài 2: Hỏi đường và phương tiện công cộng tại Berlin',
      description: 'Làm chủ giới từ chỉ phương hướng (nach, zu, an, in) và cách hỏi đường tự nhiên.',
      sentencesCount: 32,
      author: 'PolyGlot Curriculum',
      videoId: 'SrcZ2ud4T3o'
    }
  ];

  const englishLessons = [
    {
      id: 'en_1',
      title: 'Daily English Conversation: Meeting New People',
      description: 'Luyện nói đuổi và ngữ điệu tự nhiên chuẩn bản ngữ khi làm quen người mới.',
      sentencesCount: 24,
      author: 'English Lab',
      videoId: 'upvuC9FR-xU'
    },
    {
      id: 'en_2',
      title: 'At the Coffee Shop: Ordering & Small Talk',
      description: 'Từ vựng và phản xạ giao tiếp tại quán cà phê.',
      sentencesCount: 26,
      author: 'English Lab',
      videoId: 'idFrq0H1Af0'
    }
  ];

  const filteredA1Episodes = useMemo(() => {
    let list = NICOS_WEG_PLAYLIST.episodes;

    if (selectedStage !== 'all') {
      if (selectedStage === 'special') {
        list = list.filter((ep) => ep.category !== 'Bài học A1');
      } else if (selectedStage.startsWith('stage_')) {
        const stageNum = parseInt(selectedStage.replace('stage_', ''), 10);
        list = list.filter((ep) => {
          const num = ep.episodeNumber;
          if (stageNum === 1) return num >= 1 && num <= 18;
          if (stageNum === 2) return num >= 19 && num <= 36;
          if (stageNum === 3) return num >= 37 && num <= 54;
          if (stageNum === 4) return num >= 55 && num <= 76;
          return true;
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (ep) =>
          (ep.title && ep.title.toLowerCase().includes(q)) ||
          (ep.category && ep.category.toLowerCase().includes(q)) ||
          (ep.episodeNumber && ep.episodeNumber.toString() === q)
      );
    }

    return list;
  }, [selectedStage, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container via-surface-container/90 to-surface-container-high border border-outline-variant/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Thư viện giáo trình chuẩn Châu Âu (CEFR)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-black text-on-surface tracking-tight">
              Lộ trình bài học Tiếng Đức & Tiếng Anh
            </h1>
            <p className="text-xs sm:text-sm text-outline leading-relaxed">
              Trọn bộ 76 tập giáo trình phim Nicos Weg (Deutsche Welle) từ vỡ lòng A1 đến nâng cao, đi kèm phụ đề đối soát từng câu.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-outline">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-secondary" />
                <span><strong className="text-on-surface">80</strong> bài học có sẵn</span>
              </div>
              <span>•</span>
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
      <LessonLevelSelector
        levels={levels}
        activeLevel={activeLevel}
        onSelectLevel={setActiveLevel}
      />

      {/* Quick link to Alphabet & Pronunciation if available */}
      {onOpenAlphabet && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-secondary/15 via-surface-container-high/80 to-surface-container-low border border-secondary/30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-on-surface">Khởi đầu từ con số 0: Bảng chữ cái & Âm khó (ABC)</div>
              <div className="text-[11px] text-on-surface-variant">Học cách phát âm 41 âm vị, mẹo khẩu hình Ä, Ö, Ü, ß và bài ôn luyện mỗi ngày</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAlphabet}
            className="px-3.5 py-1.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <span>Học Bảng chữ cái</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            {filteredA1Episodes.map((ep) => (
              <LessonEpisodeCard
                key={ep.id}
                ep={ep}
                isCompleted={completedVideoIds.includes(ep.videoId)}
                isCurrent={currentVideoId === ep.videoId}
                onSelectEpisode={onSelectEpisode}
              />
            ))}
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

      {/* CONTENT FOR OTHER LEVELS (A2, B1, EN) */}
      <OtherLevelsView
        activeLevel={activeLevel}
        onSelectLesson={onSelectLesson}
        setActiveLevel={setActiveLevel}
        a2PreviewLessons={a2PreviewLessons}
        englishLessons={englishLessons}
      />
    </div>
  );
}
