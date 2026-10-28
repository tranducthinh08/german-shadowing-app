import React, { useState } from 'react';
import {
  Headphones, Home, Flame, Languages, Bookmark, ChevronLeft,
  ChevronRight, ChevronDown, Mic, PenTool, BookOpen, History,
  Trophy, Settings, X, Sparkles
} from 'lucide-react';

export default function AppSidebar({
  activeTab = 'studio',
  studyMode = 'dictation',
  onChangeTab,
  savedVocabCount = 0,
  historyCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onOpenVocab,
  onOpenGamification,
  onOpenUserProfile,
  currentUser
}) {
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(true);

  const handleNavClick = (tabId, mode) => {
    if (tabId === 'vocab') {
      if (onOpenVocab) onOpenVocab();
    } else if (tabId === 'gamification') {
      if (onOpenGamification) onOpenGamification();
    } else if (tabId === 'profile') {
      if (onOpenUserProfile) onOpenUserProfile();
    } else if (tabId === 'today') {
      if (onChangeTab) onChangeTab('alphabet');
    } else {
      if (onChangeTab) onChangeTab(tabId, mode);
    }
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const isSkillsActive = activeTab === 'speaking_coach' || activeTab === 'lessons' || activeTab === 'playlist' ||
    (activeTab === 'studio' && (studyMode === 'shadowing' || studyMode === 'dictation'));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#070b14]/95 backdrop-blur-2xl border-r border-outline-variant/30 transition-all duration-300 ${
          isMobileOpen
            ? 'translate-x-0 w-72 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Header / Brand Logo */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-outline-variant/20 shrink-0">
          <div
            onClick={() => handleNavClick('studio')}
            className={`flex items-center gap-2.5 cursor-pointer group ${isCollapsed ? 'justify-center w-full' : ''}`}
            title="PolyGlot Studio"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-inverse-primary to-secondary flex items-center justify-center shadow-md shadow-primary-container/20 group-hover:scale-105 transition-transform shrink-0">
              <Headphones className="w-4 h-4 text-on-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline font-bold text-sm tracking-tight bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent truncate">
                  PolyGlot Studio
                </span>
                <span className="text-[10px] text-outline font-medium tracking-wide">
                  German Mastery AI
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin">
          {/* 1. Trang chủ */}
          <button
            type="button"
            onClick={() => handleNavClick('studio')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'studio' && !studyMode
                ? 'bg-secondary-container/25 text-on-surface border-l-4 border-secondary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Trang chủ / Studio"
          >
            <Home className="w-4 h-4 text-secondary shrink-0" />
            {!isCollapsed && <span>Trang chủ</span>}
          </button>

          {/* 2. Hôm nay (Mục tiêu & 5 âm tiêu điểm) */}
          <button
            type="button"
            onClick={() => handleNavClick('today')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Hôm nay: 5 âm tiêu điểm & Nhiệm vụ ngày"
          >
            <Flame className="w-4 h-4 text-tertiary shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span>Hôm nay</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-tertiary/20 text-tertiary">
                  5 âm
                </span>
              </div>
            )}
          </button>

          {/* 3. Bắt đầu từ 0 (Bảng chữ cái) */}
          <button
            type="button"
            onClick={() => handleNavClick('alphabet')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'alphabet'
                ? 'bg-secondary-container/25 text-on-surface border-l-4 border-secondary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Bắt đầu từ 0: Bảng chữ cái ABC & Umlaute"
          >
            <Languages className="w-4 h-4 text-secondary shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span>Bắt đầu từ 0</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-secondary/15 text-secondary">
                  ABC
                </span>
              </div>
            )}
          </button>

          {/* 4. Sổ từ vựng */}
          <button
            type="button"
            onClick={() => handleNavClick('vocab')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Sổ từ vựng cá nhân"
          >
            <Bookmark className="w-4 h-4 text-tertiary shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span>Từ vựng</span>
                {savedVocabCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-tertiary-container text-on-tertiary-container shadow-xs">
                    {savedVocabCount}
                  </span>
                )}
              </div>
            )}
          </button>

          {/* 5. Nhóm Kỹ năng (Expandable Accordion) */}
          <div className="pt-2">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSkillsActive ? 'text-secondary bg-surface-container-low' : 'text-outline hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span className="uppercase tracking-wider text-[11px]">Kỹ năng</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSkillsExpanded ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <div className="my-1 border-t border-outline-variant/30" />
            )}

            {/* Sub-items under Kỹ năng */}
            {(isSkillsExpanded || isCollapsed) && (
              <div className={`space-y-0.5 mt-1 ${!isCollapsed ? 'pl-2' : ''}`}>
                {/* 5.1 Nghe (Shadowing) */}
                <button
                  type="button"
                  onClick={() => handleNavClick('studio', 'shadowing')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'studio' && studyMode === 'shadowing'
                      ? 'bg-secondary-container/25 text-secondary border-l-3 border-secondary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Nghe & Nhại giọng (Shadowing)"
                >
                  <Headphones className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {!isCollapsed && <span>Nghe (Shadowing)</span>}
                </button>

                {/* 5.2 Luyện nói AI (Speaking Coach) */}
                <button
                  type="button"
                  onClick={() => handleNavClick('speaking_coach')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'speaking_coach'
                      ? 'bg-secondary-container/25 text-secondary border-l-3 border-secondary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Luyện phát âm AI (Speaking Coach)"
                >
                  <Mic className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span>Nói (Speaking Coach)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-secondary/20 text-secondary">
                        AI
                      </span>
                    </div>
                  )}
                </button>

                {/* 5.3 Viết (Dictation) */}
                <button
                  type="button"
                  onClick={() => handleNavClick('studio', 'dictation')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'studio' && studyMode === 'dictation'
                      ? 'bg-secondary-container/25 text-secondary border-l-3 border-secondary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Viết (Chép chính tả / Dictation)"
                >
                  <PenTool className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {!isCollapsed && <span>Viết (Chép chính tả)</span>}
                </button>

                {/* 5.4 Bài học giáo trình (Nicos Weg) */}
                <button
                  type="button"
                  onClick={() => handleNavClick('lessons')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'lessons' || activeTab === 'playlist'
                      ? 'bg-secondary-container/25 text-secondary border-l-3 border-secondary font-bold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Bài học theo giáo trình: Nicos Weg A1 • A2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span>Bài học Nicos Weg</span>
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-surface-container text-outline">
                        80 tập
                      </span>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-outline-variant/20" />

          {/* 6. Lịch sử học tập */}
          <button
            type="button"
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-secondary-container/25 text-on-surface border-l-4 border-secondary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Lịch sử bài học đã luyện"
          >
            <History className="w-4 h-4 text-outline shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span>Lịch sử bài học</span>
                {historyCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-surface-container text-outline">
                    {historyCount}
                  </span>
                )}
              </div>
            )}
          </button>

          {/* 7. Thành tích & Gamification */}
          <button
            type="button"
            onClick={() => handleNavClick('gamification')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Thành tích, Cấp độ Level & Huy hiệu"
          >
            <Trophy className="w-4 h-4 text-tertiary shrink-0" />
            {!isCollapsed && <span>Thành tích & Level</span>}
          </button>
        </div>

        {/* Footer User Profile Pill */}
        <div className="p-3 border-t border-outline-variant/20 shrink-0 bg-surface-container-lowest/50">
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 transition-all cursor-pointer text-left ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
            title={`Người dùng: ${currentUser?.username || 'Khách'}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs shadow-inner shrink-0">
              {currentUser?.avatar || '👤'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-on-surface block truncate">
                  {currentUser?.username || 'Đăng nhập'}
                </span>
                <span className="text-[10px] text-outline block">
                  Cài đặt tài khoản
                </span>
              </div>
            )}
            {!isCollapsed && <Settings className="w-3.5 h-3.5 text-outline shrink-0" />}
          </button>
        </div>
      </aside>
    </>
  );
}
