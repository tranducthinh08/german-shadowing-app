import React from 'react';
import { X, Sparkles, PlayCircle, BookOpen } from 'lucide-react';

export default function SampleModal({
  isOpen,
  onClose,
  samples = [],
  onSelectSample
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-surface-container-lowest/80 backdrop-blur-2xl animate-fade-in font-sans overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col my-auto transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-secondary shadow-inner border border-outline-variant/30">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">Kho bài học mẫu có sẵn</h2>
              <p className="text-xs text-outline">Luyện tập ngay không cần tìm link YouTube</p>
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            {samples.map((item) => (
              <div
                key={item.videoId}
                onClick={() => {
                  onSelectSample(item.videoId, item.language);
                  onClose();
                }}
                className="group p-3.5 rounded-2xl bg-surface-container/70 hover:bg-surface-container-high/80 border border-outline-variant/30 hover:border-secondary/50 flex items-center gap-3.5 cursor-pointer transition-all shadow-sm"
              >
                <div className="relative w-28 h-18 rounded-xl overflow-hidden shrink-0 bg-surface-container-lowest border border-outline-variant/30">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-secondary-container/20 text-secondary border border-secondary/30">
                      {item.language === 'de' ? '🇩🇪 Tiếng Đức' : '🇬🇧 Tiếng Anh'}
                    </span>
                    <span className="text-xs text-outline">
                      {item.sentenceCount} câu luyện tập
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-headline font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-outline truncate">
                    Kênh: {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
