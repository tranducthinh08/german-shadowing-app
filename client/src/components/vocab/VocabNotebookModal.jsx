import React, { useState } from 'react';
import { X, Bookmark, Trash2, Volume2, Download, Search, Sparkles, BookOpen, Filter } from 'lucide-react';
import { getGermanNounInfo, getGenderStyles } from '../../utils/germanGrammar';

export default function VocabNotebookModal({
  isOpen,
  onClose,
  savedWords = [],
  onRemoveWord,
  onClearAll
}) {
  const [filterLang, setFilterLang] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'nouns' | 'other'
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = savedWords.filter((item) => {
    const matchLang = filterLang === 'all' || item.language === filterLang;
    const matchSearch = item.word.toLowerCase().includes(search.toLowerCase()) ||
                        (item.context && item.context.toLowerCase().includes(search.toLowerCase()));
    
    const nounInfo = item.language === 'de' ? getGermanNounInfo(item.word) : null;
    const isNoun = Boolean(nounInfo);

    if (filterType === 'nouns') {
      return matchLang && matchSearch && isNoun;
    }
    return matchLang && matchSearch;
  });

  const handleSpeak = (word, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = lang === 'de' ? 'de-DE' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedWords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `polyglot-vocab-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto transition-all">
        
        {/* Modal Top Header (Google Stitch Vault Spec) */}
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary-container/30 to-primary/20 flex items-center justify-center text-secondary shadow-lg shadow-secondary/10 shrink-0 border border-secondary/30">
              <Bookmark className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-[10px] font-bold tracking-wider uppercase">
                  Vault Module
                </span>
                <span className="text-outline text-xs">•</span>
                <span className="text-xs text-outline">Kho từ vựng cá nhân</span>
              </div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Sổ Từ Vựng & Tra Cứu 1-Chạm ({savedWords.length} từ)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-outline-variant/30 bg-surface-container/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-outline pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm từ vựng hoặc câu ngữ cảnh..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-full text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterType(filterType === 'nouns' ? 'all' : 'nouns')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                filterType === 'nouns'
                  ? 'bg-secondary-container text-on-secondary-container border-secondary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant/30'
              }`}
            >
              🇩🇪 Chỉ danh từ (der/die/das)
            </button>

            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              aria-label="Lọc theo ngôn ngữ"
              className="bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-full px-3 py-1.5 focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="all">Mọi ngôn ngữ</option>
              <option value="de">🇩🇪 Tiếng Đức</option>
              <option value="en">🇬🇧 Tiếng Anh</option>
            </select>

            {savedWords.length > 0 && (
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30 rounded-full transition-all text-xs font-semibold cursor-pointer shadow-sm"
                title="Tải về file JSON"
              >
                <Download className="w-3.5 h-3.5 text-secondary" />
                <span>Xuất file</span>
              </button>
            )}
          </div>
        </div>

        {/* Word Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-outline">
              <Bookmark className="w-10 h-10 mx-auto text-outline-variant mb-2 opacity-50" />
              <p className="text-sm font-headline font-semibold text-on-surface">Không có từ vựng nào</p>
              <p className="text-xs mt-1">Click vào bất kỳ từ nào trên kịch bản video để tra từ và bấm "Lưu từ".</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const nounInfo = item.language === 'de' ? getGermanNounInfo(item.word) : null;
              const genderStyle = nounInfo ? getGenderStyles(nounInfo.gender) : null;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-surface-container/80 border border-outline-variant/30 hover:border-secondary/40 transition-all flex flex-col gap-2 shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {genderStyle && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${genderStyle.pillClass}`}>
                          {genderStyle.article}
                        </span>
                      )}
                      <h4 className="font-headline font-bold text-base text-on-surface tracking-wide">
                        {item.word}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleSpeak(item.word, item.language)}
                        className="p-1 rounded-full text-secondary hover:bg-surface-container-highest transition-all"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveWord(item.word)}
                      className="text-outline hover:text-error transition-colors p-1"
                      title="Xóa khỏi sổ tay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.context && (
                    <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 text-xs text-on-surface-variant italic">
                      "{item.context}"
                    </div>
                  )}

                  {nounInfo && nounInfo.vi && (
                    <div className="text-xs text-outline flex items-center gap-1.5 pt-1">
                      <span>Nghĩa tiếng Việt:</span>
                      <strong className="text-on-surface">{nounInfo.vi}</strong>
                      {nounInfo.plural && (
                        <span className="text-[11px] text-primary">
                          (Số nhiều: die {nounInfo.plural})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
