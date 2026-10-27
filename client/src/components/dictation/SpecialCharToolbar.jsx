import React from 'react';
import { Tag, Zap } from 'lucide-react';
import { GERMAN_SPECIAL_CHARS } from '../../utils/germanUtils';

export default function SpecialCharToolbar({
  language = 'de',
  properNouns = [],
  onInsertChar,
  onInsertProperNoun,
  isLiveCheck,
  onToggleLiveCheck,
  strictGerman,
  onToggleStrict
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Proper Nouns Hint Bar */}
      {properNouns.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs">
          <span className="font-semibold text-secondary flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-secondary" />
            <span>Tên riêng:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {properNouns.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onInsertProperNoun && onInsertProperNoun(name)}
                className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-xs flex items-center gap-1 cursor-pointer border border-outline-variant/30"
                title={`Nhấn để chèn "${name}"`}
              >
                <span>{name}</span>
                <span className="text-[10px] text-secondary font-bold">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* German Special Characters Virtual Keyboard & Toggles */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {language === 'de' && (
          <>
            <span className="text-outline text-xs mr-0.5">Ký tự Đức:</span>
            {GERMAN_SPECIAL_CHARS.map(({ char, label }) => (
              <button
                key={char}
                type="button"
                onClick={() => onInsertChar && onInsertChar(char)}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-headline font-bold text-xs flex items-center justify-center transition-all shadow-xs cursor-pointer border border-outline-variant/30 active:scale-95"
                title={`Chèn ký tự ${char}`}
              >
                {label}
              </button>
            ))}
            <span className="text-outline-variant mx-1">|</span>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* Live Check Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-outline cursor-pointer select-none hover:text-on-surface transition-colors" title="Bật/tắt kiểm tra từ Xanh/Đỏ ngay khi gõ">
            <input
              type="checkbox"
              checked={isLiveCheck}
              onChange={(e) => onToggleLiveCheck && onToggleLiveCheck(e.target.checked)}
              className="rounded bg-surface-container border-outline-variant text-secondary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-secondary" />
              <span>Kiểm tra tức thì (Xanh/Đỏ)</span>
            </span>
          </label>

          {language === 'de' && (
            <label className="flex items-center gap-1.5 text-xs text-outline cursor-pointer select-none hover:text-on-surface transition-colors">
              <input
                type="checkbox"
                checked={strictGerman}
                onChange={(e) => onToggleStrict && onToggleStrict(e.target.checked)}
                className="rounded bg-surface-container border-outline-variant text-secondary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Bắt buộc viết hoa danh từ</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
