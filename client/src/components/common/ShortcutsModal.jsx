import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Tab', desc: 'Nghe lại câu hiện tại (Replay Segment)' },
    { key: 'Shift + Tab', desc: 'Nghe lại câu với tốc độ chậm (0.75x)' },
    { key: 'Enter', desc: 'Nộp bài kiểm tra / Chuyển sang câu tiếp khi đạt chuẩn' },
    { key: 'Ctrl / Cmd + →', desc: 'Chuyển nhanh sang câu tiếp theo' },
    { key: 'Ctrl / Cmd + ←', desc: 'Quay lại câu trước đó' },
    { key: 'Space', desc: 'Phát / Tạm dừng câu hiện tại' },
    { key: 'L', desc: 'Bật / Tắt chế độ lặp lại câu (Loop)' },
    { key: 'ä, ö, ü, ß', desc: 'Chèn nhanh ký tự đặc biệt tiếng Đức hoặc tên riêng' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl p-5 sm:p-6 space-y-4 my-auto transition-all">
        
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary border border-outline-variant/30 shadow-inner">
              <Keyboard className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">Phím tắt thao tác nhanh</h2>
              <p className="text-[11px] text-outline">Tối ưu tốc độ luyện phản xạ ngôn ngữ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/20 text-xs">
              <span className="text-on-surface-variant font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 font-mono text-secondary font-bold shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary-container text-on-primary-container text-xs font-headline font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>

      </div>
    </div>
  );
}
