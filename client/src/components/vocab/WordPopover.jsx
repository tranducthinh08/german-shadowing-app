import React, { useState, useEffect } from 'react';
import { X, Volume2, Bookmark, BookmarkCheck, ExternalLink, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { lookupWordApi } from '../../services/api';
import { getGermanNounInfo, getGenderStyles } from '../../utils/germanGrammar';

export default function WordPopover({
  word,
  language = 'de',
  onClose,
  onSaveWord,
  isSaved = false,
  contextSentence = ''
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // German noun gender metadata
  const nounInfo = language === 'de' ? getGermanNounInfo(word) : null;
  const genderStyle = nounInfo ? getGenderStyles(nounInfo.gender) : null;

  useEffect(() => {
    if (!word) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    lookupWordApi(word, language)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [word, language]);

  // Audio pronunciation
  const handleSpeak = (textToSpeak) => {
    const text = textToSpeak || word;
    if (data?.audioUrl && text === word) {
      const audio = new Audio(data.audioUrl);
      audio.play();
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl p-5 sm:p-6 space-y-4">
        
        {/* Header (Google Stitch Vault Spec) */}
        <div className="flex items-start justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-headline font-bold text-on-surface">{word}</h3>
                <button
                  type="button"
                  onClick={() => handleSpeak()}
                  className="p-1.5 text-secondary hover:bg-surface-container-high rounded-full transition-all cursor-pointer"
                  title="Phát âm từ này"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {data?.phonetic && (
                <span className="text-xs font-mono text-secondary font-semibold">{data.phonetic}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSaveWord({
                word,
                language,
                context: contextSentence,
                data,
                nounInfo
              })}
              className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm ${
                isSaved
                  ? 'bg-secondary-container/20 border-secondary text-secondary'
                  : 'bg-surface-container border-outline-variant/30 text-outline hover:text-secondary hover:bg-surface-container-high'
              }`}
              title={isSaved ? 'Đã lưu trong sổ từ' : 'Lưu vào sổ từ vựng'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-secondary" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* German Noun Gender Card (Google Stitch Spec) */}
        {nounInfo && genderStyle && (
          <div className={`p-4 rounded-2xl border ${genderStyle.bgClass} ${genderStyle.borderClass} space-y-2.5 animate-fade-in`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-headline font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-tertiary" />
                Giống danh từ tiếng Đức:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${genderStyle.pillClass}`}>
                {genderStyle.article} ({genderStyle.label})
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-outline">Đi kèm mạo từ:</span>
                <strong className={`font-mono text-sm ${genderStyle.textClass}`}>
                  {genderStyle.article} {word}
                </strong>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${genderStyle.article} ${word}`)}
                  className="text-secondary hover:underline cursor-pointer"
                  title="Nghe cả mạo từ và danh từ"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {nounInfo.plural && (
                <div className="text-outline text-xs">
                  Số nhiều: <strong className="text-primary font-mono">die {nounInfo.plural}</strong>
                </div>
              )}
            </div>

            {nounInfo.vi && (
              <p className="text-xs text-on-surface">
                Nghĩa tiếng Việt: <strong className="text-secondary">{nounInfo.vi}</strong>
              </p>
            )}

            <p className="text-[11px] text-outline leading-relaxed">
              💡 {nounInfo.reason}
            </p>
          </div>
        )}

        {/* Content body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-outline text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-secondary" />
            <span>Đang tra cứu từ điển...</span>
          </div>
        ) : error && !nounInfo ? (
          <div className="py-4 text-xs text-error">
            Không tìm thấy nghĩa của từ này trong từ điển offline. Bạn có thể tra nhanh trên các từ điển bên dưới.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {data?.meanings?.map((m, idx) => (
              <div key={idx} className="p-3 bg-surface-container/60 rounded-xl space-y-1.5 border border-outline-variant/20">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
                  {m.partOfSpeech}
                </span>
                {m.definitions?.map((d, dIdx) => (
                  <div key={dIdx} className="text-xs text-on-surface leading-relaxed">
                    <p>• {d.definition}</p>
                    {d.example && (
                      <p className="text-[11px] text-outline italic mt-0.5">
                        Ví dụ: "{d.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* External Dictionary Links */}
        <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs text-outline">
          <span>Tra trên từ điển ngoài:</span>
          <div className="flex items-center gap-2.5">
            {data?.dictionaryUrls?.leo && (
              <a
                href={data.dictionaryUrls.leo}
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary flex items-center gap-1 transition-colors font-medium"
              >
                LEO <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {data?.dictionaryUrls?.duden && (
              <a
                href={data.dictionaryUrls.duden}
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary flex items-center gap-1 transition-colors font-medium"
              >
                Duden <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {data?.dictionaryUrls?.cambridge && (
              <a
                href={data.dictionaryUrls.cambridge}
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary flex items-center gap-1 transition-colors font-medium"
              >
                Cambridge <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
