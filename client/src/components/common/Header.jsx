import React, { useState } from 'react';
import {
  Menu, Search, Bookmark, HelpCircle, Trophy, Clipboard,
  ArrowRight, ChevronDown
} from 'lucide-react';

export default function Header({
  onOpenMobileMenu,
  onLoadVideo,
  isLoading,
  currentLanguage,
  onChangeLanguage,
  onOpenVocab,
  savedVocabCount = 0,
  onOpenShortcuts,
  gamificationData,
  onOpenGamification,
  currentUser,
  onOpenUserProfile
}) {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onLoadVideo(inputUrl.trim(), currentLanguage);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        onLoadVideo(text.trim(), currentLanguage);
      }
    } catch (e) {
      // Clipboard access denied, keep manual input
    }
  };

  const streakCount = gamificationData?.streak?.currentStreak || 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b14]/90 backdrop-blur-xl border-b border-outline-variant/30 transition-all">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Hamburger & Page Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex lg:hidden p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-colors cursor-pointer"
            title="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Language Selector */}
          <div className="flex items-center p-0.5 bg-surface-container-low rounded-lg border border-outline-variant/30">
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
        <div className="flex-1 max-w-xl mx-2 flex items-center gap-2">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-surface-container-low/90 rounded-full px-3.5 py-1.5 border border-outline-variant/40 focus-within:border-secondary transition-all shadow-xs">
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
                className="hidden md:flex ml-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-outline hover:text-on-surface hover:bg-surface-container-high transition-all items-center gap-1 shrink-0 cursor-pointer"
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

        {/* Right: Gamification, Vocab & User Profile */}
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

          {/* Sổ từ vựng nhanh */}
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
          <div className="pl-1 border-l border-outline-variant/30">
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
