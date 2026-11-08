import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Lightbulb, Bot, BookOpen, Key, Check } from 'lucide-react';
import { translateWithAiApi } from '../../services/api';
import { getCurrentUser, getUserGeminiKey, saveUserSettings } from '../../utils/userStorage';

// In-memory session cache for instant translation switching
const translationCache = new Map();

export default function DictationTranslationCard({
  sentenceText,
  initialTranslation = '',
  language = 'de',
  isStandardMet = false,
  customApiKey = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [translationData, setTranslationData] = useState(() => {
    if (initialTranslation) {
      return { translation: initialTranslation, literal: '', terms: [], grammarTip: '', provider: 'preindexed' };
    }
    return null;
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInputVal, setKeyInputVal] = useState('');
  const [keySavedNotice, setKeySavedNotice] = useState(false);
  const autoOpenedRef = useRef(false);

  const cacheKey = `${language}:${sentenceText || ''}`;

  // Reset when sentence changes
  useEffect(() => {
    autoOpenedRef.current = false;
    setErrorMessage(null);
    if (translationCache.has(cacheKey)) {
      setTranslationData(translationCache.get(cacheKey));
    } else if (initialTranslation) {
      setTranslationData({ translation: initialTranslation, literal: '', terms: [], grammarTip: '', provider: 'preindexed' });
    } else {
      setTranslationData(null);
    }
    setIsOpen(false);
  }, [cacheKey, initialTranslation]);

  // Fetch translation data
  const handleFetchTranslation = async (shouldOpen = true) => {
    if (!sentenceText || !sentenceText.trim()) return;

    if (translationCache.has(cacheKey)) {
      setTranslationData(translationCache.get(cacheKey));
      if (shouldOpen) setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const activeKey = customApiKey || getUserGeminiKey(getCurrentUser()?.username);
      const result = await translateWithAiApi(sentenceText, language, activeKey);
      translationCache.set(cacheKey, result);
      setTranslationData(result);
      if (shouldOpen) setIsOpen(true);
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tải bản dịch');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto reveal when user completes or meets standard (>= 80%)
  useEffect(() => {
    if (isStandardMet && !autoOpenedRef.current && sentenceText) {
      autoOpenedRef.current = true;
      handleFetchTranslation(true);
    }
  }, [isStandardMet, sentenceText]);

  if (!sentenceText) return null;

  return (
    <div className="w-full rounded-xl bg-surface-container-high/80 border border-outline-variant/40 shadow-sm transition-all overflow-hidden text-xs">
      {/* Header bar / Toggle Button */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-highest/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/30">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-secondary" />
          </div>
          <div className="flex items-center gap-1.5 font-headline font-semibold text-on-surface">
            <span>Dịch nghĩa AI</span>
            {translationData?.provider === 'gemini' && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-mono border border-primary/30">
                Gemini
              </span>
            )}
            {translationData?.provider === 'fallback' && (
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-outline text-[10px] font-mono">
                Dịch tự động
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const user = getCurrentUser();
              if (!showKeyInput) {
                setKeyInputVal(getUserGeminiKey(user?.username) || '');
              }
              setShowKeyInput(!showKeyInput);
            }}
            className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
            title="Cài đặt Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isOpen && !translationData) {
                handleFetchTranslation(true);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary border border-secondary/40 font-medium transition-all cursor-pointer focus-ring"
            title={isOpen ? 'Thu gọn bản dịch' : 'Bấm để dịch câu này bằng AI'}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang dịch...</span>
              </>
            ) : isOpen ? (
              <>
                <span>Thu gọn</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Xem bản dịch</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Key Configuration Bar */}
      {showKeyInput && (
        <div className="p-3 bg-surface-container border-b border-outline-variant/30 flex items-center gap-2 animate-fade-in">
          <input
            type="password"
            value={keyInputVal}
            onChange={(e) => setKeyInputVal(e.target.value)}
            placeholder="Dán Gemini API Key (AIzaSy...)"
            className="flex-1 px-2.5 py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs font-mono text-on-surface focus:outline-none focus:border-secondary"
          />
          <button
            type="button"
            onClick={() => {
              const user = getCurrentUser();
              if (user?.username) {
                saveUserSettings(user.username, { geminiApiKey: keyInputVal.trim() });
                translationCache.delete(cacheKey);
                setKeySavedNotice(true);
                setTimeout(() => setKeySavedNotice(false), 2000);
                handleFetchTranslation(true);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold shrink-0 hover:brightness-110 cursor-pointer flex items-center gap-1"
          >
            {keySavedNotice ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
            <span>{keySavedNotice ? 'Đã lưu!' : 'Lưu Key'}</span>
          </button>
        </div>
      )}

      {/* Expanded Content View */}
      {isOpen && (
        <div className="p-3.5 sm:p-4 space-y-3 border-t border-outline-variant/30 animate-fade-in">
          {isLoading && !translationData ? (
            <div className="flex items-center justify-center py-4 text-outline gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-secondary" />
              <span>Đang phân tích và dịch câu với Gemini AI...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-2.5 rounded-lg bg-rose-950/20 text-rose-300 border border-rose-500/30 text-xs">
              {errorMessage}
            </div>
          ) : translationData ? (
            <>
              {/* Natural Vietnamese Translation */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-outline uppercase tracking-wider">
                  Bản dịch tiếng Việt tự nhiên:
                </span>
                <div className="p-2.5 rounded-lg bg-surface-container-lowest/90 border border-outline-variant/30 text-sm font-headline text-on-surface leading-relaxed">
                  {translationData.translation ? (
                    translationData.translation
                  ) : (
                    <div className="flex items-center justify-between text-xs text-outline">
                      <span>Chưa có bản dịch cho câu này.</span>
                      <button
                        type="button"
                        onClick={() => handleFetchTranslation(true)}
                        className="px-2.5 py-1 rounded-md bg-secondary/15 hover:bg-secondary/25 text-secondary font-bold cursor-pointer"
                      >
                        Thử dịch lại
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Literal Translation if present */}
              {translationData.literal && (
                <div className="text-xs text-outline flex items-start gap-1.5">
                  <span className="font-semibold text-secondary shrink-0">Nghĩa đen:</span>
                  <span className="italic text-on-surface-variant">{translationData.literal}</span>
                </div>
              )}

              {/* Key Vocabulary Terms */}
              {Array.isArray(translationData.terms) && translationData.terms.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-medium text-outline flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-secondary" />
                    <span>Từ vựng cốt lõi:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {translationData.terms.map((item, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/30 text-xs shadow-xs"
                      >
                        <span className="font-bold text-secondary font-headline">{item.term}</span>
                        <span className="text-outline">→</span>
                        <span className="text-on-surface">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar Tip Callout */}
              {translationData.grammarTip && (
                <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/30 flex items-start gap-2 text-xs">
                  <Lightbulb className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-secondary mr-1">Mẹo ngữ pháp:</span>
                    <span className="text-on-surface-variant leading-relaxed">
                      {translationData.grammarTip}
                    </span>
                  </div>
                </div>
              )}

              {/* Future-Ready Footer Action */}
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] text-outline">
                <span className="italic">
                  Học từ vựng và cấu trúc câu qua bản dịch ngữ cảnh
                </span>
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-outline/60 border border-outline-variant/20 cursor-not-allowed select-none"
                  title="Tính năng Hỏi đáp ngữ pháp AI tương tác sâu sẽ sẵn sàng ở bản cập nhật tiếp theo"
                >
                  <Bot className="w-3 h-3 opacity-60" />
                  <span>Hỏi đáp AI (Sắp ra mắt)</span>
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
