import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  Search,
  Bookmark,
  History,
  HelpCircle,
  Trophy,
  Clipboard,
  ArrowRight,
  ChevronDown,
  PenTool,
  BookOpen,
  Languages
} from 'lucide-react';

export default function Header({
  activeTab = 'studio',
  onChangeTab,
  onLoadVideo,
  isLoading,
  currentLanguage,
  onChangeLanguage,
  onOpenVocab,
  savedVocabCount = 0,
  historyCount = 0,
  onOpenShortcuts,
  gamificationData,
  onOpenGamification,
  currentUser,
  onOpenUserProfile
}) {
  const [inputUrl, setInputUrl] = useState('');
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const learnDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isLearnDropdownOpen) return;

    function handleClickOutside(event) {
      if (learnDropdownRef.current && !learnDropdownRef.current.contains(event.target)) {
        setIsLearnDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLearnDropdownOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onLoadVideo(inputUrl.trim(), currentLanguage);
      if (onChangeTab) onChangeTab('studio');
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        onLoadVideo(text.trim(), currentLanguage);
        if (onChangeTab) onChangeTab('studio');
      }
    } catch (e) {
      // Clipboard access denied, keep manual input
    }
  };

  const streakCount = gamificationData?.streak?.currentStreak || 0;

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#070b14]/90 backdrop-blur-xl border-b border-outline-variant/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Logo & Main View Tabs */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => onChangeTab && onChangeTab('studio')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-inverse-primary to-secondary flex items-center justify-center shadow-md shadow-primary-container/20 group-hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4 text-on-primary" />
            </div>
            <div className="hidden lg:block">
              <span className="font-headline font-bold text-base tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                PolyGlot Studio
              </span>
            </div>
          </div>

          {/* Dedicated Navigation Tabs: Luyện tập | Học tập ▾ (Bảng chữ cái / Bài học) | Lịch sử */}
          <div className="flex items-center p-0.5 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => {
                if (onChangeTab) onChangeTab('studio');
                setIsLearnDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Luyện tập</span>
            </button>

            {/* Smart Learning Dropdown: Bảng chữ cái & Bài học */}
            <div className="relative" ref={learnDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLearnDropdownOpen(!isLearnDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'lessons' || activeTab === 'playlist' || activeTab === 'alphabet'
                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Chọn chương trình học: Bảng chữ cái hoặc Bài học A1/A2"
              >
                {activeTab === 'alphabet' ? (
                  <>
                    <Languages className="w-3.5 h-3.5 text-secondary" />
                    <span>Bảng chữ cái</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-on-primary-container/20 text-on-primary-container">
                      ABC
                    </span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-secondary" />
                    <span>Bài học</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'lessons' || activeTab === 'playlist'
                        ? 'bg-on-primary-container/20 text-on-primary-container'
                        : 'bg-secondary/15 text-secondary'
                    }`}>
                      A1 • A2
                    </span>
                  </>
                )}
                <ChevronDown className={`w-3 h-3 text-outline transition-transform duration-200 ${isLearnDropdownOpen ? 'rotate-180 text-on-surface' : ''}`} />
              </button>

              {/* Glassmorphic Dropdown Menu */}
              {isLearnDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#070b14]/95 backdrop-blur-2xl rounded-2xl border border-outline-variant/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                    Nội dung học tập
                  </div>

                  {/* Option 1: Bảng chữ cái tiếng Đức */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onChangeTab) onChangeTab('alphabet');
                      setIsLearnDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      activeTab === 'alphabet'
                        ? 'bg-secondary-container/25 border border-secondary/40 text-on-surface'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Languages className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-on-surface">Bảng chữ cái (ABC)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-secondary/20 text-secondary">
                          41 âm
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        26 chữ, Umlaute, âm khó & ôn mỗi ngày
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Bài học Nicos Weg A1/A2 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onChangeTab) onChangeTab('lessons');
                      setIsLearnDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer mt-1 ${
                      activeTab === 'lessons' || activeTab === 'playlist'
                        ? 'bg-secondary-container/25 border border-secondary/40 text-on-surface'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-on-surface">Bài học theo giáo trình</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-secondary/20 text-secondary">
                          A1 • A2
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        Nicos Weg (DW) • 80 tập đầy đủ phụ đề
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onChangeTab) onChangeTab('history');
                setIsLearnDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử</span>
              {historyCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'history'
                    ? 'bg-on-primary-container/20 text-on-primary-container'
                    : 'bg-surface-container-high text-outline'
                }`}>
                  {historyCount}
                </span>
              )}
            </button>
          </div>

          {/* Compact Language Selector */}
          <div className="hidden sm:flex items-center p-0.5 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <button
              type="button"
              onClick={() => onChangeLanguage('de')}
              className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                currentLanguage === 'de'
                  ? 'bg-secondary-container/30 text-secondary'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Tiếng Đức (Deutsch)"
            >
              <span>🇩🇪</span>
              <span className="text-[11px] font-bold">DE</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-secondary-container/30 text-secondary'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Tiếng Anh (English)"
            >
              <span>🇬🇧</span>
              <span className="text-[11px] font-bold">EN</span>
            </button>
          </div>
        </div>

        {/* Center: Clean YouTube URL Input Bar */}
        <div className="flex-1 max-w-md mx-2 flex items-center gap-2">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-surface-container-low/90 rounded-full px-3 py-1 border border-outline-variant/40 focus-within:border-secondary transition-all shadow-xs">
            <Search className="w-3.5 h-3.5 text-secondary mr-2 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Dán link YouTube (VD: Nicos Weg, Easy German)..."
              className="w-full bg-transparent text-xs text-on-surface placeholder:text-outline focus:outline-none"
            />
            {!inputUrl && (
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="hidden md:flex ml-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-outline hover:text-on-surface hover:bg-surface-container-high transition-all items-center gap-1 shrink-0 cursor-pointer"
                title="Dán từ Clipboard"
              >
                <Clipboard className="w-3 h-3 text-secondary" />
                <span>Dán</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="ml-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-inverse-primary to-secondary-container text-on-primary shadow-xs hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{isLoading ? 'Đang tải...' : 'Tải'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* Right: Actions, Gamification, and User Profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Gamification Streak & Trophy Button */}
          <button
            type="button"
            onClick={onOpenGamification}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-tertiary hover:border-tertiary/60 hover:bg-surface-container-high transition-all cursor-pointer shadow-xs"
            title={`Thành tích & Thói quen (${streakCount} ngày streak)`}
          >
            <Trophy className="w-3.5 h-3.5 text-tertiary" />
            {streakCount > 0 && (
              <span className="text-xs font-bold text-on-surface">{streakCount}d</span>
            )}
          </button>

          {/* Sổ từ vựng */}
          <button
            type="button"
            onClick={onOpenVocab}
            className="relative p-2 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center cursor-pointer"
            title="Sổ từ vựng cá nhân"
          >
            <Bookmark className="w-3.5 h-3.5 text-secondary" />
            {savedVocabCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                {savedVocabCount}
              </span>
            )}
          </button>

          {/* Phím tắt */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:flex p-2 rounded-full bg-surface-container-low border border-outline-variant/30 text-outline hover:text-on-surface hover:bg-surface-container-high transition-all items-center justify-center cursor-pointer"
            title="Phím tắt học tập"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* User Profile Pill */}
          <div className="pl-1.5 border-l border-outline-variant/30">
            <button
              type="button"
              onClick={onOpenUserProfile}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 hover:border-outline hover:bg-surface-container-high transition-all cursor-pointer shadow-xs group"
              title={`Người dùng: ${currentUser?.username || 'Khách'} - Nhấp để đổi tài khoản`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs shadow-inner">
                {currentUser?.avatar || '👤'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-on-surface max-w-[90px] truncate">
                {currentUser?.username || 'Đăng nhập'}
              </span>
              <ChevronDown className="w-3 h-3 text-outline group-hover:text-on-surface transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
