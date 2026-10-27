import React from 'react';
import {
  Volume2,
  Mic,
  Square,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function ShadowingControls({
  onReplaySegment,
  isRecording = false,
  recordSeconds = 0,
  startRecording,
  stopRecording,
  audioUrl,
  isPlayingDual = false,
  handleDualPlayback
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* STEP 1: Nghe bản ngữ */}
      <div className="p-3.5 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-surface-container text-secondary flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Nghe bản ngữ</span>
            </span>
            <kbd className="px-1.5 py-0.2 rounded bg-surface-container-lowest text-[10px] text-outline font-mono">Tab</kbd>
          </div>
          <p className="text-[11px] text-outline mt-1 leading-snug">Lắng nghe ngữ điệu và trọng âm câu gốc.</p>
        </div>

        <button
          type="button"
          onClick={onReplaySegment}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-surface-container hover:bg-surface-bright border border-outline-variant/30 text-on-surface text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-secondary" />
          <span>Phát câu gốc</span>
        </button>
      </div>

      {/* STEP 2: Thu âm nhại giọng */}
      <div className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all shadow-xs ${
        isRecording
          ? 'bg-surface-container-high border-secondary shadow-md'
          : 'bg-surface-container-high/80 border-outline-variant/30'
      }`}>
        <div>
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Thu âm nhại giọng</span>
            </span>
            {isRecording && (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider animate-pulse">
                {recordSeconds}s Đang thu...
              </span>
            )}
          </div>
          <p className="text-[11px] text-outline mt-1 leading-snug">
            Bấm mic và nói toàn bộ câu (hệ thống sẽ thu liên tục qua quãng ngắt).
          </p>
        </div>

        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-gradient-to-r from-inverse-primary to-secondary-container text-on-primary text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Bắt đầu thu âm</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-error-container text-on-error-container text-xs font-bold shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Dừng thu & Chấm điểm</span>
          </button>
        )}
      </div>

      {/* STEP 3: Đối chiếu 2 chiều */}
      <div className="p-3.5 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-surface-container text-primary flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Đối chiếu 2 chiều</span>
            </span>
            {audioUrl && (
              <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3 text-secondary" />
                Đã có bản thu
              </span>
            )}
          </div>
          <p className="text-[11px] text-outline mt-1 leading-snug">Nghe tuần tự: Bản ngữ ➔ Giọng của bạn.</p>
        </div>

        <button
          type="button"
          disabled={!audioUrl || isPlayingDual}
          onClick={handleDualPlayback}
          className="w-full flex items-center justify-center gap-1 py-2 rounded-full bg-surface-container hover:bg-surface-bright disabled:opacity-30 border border-outline-variant/30 text-on-surface text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-secondary font-bold">Bản ngữ</span>
          <span className="text-outline">➔</span>
          <span className="text-primary font-bold">Bạn</span>
        </button>
      </div>
    </div>
  );
}
